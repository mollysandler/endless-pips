import React from "react";

// Same exact palette as GameBoard
const PALETTE = {
  purple: "#8e6ead",
  pink: "#d9416a",
  teal: "#468fa3",
  orange: "#d4822f",
  navy: "#1f407a",
  green: "#5d7616",
};

export const RegionConstraint = ({ constraint, theme }) => {
  if (constraint.type === "none") return null;

  let text = "";
  switch (constraint.type) {
    case "eq":
      text = "=";
      break;
    case "neq":
      text = "≠";
      break;
    case "gt":
      text = `>${constraint.value}`;
      break;
    case "lt":
      text = `<${constraint.value}`;
      break;
    case "sum":
      text = `${constraint.value}`;
      break;
    default:
      break;
  }

  // Get the opaque color
  const bgHex = PALETTE[theme] || "#a89b90";

  return (
    <div
      className="absolute z-20 w-8 h-8 flex items-center justify-center pointer-events-none"
      style={{
        right: "-12px",
        bottom: "-12px",
      }}
    >
      {/* Shadow */}
      <div className="absolute inset-0 bg-black/10 rounded-lg transform rotate-45 translate-y-0.5 translate-x-0.5" />

      {/* Diamond Shape - Solid Color */}
      <div
        className="absolute inset-0 rounded-lg shadow-sm border-2 border-white transform rotate-45"
        style={{ backgroundColor: bgHex }}
      />

      {/* Text - White */}
      <span className="relative text-white font-black text-xs tracking-tighter shadow-black drop-shadow-md">
        {text}
      </span>
    </div>
  );
};
