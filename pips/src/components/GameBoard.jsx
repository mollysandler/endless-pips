import React from "react";
import { RegionConstraint } from "./RegionConstraint";
import { DominoPiece } from "./DominoPiece";
import { DashedBorder } from "./DashedBorder";

// Colors from reference
const regionStyles = {
  purple: { bg: "#c5b4cc", border: "#886ea8" },
  pink: { bg: "#e8acb9", border: "#d94568" },
  teal: { bg: "bg-[#a3c3c7]", border: "#408591" },
  orange: { bg: "#e6ceab", border: "#d18035" },
  navy: { bg: "#b3c7e6", border: "#2c4f8f" },
  green: { bg: "#c8d4a1", border: "#627d22" },
  neutral: { bg: "#e6d5c6", border: "none" }, // Neutral matches the base board
};

const defaultStyle = { bg: "#dcd0c5", border: "#a89b90" };

// The color of the "Physical Board" underneath the regions
const BOARD_BASE_COLOR = "#e6d5c6";

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

            // 1. VOID: No board here
            if (!board.gridShape[r][c] || !region) {
              return (
                <div key={`${r}-${c}`} className="w-full h-full invisible" />
              );
            }

            const rid = region.id;
            const theme = regionStyles[region.colorTheme] || defaultStyle;
            const isNeutral = region.colorTheme === "neutral";

            // 2. NEIGHBOR CHECKS
            const sameTop = isSameRegion(r - 1, c, rid);
            const sameBottom = isSameRegion(r + 1, c, rid);
            const sameLeft = isSameRegion(r, c - 1, rid);
            const sameRight = isSameRegion(r, c + 1, rid);

            // 3. PADDING / GUTTER LOGIC
            // If neighbor is different, we add a small padding to reveal the "Base Board" underneath.
            // This creates the separation lines.
            const gapSize = "2px";
            const paddingStyle = {
              paddingTop: sameTop ? "0" : gapSize,
              paddingBottom: sameBottom ? "0" : gapSize,
              paddingLeft: sameLeft ? "0" : gapSize,
              paddingRight: sameRight ? "0" : gapSize,
            };

            // 4. ROUNDING LOGIC (For the colored patch)
            const radius = "10px";
            const roundedStyle = {
              borderTopLeftRadius: !sameTop && !sameLeft ? radius : "0",
              borderTopRightRadius: !sameTop && !sameRight ? radius : "0",
              borderBottomLeftRadius: !sameBottom && !sameLeft ? radius : "0",
              borderBottomRightRadius: !sameBottom && !sameRight ? radius : "0",
            };

            const isLabelCell =
              region.labelPosition?.r === r && region.labelPosition?.c === c;

            // 5. OCCUPANCY (For socket shadow)
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
                className="relative w-full h-full box-border"
                style={{
                  // The "Base Board" color fills the entire cell slot
                  backgroundColor: BOARD_BASE_COLOR,
                  // If this cell is a corner of the WHOLE board, we might want to round the base too?
                  // For now, let's keep the base square-ish to act as the grout,
                  // or simple rounding:
                  borderRadius: "4px",
                }}
              >
                {/* 
                   THE REGION OVERLAY 
                   This div shrinks based on paddingStyle to reveal the base color 
                   when next to a different region.
                */}
                <div
                  className="w-full h-full relative"
                  style={{
                    ...paddingStyle,
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    className="w-full h-full relative"
                    style={{
                      // For neutral, we just show the base (transparent bg here)
                      // For colored, we show the vibrant opaque color + opacity
                      backgroundColor: isNeutral
                        ? "transparent"
                        : `${theme.border}4D`, // 30% opacity
                      ...roundedStyle,
                    }}
                  >
                    {/* SVG Border - Only for colored regions */}
                    {!isNeutral && (
                      <DashedBorder
                        color={theme.border}
                        isNeutral={isNeutral}
                        showTop={!sameTop}
                        showBottom={!sameBottom}
                        showLeft={!sameLeft}
                        showRight={!sameRight}
                        radiusTL={!sameTop && !sameLeft}
                        radiusTR={!sameTop && !sameRight}
                        radiusBL={!sameBottom && !sameLeft}
                        radiusBR={!sameBottom && !sameRight}
                      />
                    )}

                    {/* Empty Socket Shadow */}
                    {!isOccupied && (
                      <div
                        className="absolute inset-1 rounded-lg"
                        style={{
                          // A subtle inner shadow to make it look like a recessed hole
                          backgroundColor: "rgba(0,0,0,0.05)",
                          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.15)",
                        }}
                      >
                        {/* Tiny center dot */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
                        </div>
                      </div>
                    )}

                    {/* Constraint Tag */}
                    {isLabelCell && (
                      <RegionConstraint
                        constraint={region.constraint}
                        theme={region.colorTheme}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* OVERLAY: DOMINOES */}
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
                // Padding ensures the piece sits "inside" the board edges nicely
                padding: "3px",
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
