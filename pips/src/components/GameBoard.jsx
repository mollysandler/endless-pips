import React from "react";
import { RegionConstraint } from "./RegionConstraint";
import { DominoPiece } from "./DominoPiece";
import { DashedBorder } from "./DashedBorder";

const regionStyles = {
  purple: { bg: "#c5b4cc", border: "#886ea8" },
  pink: { bg: "#e8acb9", border: "#d94568" },
  teal: { bg: "bg-[#a3c3c7]", border: "#408591" },
  orange: { bg: "#e6ceab", border: "#d18035" },
  navy: { bg: "#b3c7e6", border: "#2c4f8f" },
  green: { bg: "#c8d4a1", border: "#627d22" },
  neutral: { bg: "#e6d5c6", border: "none" },
};

const defaultStyle = { bg: "#dcd0c5", border: "#a89b90" };
const BOARD_BASE_COLOR = "#e6d5c6";

export const GameBoard = ({
  board,
  placements,
  availableDominoes,
  onRemove,
  onPieceMouseDown,
  activePieceId,
  invalidRegionIds = [],
  displayedErrorRegions = [],
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
      {/* LAYER 1: GRID & BASE (Background) */}
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
            const theme = regionStyles[region.colorTheme] || defaultStyle;
            const isNeutral = region.colorTheme === "neutral";

            const sameTop = isSameRegion(r - 1, c, rid);
            const sameBottom = isSameRegion(r + 1, c, rid);
            const sameLeft = isSameRegion(r, c - 1, rid);
            const sameRight = isSameRegion(r, c + 1, rid);

            const gapSize = "2px";
            const paddingStyle = {
              paddingTop: sameTop ? "0" : gapSize,
              paddingBottom: sameBottom ? "0" : gapSize,
              paddingLeft: sameLeft ? "0" : gapSize,
              paddingRight: sameRight ? "0" : gapSize,
            };

            const radius = "16px";
            const roundedStyle = {
              borderTopLeftRadius: !sameTop && !sameLeft ? radius : "0",
              borderTopRightRadius: !sameTop && !sameRight ? radius : "0",
              borderBottomLeftRadius: !sameBottom && !sameLeft ? radius : "0",
              borderBottomRightRadius: !sameBottom && !sameRight ? radius : "0",
            };

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
                  backgroundColor: BOARD_BASE_COLOR,
                  borderRadius: "6px",
                }}
              >
                <div
                  className="w-full h-full relative"
                  style={{ ...paddingStyle, transition: "all 0.2s" }}
                >
                  <div
                    className="w-full h-full relative"
                    style={{
                      backgroundColor: isNeutral
                        ? "transparent"
                        : `${theme.border}4D`,
                      ...roundedStyle,
                    }}
                  >
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
                    {!isOccupied && (
                      <div
                        className="absolute inset-1.5 rounded-xl"
                        style={{
                          backgroundColor: "rgba(0,0,0,0.06)",
                          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15)",
                        }}
                      ></div>
                    )}
                    {/* Note: Constraints moved to Layer 3 */}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* LAYER 2: DOMINOES */}
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
                padding: "3px",
              }}
              onMouseDown={(e) => onPieceMouseDown(e, p.dominoId)}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing hover:brightness-105 transition-all">
                <DominoPiece domino={domino} />
              </div>
            </div>
          );
        })}
      </div>

      {/* LAYER 3: CONSTRAINTS & ERROR DOTS (Always on Top) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[60]">
        <div
          className="grid w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${board.cols}, 1fr)`,
            gridTemplateRows: `repeat(${board.rows}, 1fr)`,
          }}
        >
          {Array.from({ length: board.rows }).map((_, r) =>
            Array.from({ length: board.cols }).map((_, c) => {
              const region = getRegionAt(r, c);
              // Skip if void
              if (!board.gridShape[r][c] || !region)
                return <div key={`tag-${r}-${c}`} />;

              const isLabelCell =
                region.labelPosition?.r === r && region.labelPosition?.c === c;
              const rid = region.id;
              const isInvalid = displayedErrorRegions.includes(rid);

              return (
                <div key={`tag-${r}-${c}`} className="relative w-full h-full">
                  {isLabelCell && (
                    <RegionConstraint
                      constraint={region.constraint}
                      theme={region.colorTheme}
                      isInvalid={isInvalid}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
