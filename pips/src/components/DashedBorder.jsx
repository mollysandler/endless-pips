import React, { useState, useEffect, useRef } from "react";

export const DashedBorder = ({
  color,
  showTop,
  showRight,
  showBottom,
  showLeft,
  radiusTL,
  radiusTR,
  radiusBL,
  radiusBR,
  isNeutral,
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observeTarget = containerRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    resizeObserver.observe(observeTarget);
    return () => resizeObserver.unobserve(observeTarget);
  }, []);

  const { width, height } = dimensions;
  if (width === 0 || height === 0)
    return <div ref={containerRef} className="absolute inset-0" />;

  // STYLE CONFIG
  // Thinner stroke, tighter dashes to match reference
  const strokeWidth = 3;
  const dashArray = "5 6"; // 5px line, 6px gap
  const R = 10; // Radius matches the div radius

  const segments = [];

  // Helper: Draw segments based on visibility
  // TOP-LEFT
  if (showTop && showLeft && radiusTL)
    segments.push(<path key="tl-c" d={`M 0 ${R} Q 0 0 ${R} 0`} />);
  else {
    if (showTop) segments.push(<path key="tl-t" d={`M 0 0 L ${R} 0`} />);
    if (showLeft) segments.push(<path key="tl-l" d={`M 0 0 L 0 ${R}`} />);
  }

  // TOP-RIGHT
  if (showTop && showRight && radiusTR)
    segments.push(
      <path key="tr-c" d={`M ${width - R} 0 Q ${width} 0 ${width} ${R}`} />
    );
  else {
    if (showTop)
      segments.push(<path key="tr-t" d={`M ${width - R} 0 L ${width} 0`} />);
    if (showRight)
      segments.push(<path key="tr-r" d={`M ${width} 0 L ${width} ${R}`} />);
  }

  // BOTTOM-RIGHT
  if (showBottom && showRight && radiusBR)
    segments.push(
      <path
        key="br-c"
        d={`M ${width} ${height - R} Q ${width} ${height} ${
          width - R
        } ${height}`}
      />
    );
  else {
    if (showBottom)
      segments.push(
        <path key="br-b" d={`M ${width} ${height} L ${width - R} ${height}`} />
      );
    if (showRight)
      segments.push(
        <path key="br-r" d={`M ${width} ${height - R} L ${width} ${height}`} />
      );
  }

  // BOTTOM-LEFT
  if (showBottom && showLeft && radiusBL)
    segments.push(
      <path key="bl-c" d={`M ${R} ${height} Q 0 ${height} 0 ${height - R}`} />
    );
  else {
    if (showBottom)
      segments.push(<path key="bl-b" d={`M ${R} ${height} L 0 ${height}`} />);
    if (showLeft)
      segments.push(<path key="bl-l" d={`M 0 ${height - R} L 0 ${height}`} />);
  }

  // SIDES (Connect the corners)
  if (showTop && width > 2 * R)
    segments.push(<path key="s-t" d={`M ${R} 0 L ${width - R} 0`} />);
  if (showBottom && width > 2 * R)
    segments.push(
      <path key="s-b" d={`M ${R} ${height} L ${width - R} ${height}`} />
    );
  if (showLeft && height > 2 * R)
    segments.push(<path key="s-l" d={`M 0 ${R} L 0 ${height - R}`} />);
  if (showRight && height > 2 * R)
    segments.push(
      <path key="s-r" d={`M ${width} ${R} L ${width} ${height - R}`} />
    );

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      <svg width={width} height={height} style={{ overflow: "visible" }}>
        <g
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          strokeLinecap="round"
        >
          {segments}
        </g>
      </svg>
    </div>
  );
};
