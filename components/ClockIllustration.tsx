
import React from 'react';
import ClockDial from './ClockDial';
import QuadrantSegment from './QuadrantSegment';
import { QUADRANTS, ALL_ITEMS } from '../constants';
import { SelectionId } from '../types' ;

interface ClockIllustrationProps {
  selectedId: SelectionId | null;
  onToggle: (id: SelectionId) => void;
  showInternalDescription?: boolean;
}

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeTextPath = (cx: number, cy: number, r: number, startA: number, endA: number) => {
  const margin = 28;
  const adjustedStart = startA + margin;
  const adjustedEnd = endA - margin;

  const isBottom = startA >= 0 && startA < 180;

  if (isBottom) {
    const start = polarToCartesian(cx, cy, r, adjustedEnd);
    const end = polarToCartesian(cx, cy, r, adjustedStart);
    const largeArcFlag = adjustedEnd - adjustedStart <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  } else {
    const start = polarToCartesian(cx, cy, r, adjustedStart);
    const end = polarToCartesian(cx, cy, r, adjustedEnd);
    const largeArcFlag = adjustedEnd - adjustedStart <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  }
};

const ClockIllustration: React.FC<ClockIllustrationProps> = ({
  selectedId,
  onToggle,
  showInternalDescription = false
}) => {
  const size = 500;
  const center = size / 2;
  const innerRingRadius = size * 0.375;
  const outerRingRadius = size * 0.495;
  const iconRadius = innerRingRadius + (outerRingRadius - innerRingRadius) * 0.4;
  const textRadius = innerRingRadius + (outerRingRadius - innerRingRadius) * 0.8;
  const iconSize = 32;

  const selectedItem = ALL_ITEMS.find(item => item.id === selectedId);

  return (
    <div className="relative w-full max-w-[500px] aspect-square mx-auto">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full drop-shadow-2xl overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {QUADRANTS.map((q) => (
            <path
              key={`path-${q.id}`}
              id={`textPath-${q.id}`}
              d={describeTextPath(center, center, textRadius, q.startAngle, q.endAngle)}
            />
          ))}
        </defs>

        {QUADRANTS.map((q) => {
          const isSelected = selectedId === q.id;
          const midAngle = (q.startAngle + q.endAngle) / 2;
          const iconPos = polarToCartesian(center, center, iconRadius, midAngle);

          return (
            <g key={q.id}>
              <QuadrantSegment
                id={q.id}
                center={center}
                innerRadius={innerRingRadius}
                outerRadius={outerRingRadius}
                startAngle={q.startAngle}
                endAngle={q.endAngle}
                isSelected={isSelected}
                color={q.color}
                onToggle={onToggle}
              />

              <g
                transform={`translate(${iconPos.x - iconSize/2}, ${iconPos.y - iconSize/2})`}
                className="pointer-events-none transition-all duration-300"
              >
                <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
                  <path
                    d={q.iconPath}
                    stroke={isSelected ? 'white' : q.color}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={q.iconPath}
                    fill={isSelected ? 'white' : q.color}
                    fillOpacity={isSelected ? 0.3 : 0.05}
                  />
                </svg>
              </g>

              <text
                className="pointer-events-none text-[9px] font-black uppercase tracking-[0.25em] transition-colors duration-300"
                style={{
                  fill: isSelected ? 'white' : q.color,
                }}
              >
                <textPath
                  href={`#textPath-${q.id}`}
                  startOffset="50%"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {q.label}
                </textPath>
              </text>
            </g>
          );
        })}

        <ClockDial
          size={size}
          selectedId={selectedId}
          onSelect={onToggle}
          activeItem={showInternalDescription ? selectedItem : undefined}
        />
      </svg>
    </div>
  );
};

export default ClockIllustration;
