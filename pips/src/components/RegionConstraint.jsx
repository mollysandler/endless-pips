const PALETTE = {
  purple: "#8e70a6",
  pink: "#dc4c6e",
  teal: "#428793",
  orange: "#d18136",
  navy: "#2c4f8f",
  green: "#637d23",
  neutral: "#c8beb5",
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

      {/* Diamond */}
      <div
        className="absolute inset-0 rounded-lg shadow-sm border-2 border-white transform rotate-45"
        style={{ backgroundColor: bgHex }}
      />

      {/* Text */}
      <span className="relative text-white font-black text-xs tracking-tighter shadow-black drop-shadow-md">
        {text}
      </span>
    </div>
  );
};
