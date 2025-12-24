
import React from 'react';
import { CARDINAL_ITEMS } from '../constants';
import { SelectionId, DialItem } from '../types';

interface ClockDialProps {
  size: number;
  selectedId: SelectionId | null;
  onSelect: (id: SelectionId) => void;
  activeItem?: DialItem;
}

const ClockDial: React.FC<ClockDialProps> = ({ size, selectedId, onSelect, activeItem }) => {
  const center = size / 2;
  const dialRadius = size * 0.35;
  const labelRadius = size * 0.43;

  return (
    <g className="select-none">
      <circle
        cx={center}
        cy={center}
        r={dialRadius}
        style={{
          stroke: activeItem?.color || '#e2e8f0',
          strokeWidth: activeItem ? 3 : 1.5,
          transition: 'all 700ms ease'
        }}
        className="fill-white shadow-sm"
      />

      {/* Description Content in Center */}
      {activeItem && (
        <foreignObject
          x={center - dialRadius * 0.7}
          y={center - dialRadius * 0.7}
          width={dialRadius * 1.4}
          height={dialRadius * 1.4}
          className="pointer-events-none"
        >
          <div className="w-full h-full flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in-95 duration-700 overflow-hidden">
            <span className="text-[20px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: activeItem.color }}>
              {activeItem.label}
            </span>
            <h3 className="text-xl font-black text-slate-900 leading-tight mb-4 tracking-tighter">
              {activeItem.title}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-[180px]">
              {activeItem.description}
            </p>
          </div>
        </foreignObject>
      )}

      {!activeItem && [...Array(60)].map((_, i) => {
        const angle = (i * 6 - 90) * (Math.PI / 180);
        const isHour = i % 5 === 0;
        const tickLength = isHour ? 10 : 4;
        const x1 = center + (dialRadius - tickLength) * Math.cos(angle);
        const y1 = center + (dialRadius - tickLength) * Math.sin(angle);
        const x2 = center + (dialRadius - 2) * Math.cos(angle);
        const y2 = center + (dialRadius - 2) * Math.sin(angle);

        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className={`${isHour ? 'stroke-slate-300 stroke-[2px]' : 'stroke-slate-100 stroke-[1px]'}`}
          />
        );
      })}

      {CARDINAL_ITEMS.map((item) => {
        const rad = item.angle * (Math.PI / 180);
        const x = center + labelRadius * Math.cos(rad);
        const y = center + labelRadius * Math.sin(rad);
        const isSelected = selectedId === item.id;
        const buttonRadius = 42;
        const iconSize = 34;

        return (
          <g
            key={item.id}
            className="cursor-pointer group"
            onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
          >
            <circle
              cx={x}
              cy={y}
              r={buttonRadius + 4}
              style={{
                fill: 'transparent',
                stroke: item.color,
                strokeWidth: 1,
                strokeOpacity: isSelected ? 0.4 : 0.1,
              }}
              className="transition-all duration-500"
            />

            <circle
              cx={x}
              cy={y}
              r={buttonRadius}
              style={{
                fill: isSelected ? item.color : 'white',
                stroke: item.color,
                strokeWidth: isSelected ? 3 : 2,
                filter: isSelected ? `drop-shadow(0 0 12px ${item.color}66)` : 'none'
              }}
              className="transition-all duration-500 shadow-xl group-hover:brightness-105"
            />

            <g
              transform={`translate(${x - iconSize/2}, ${y - iconSize/2 - 8})`}
              className="transition-all duration-500"
            >
               <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path
                   d={item.iconPath}
                   stroke={isSelected ? 'white' : item.color}
                   strokeWidth="2.2"
                   strokeLinecap="round"
                   strokeLinejoin="round"
                 />
                 <path
                   d={item.iconPath}
                   fill={isSelected ? 'white' : item.color}
                   fillOpacity={isSelected ? 0.25 : 0.15}
                 />
               </svg>
            </g>

            <text
              x={x}
              y={y + 18}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[11px] font-black uppercase tracking-[0.1em] transition-all duration-500"
              style={{
                fill: isSelected ? 'white' : item.color,
              }}
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export default ClockDial;
