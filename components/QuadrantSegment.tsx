
import React from 'react';
import { SelectionId } from '../types';

interface QuadrantSegmentProps {
  id: SelectionId;
  center: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  isSelected: boolean;
  color: string;
  onToggle: (id: SelectionId) => void;
}

const QuadrantSegment: React.FC<QuadrantSegmentProps> = ({
  id,
  center,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  isSelected,
  color,
  onToggle,
}) => {
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r_in: number, r_out: number, startA: number, endA: number) => {
    const startInner = polarToCartesian(x, y, r_in, startA);
    const endInner = polarToCartesian(x, y, r_in, endA);
    const startOuter = polarToCartesian(x, y, r_out, startA);
    const endOuter = polarToCartesian(x, y, r_out, endA);

    const largeArcFlag = endA - startA <= 180 ? "0" : "1";

    return [
      "M", startOuter.x, startOuter.y,
      "A", r_out, r_out, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
      "L", endInner.x, endInner.y,
      "A", r_in, r_in, 0, largeArcFlag, 0, startInner.x, startInner.y,
      "Z"
    ].join(" ");
  };

  const pathData = describeArc(center, center, innerRadius, outerRadius, startAngle, endAngle);

  return (
    <path
      d={pathData}
      onClick={() => onToggle(id)}
      style={{
        fill: color,
        stroke: color,
        fillOpacity: isSelected ? 0.9 : 0.15,
        strokeOpacity: isSelected ? 1 : 0.3
      }}
      className={`
        cursor-pointer transition-all duration-300 ease-in-out
        hover:fill-opacity-30 hover:stroke-opacity-60
        stroke-[2px]
      `}
    />
  );
};

export default QuadrantSegment;
