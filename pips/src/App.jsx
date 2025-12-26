import React, { useState, useEffect, useCallback, useRef } from "react";
import { generatePuzzle, checkCompletion } from "./utils/generator";
import { GameBoard } from "./components/GameBoard";
import { DominoPiece } from "./components/DominoPiece";
import { IconRestart, IconCheck, IconPlay } from "./components/Icons";

const Modal = ({ children }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
    <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full">
      {children}
    </div>
  </div>
);

export default function App() {
  const [difficulty, setDifficulty] = useState("easy");
  const [board, setBoard] = useState(null);

  const [gameState, setGameState] = useState({
    placements: [],
    startTime: Date.now(),
    isComplete: false,
  });

  const [trayRotations, setTrayRotations] = useState({});
  const [draggingDominoId, setDraggingDominoId] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [dragRotation, setDragRotation] = useState(0);
  const [activePieceId, setActivePieceId] = useState(null);

  const dragStartPos = useRef(null);
  const lastValidRotationRef = useRef({});
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    startNewGame(difficulty);
  }, []);

  useEffect(() => {
    let interval;
    if (!gameState.isComplete && board) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - gameState.startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.isComplete, gameState.startTime, board]);

  const startNewGame = (diff) => {
    const newBoard = generatePuzzle(diff);
    setBoard(newBoard);
    setGameState({
      placements: [],
      startTime: Date.now(),
      isComplete: false,
    });
    setTrayRotations({});
    lastValidRotationRef.current = {};
    setActivePieceId(null);
    setDifficulty(diff);
    setElapsed(0);
  };

  const handleClear = () => {
    if (!board) return;
    setGameState((prev) => ({
      ...prev,
      placements: [],
      isComplete: false,
    }));
    setTrayRotations({});
    lastValidRotationRef.current = {};
    setActivePieceId(null);
  };

  // --- HELPER: Validate Placement ---
  const isValidPosition = (r, c, rotation, ignoreId = null) => {
    if (!board) return false;
    const rot = ((rotation % 360) + 360) % 360;

    let c1 = { r, c };
    let c2 = { r, c };

    if (rot === 0) c2 = { r, c: c + 1 };
    if (rot === 90) c2 = { r: r + 1, c };
    if (rot === 180) c2 = { r, c: c - 1 };
    if (rot === 270) c2 = { r: r - 1, c };

    const cells = [c1, c2];

    for (const cell of cells) {
      if (
        cell.r < 0 ||
        cell.c < 0 ||
        cell.r >= board.rows ||
        cell.c >= board.cols
      )
        return false;
      if (!board.gridShape[cell.r][cell.c]) return false;
    }

    const collision = gameState.placements.some((p) => {
      if (p.dominoId === ignoreId) return false;

      const pRot = ((p.rotation % 360) + 360) % 360;
      let p1 = { r: p.r, c: p.c };
      let p2 = { r: p.r, c: p.c };

      if (pRot === 0) p2 = { r: p.r, c: p.c + 1 };
      if (pRot === 90) p2 = { r: p.r + 1, c: p.c };
      if (pRot === 180) p2 = { r: p.r, c: p.c - 1 };
      if (pRot === 270) p2 = { r: p.r - 1, c: p.c };

      const pCells = [p1, p2];
      return pCells.some((pc) =>
        cells.some((nc) => nc.r === pc.r && nc.c === pc.c)
      );
    });

    return !collision;
  };

  // --- LOGIC: Commit Active Piece ---
  const commitActivePiece = (clickedId = null) => {
    if (activePieceId && clickedId === activePieceId) return;
    if (!activePieceId) return;

    const placement = gameState.placements.find(
      (p) => p.dominoId === activePieceId
    );
    if (!placement) {
      setActivePieceId(null);
      return;
    }

    const valid = isValidPosition(
      placement.r,
      placement.c,
      placement.rotation,
      activePieceId
    );

    if (valid) {
      lastValidRotationRef.current[activePieceId] = placement.rotation;
      const won = checkCompletion(board, gameState.placements);
      if (won) setGameState((prev) => ({ ...prev, isComplete: true }));
    } else {
      // BOUNCE BACK to last known good state
      const lastGoodRot =
        lastValidRotationRef.current[activePieceId] !== undefined
          ? lastValidRotationRef.current[activePieceId]
          : 0;

      // If lastGoodRot is actually 0, it means it never had a valid board rotation,
      // or 0 was the valid one.
      setGameState((prev) => ({
        ...prev,
        placements: prev.placements.map((p) =>
          p.dominoId === activePieceId ? { ...p, rotation: lastGoodRot } : p
        ),
      }));
    }
    setActivePieceId(null);
  };

  // --- MOUSE HANDLERS ---
  const handleMouseDown = (e, id, fromBoard) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    commitActivePiece(id);

    dragStartPos.current = { x: e.clientX, y: e.clientY, id, fromBoard };
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (draggingDominoId) {
        setCursorPos({ x: e.clientX, y: e.clientY });
        return;
      }

      if (dragStartPos.current) {
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 10) {
          const { id, fromBoard } = dragStartPos.current;

          if (activePieceId && activePieceId !== id) {
            commitActivePiece(null);
          }
          setActivePieceId(null);

          let startRotation = 0;
          if (fromBoard) {
            const placement = gameState.placements.find(
              (p) => p.dominoId === id
            );
            startRotation = placement ? placement.rotation : 0;
            setGameState((prev) => ({
              ...prev,
              placements: prev.placements.filter((p) => p.dominoId !== id),
            }));
            delete lastValidRotationRef.current[id];
          } else {
            startRotation = trayRotations[id] || 0;
          }

          setDraggingDominoId(id);
          setDragRotation(startRotation);
          setCursorPos({ x: e.clientX, y: e.clientY });
        }
      }
    },
    [draggingDominoId, trayRotations, gameState.placements, activePieceId]
  );

  const handleMouseUp = useCallback(
    (e) => {
      // --- DRAG END ---
      if (draggingDominoId && board) {
        const boardContainer = document.querySelector("[data-board-container]");
        let placed = false;

        if (boardContainer) {
          const rect = boardContainer.getBoundingClientRect();
          const relativeX = e.clientX - rect.left;
          const relativeY = e.clientY - rect.top;

          const isInsideBoard =
            relativeX >= -50 &&
            relativeX <= rect.width + 50 &&
            relativeY >= -50 &&
            relativeY <= rect.height + 50;

          if (isInsideBoard) {
            const cellW = rect.width / board.cols;
            const cellH = rect.height / board.rows;
            const isVert = dragRotation % 180 !== 0;
            const pieceW = isVert ? cellW : cellW * 2;
            const pieceH = isVert ? cellH * 2 : cellH;
            const topLeftX = relativeX - pieceW / 2;
            const topLeftY = relativeY - pieceH / 2;
            const c = Math.round(topLeftX / cellW);
            const r = Math.round(topLeftY / cellH);

            if (isValidPosition(r, c, dragRotation, draggingDominoId)) {
              placed = true;
              const normalizedRotation = ((dragRotation % 360) + 360) % 360;

              const newPlacement = {
                dominoId: draggingDominoId,
                r,
                c,
                rotation: normalizedRotation,
              };

              const nextState = {
                ...gameState,
                placements: [...gameState.placements, newPlacement],
              };
              const won = checkCompletion(board, nextState.placements);
              setGameState({ ...nextState, isComplete: won });

              lastValidRotationRef.current[draggingDominoId] =
                normalizedRotation;

              const newRotations = { ...trayRotations };
              delete newRotations[draggingDominoId];
              setTrayRotations(newRotations);
            }
          }
        }

        if (!placed) {
          const wasFromBoard = dragStartPos.current?.fromBoard;
          if (wasFromBoard) {
            setTrayRotations((prev) => ({ ...prev, [draggingDominoId]: 0 }));
          } else {
            const currentRot = ((dragRotation % 360) + 360) % 360;
            setTrayRotations((prev) => ({
              ...prev,
              [draggingDominoId]: currentRot,
            }));
          }
        }

        setDraggingDominoId(null);
      }

      // --- CLICK (ROTATE) ---
      else if (dragStartPos.current) {
        const { id, fromBoard } = dragStartPos.current;

        if (fromBoard) {
          const placement = gameState.placements.find((p) => p.dominoId === id);

          if (activePieceId !== id) {
            setActivePieceId(id);
            if (placement) {
              lastValidRotationRef.current[id] = placement.rotation;
            }
          }

          if (placement) {
            const newRotation = placement.rotation + 90;
            const updatedPlacements = gameState.placements.map((p) =>
              p.dominoId === id ? { ...p, rotation: newRotation } : p
            );
            setGameState((prev) => ({
              ...prev,
              placements: updatedPlacements,
            }));

            // UPDATED LOGIC: If this new rotation is valid, save it immediately!
            // This ensures "Bounce Back" goes to the most recent valid spot.
            if (isValidPosition(placement.r, placement.c, newRotation, id)) {
              lastValidRotationRef.current[id] = newRotation;
            }
          }
        } else {
          setTrayRotations((prev) => ({ ...prev, [id]: (prev[id] || 0) + 90 }));
        }
      }

      dragStartPos.current = null;
    },
    [
      draggingDominoId,
      board,
      gameState,
      dragRotation,
      trayRotations,
      activePieceId,
    ]
  );

  const handleBackgroundClick = () => {
    commitActivePiece(null);
    setTrayRotations((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        const rot = next[key];
        if (rot % 180 !== 0) {
          next[key] = rot - 90;
        }
      });
      return next;
    });
  };

  const handleRemove = (id) => {
    if (gameState.isComplete) return;
    setGameState((prev) => ({
      ...prev,
      placements: prev.placements.filter((p) => p.dominoId !== id),
    }));
    setTrayRotations((prev) => ({ ...prev, [id]: 0 }));
    if (activePieceId === id) setActivePieceId(null);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, activePieceId, gameState.placements]);

  const getDragDomino = () =>
    board.initialDominoes.find((d) => d.id === draggingDominoId);

  if (!board)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest">
        Loading...
      </div>
    );

  return (
    <div
      className="min-h-screen bg-[#fffaf5] text-slate-800 flex flex-col font-sans"
      onClick={handleBackgroundClick}
    >
      {/* ... Header and Main Content remain same, ensure GameBoard is rendered ... */}
      <header className="px-6 py-5 flex items-center justify-between sticky top-0 z-30 bg-[#fffaf5]/90 backdrop-blur-sm">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            PIPS
          </h1>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Logic Puzzle
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Time
            </span>
            <span className="font-mono text-slate-700 font-bold">
              {Math.floor(elapsed / 60)}:
              {(elapsed % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="group flex flex-col items-center justify-center hover:text-rose-500 transition-colors"
          >
            <IconRestart className="w-5 h-5 mb-0.5 group-hover:-rotate-180 transition-transform duration-500" />
            <span className="text-[10px] uppercase tracking-wider font-bold">
              Restart
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 w-full">
        <div className="w-full max-w-[400px] mb-12 relative z-10 overflow-visible">
          <div data-board-container className="w-full relative">
            <GameBoard
              board={board}
              placements={gameState.placements}
              availableDominoes={board.initialDominoes}
              activePieceId={activePieceId}
              onPieceMouseDown={(e, id) => handleMouseDown(e, id, true)}
              onRemove={handleRemove}
            />
          </div>
        </div>

        <div className="w-full flex flex-col items-center gap-6 pb-6 animate-[slideUp_0.3s_ease-out]">
          <div className="text-[10px] font-black tracking-[0.2em] text-[#bca6c7] uppercase select-none bg-white/60 px-4 py-2 rounded-full border border-white">
            Tap to Rotate • Drag to Place
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-12 min-h-[100px] max-w-5xl px-4">
            {board.initialDominoes.map((dom) => {
              const isPlaced = gameState.placements.some(
                (p) => p.dominoId === dom.id
              );
              const isDragging = draggingDominoId === dom.id;
              const showPiece = !isPlaced && !isDragging;
              const rotation = trayRotations[dom.id] || 0;
              return (
                <div
                  key={dom.id}
                  className="relative w-[90px] h-[50px] bg-slate-200/50 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center shadow-inner"
                  onClick={(e) => e.stopPropagation()}
                >
                  {showPiece && (
                    <div
                      className="absolute inset-[-10px] flex items-center justify-center z-10"
                      onMouseDown={(e) => handleMouseDown(e, dom.id, false)}
                    >
                      <DominoPiece
                        domino={dom}
                        style={{
                          transform: `rotate(${rotation}deg) scale(0.9)`,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {draggingDominoId && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            transform: `translate(-50%, -50%) rotate(${dragRotation}deg)`,
            width: "90px",
            height: "45px",
          }}
        >
          <div className="w-full h-full opacity-90 shadow-2xl scale-110">
            {getDragDomino() && <DominoPiece domino={getDragDomino()} />}
          </div>
        </div>
      )}

      {gameState.isComplete && (
        <Modal>
          <div className="text-center flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center animate-bounce">
              <IconCheck className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                SOLVED!
              </h2>
              <p className="text-slate-500 font-medium">
                Completed in{" "}
                <span className="text-slate-900 font-bold">
                  {Math.floor(elapsed / 60)}m {elapsed % 60}s
                </span>
              </p>
            </div>
            <div className="flex flex-col w-full gap-3 mt-4">
              {["easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  onClick={(e) => {
                    e.stopPropagation();
                    startNewGame(d);
                  }}
                  className="w-full py-4 px-6 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 hover:text-slate-900 border border-slate-100 flex justify-between items-center group"
                >
                  <span className="capitalize">{d}</span>
                  <IconPlay className="w-4 h-4 text-slate-300 group-hover:text-slate-900" />
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
