import React from "react";

const positions = {
  0: [],
  1: [[50, 50]],
  2: [
    [20, 20],
    [80, 80],
  ],
  3: [
    [20, 20],
    [50, 50],
    [80, 80],
  ],
  4: [
    [20, 20],
    [20, 80],
    [80, 20],
    [80, 80],
  ],
  5: [
    [20, 20],
    [20, 80],
    [50, 50],
    [80, 20],
    [80, 80],
  ],
  6: [
    [20, 20],
    [20, 50],
    [20, 80],
    [80, 20],
    [80, 50],
    [80, 80],
  ],
};

export const PipValue = ({ value, color = "#333" }) => {
  const dots = positions[value] || [];

  return (
    <div className="w-full h-full relative">
      {dots.map((pos, idx) => (
        <div
          key={idx}
          className="absolute rounded-full"
          style={{
            backgroundColor: color,
            left: `${pos[0]}%`,
            top: `${pos[1]}%`,
            width: "18%",
            height: "18%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
};
