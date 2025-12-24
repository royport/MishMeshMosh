
export type SelectionId = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'N' | 'R' | 'F' | 'S';

export interface DialItem {
  id: SelectionId;
  label: string;
  title: string;
  description: string;
  angle: number; // Point angle for the hand
  color: string; // Hex or tailwind-like color reference
  iconPath: string; // SVG path data
}

export interface QuadrantInfo extends DialItem {
  startAngle: number;
  endAngle: number;
}
