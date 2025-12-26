import React from "react";
import { RegionConstraint } from "./RegionConstraint";
import { DominoPiece } from "./DominoPiece";

const regionStyles = {
  purple: { bg: "bg-[#c4b2ce]", border: "border-[#8e7b9b]" },
  pink: { bg: "bg-[#eab0bb]", border: "border-[#c47e8e]" },
  teal: { bg: "bg-[#a9cdce]", border: "border-[#6b9ea0]" },
  orange: { bg: "bg-[#e8cda1]", border: "border-[#c7a672]" },
  navy: { bg: "bg-[#b3c7e6]", border: "border-[#7a9cc6]" },
};
const defaultStyle = { bg: "bg-[#dcd0c5]", border: "border-[#a89b90]" };

export const GameBoard = ({
  board,
  placements,
  availableDominoes,
  onRemove,
  onPieceMouseDown,
  activePieceId,
}) => {
  const getRegionAt = (r, c) =>
    board.regions.find((reg) =>
      reg.cells.some((cell) => cell.r === r && cell.c === c)
    );

  const isSameRegion = (r, c, targetRegionId) => {
    if (r < 0 || c < 0 || r >= board.rows || c >= board.cols) return false;
    const neighborReg = getRegionAt(r, c);
    return neighborReg && neighborReg.id === targetRegionId;
  };

  return (
    <div className="relative w-full mx-auto select-none">
      <div
        className="grid w-full"
        style={{
          aspectRatio: `${board.cols} / ${board.rows}`,
          gridTemplateColumns: `repeat(${board.cols}, 1fr)`,
          gridTemplateRows: `repeat(${board.rows}, 1fr)`,
        }}
      >
        {Array.from({ length: board.rows }).map((_, r) =>
          Array.from({ length: board.cols }).map((_, c) => {
            const region = getRegionAt(r, c);
            if (!board.gridShape[r][c] || !region) {
              return (
                <div key={`${r}-${c}`} className="w-full h-full invisible" />
              );
            }
            const rid = region.id;
            const sameTop = isSameRegion(r - 1, c, rid);
            const sameBottom = isSameRegion(r + 1, c, rid);
            const sameLeft = isSameRegion(r, c - 1, rid);
            const sameRight = isSameRegion(r, c + 1, rid);
            const theme = regionStyles[region.colorTheme] || defaultStyle;
            const roundedClasses = [
              !sameTop && !sameLeft ? "rounded-tl-[1rem]" : "",
              !sameTop && !sameRight ? "rounded-tr-[1rem]" : "",
              !sameBottom && !sameLeft ? "rounded-bl-[1rem]" : "",
              !sameBottom && !sameRight ? "rounded-br-[1rem]" : "",
            ].join(" ");
            const borderColorHex = theme.border.match(/#\w+/)?.[0] || "#999";
            const dashedBorder = `2.5px dashed ${borderColorHex}`;
            const styles = {
              borderTop: !sameTop ? dashedBorder : "0",
              borderBottom: !sameBottom ? dashedBorder : "0",
              borderLeft: !sameLeft ? dashedBorder : "0",
              borderRight: !sameRight ? dashedBorder : "0",
            };
            const isLabelCell =
              region.labelPosition?.r === r && region.labelPosition?.c === c;

            const isOccupied = placements.some((p) => {
              const rot = ((p.rotation % 360) + 360) % 360;
              if (p.r === r && p.c === c) return true;
              if (rot === 0 && p.r === r && p.c + 1 === c) return true;
              if (rot === 90 && p.r + 1 === r && p.c === c) return true;
              if (rot === 180 && p.r === r && p.c - 1 === c) return true;
              if (rot === 270 && p.r - 1 === r && p.c === c) return true;
              return false;
            });

            return (
              <div
                key={`${r}-${c}`}
                className={`relative w-full h-full box-border ${theme.bg} ${roundedClasses}`}
                style={styles}
              >
                {!isOccupied && (
                  <div className="absolute inset-1 rounded-lg bg-black/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
                  </div>
                )}
                {isLabelCell && (
                  <RegionConstraint
                    constraint={region.constraint}
                    theme={region.colorTheme}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {placements.map((p) => {
          const domino = availableDominoes.find((d) => d.id === p.dominoId);
          if (!domino) return null;

          const isActive = p.dominoId === activePieceId;

          return (
            <div
              key={p.dominoId}
              className={`absolute pointer-events-auto transition-transform duration-300 ease-out flex items-center justify-center ${
                isActive ? "z-50 drop-shadow-2xl" : "z-10"
              }`}
              style={{
                left: `${(p.c / board.cols) * 100}%`,
                top: `${(p.r / board.rows) * 100}%`,
                width: `${(2 / board.cols) * 100}%`,
                height: `${(1 / board.rows) * 100}%`,
                transformOrigin: "25% 50%",
                transform: `rotate(${p.rotation}deg)`,
                padding: "2px",
              }}
              onMouseDown={(e) => onPieceMouseDown(e, p.dominoId)}
            >
              <div className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing hover:brightness-105 transition-all">
                <DominoPiece domino={domino} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
