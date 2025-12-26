import React from "react";

// Matching the borders defined in GameBoard
const themeColors = {
  purple: "bg-[#8e7b9b]",
  pink: "bg-[#c47e8e]",
  teal: "bg-[#6b9ea0]",
  orange: "bg-[#c7a672]",
  navy: "bg-[#7a9cc6]",
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

  const bgClass = themeColors[theme] || "bg-slate-500";

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

      {/* Diamond Shape */}
      <div
        className={`absolute inset-0 ${bgClass} rounded-lg shadow-sm border-2 border-white transform rotate-45`}
      />

      {/* Text */}
      <span className="relative text-white font-black text-xs tracking-tighter shadow-black drop-shadow-md">
        {text}
      </span>
    </div>
  );
};
