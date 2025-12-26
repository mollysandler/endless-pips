import React from "react";
import { PipValue } from "./Pips";

export const DominoPiece = ({ domino, style, onMouseDown, onClick }) => {
  const baseClasses =
    "relative bg-white border-2 border-slate-800 rounded-[10px] flex overflow-hidden select-none box-border shadow-sm transition-transform duration-300 ease-out";

  return (
    <div
      className={baseClasses}
      style={{
        ...style,
        width: "100%",
        height: "auto",
        aspectRatio: "2/1",
        margin: "0 auto",
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <div className="flex-1 relative">
        <div className="absolute inset-1">
          <PipValue value={domino.v1} color="#1e293b" />
        </div>
      </div>
      <div className="shrink-0 bg-slate-200 w-[1px] h-full" />
      <div className="flex-1 relative">
        <div className="absolute inset-1">
          <PipValue value={domino.v2} color="#1e293b" />
        </div>
      </div>
    </div>
  );
};
