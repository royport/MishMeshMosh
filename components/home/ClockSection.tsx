'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import ClockIllustration from '../ClockIllustration';
import { SelectionId } from '../../types';

const SEQUENCE: SelectionId[] = ['N', 'Q1', 'S', 'Q2', 'F', 'Q3', 'R', 'Q4'];
const STEP_DURATION = 4000;

export function ClockSection() {
  const [selectedId, setSelectedId] = useState<SelectionId>('N');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const animationIndex = useRef(0);
  const autoRotationTimer = useRef<number | null>(null);

  const runShowcaseStep = useCallback(() => {
    animationIndex.current = (animationIndex.current + 1) % SEQUENCE.length;
    setSelectedId(SEQUENCE[animationIndex.current]);
  }, []);

  useEffect(() => {
    if (isAutoPlaying) {
      autoRotationTimer.current = window.setInterval(runShowcaseStep, STEP_DURATION);
    }

    return () => {
      if (autoRotationTimer.current) {
        clearInterval(autoRotationTimer.current);
      }
    };
  }, [isAutoPlaying, runShowcaseStep]);

const toggleSelection = useCallback(
  (id: SelectionId) => {
    setSelectedId(id);


      const clickedIndex = SEQUENCE.indexOf(id);
      if (clickedIndex !== -1) {
        animationIndex.current = clickedIndex;
      }

      if (isAutoPlaying && autoRotationTimer.current) {
        clearInterval(autoRotationTimer.current);
        autoRotationTimer.current = window.setInterval(runShowcaseStep, STEP_DURATION);
      }
    },
    [isAutoPlaying, runShowcaseStep]
  );


  return (
    <section className="flex justify-center py-24">
      <div className="w-full max-w-3xl relative">
        <div className="absolute inset-0 bg-indigo-100/20 blur-[120px] rounded-full -z-10 animate-pulse" />

        <ClockIllustration
          selectedId={selectedId}
          onToggle={toggleSelection}
          showInternalDescription
        />
      </div>
    </section>
  );
}
