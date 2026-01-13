'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import ClockIllustration from '../ClockIllustration';
import { CARDINAL_ITEMS } from '../../constants';
import type { SelectionId } from '../../types';

const SEQUENCE: SelectionId[] = ['N', 'Q1', 'S', 'Q2', 'F', 'Q3', 'R', 'Q4'];
const STEP_DURATION = 4500;

function StepCard({
  id,
  title,
  description,
  color,
  iconPath,
  selected,
  onSelect,
}: {
  id: SelectionId;
  title: string;
  description: string;
  color: string;
  iconPath: string;
  selected: boolean;
  onSelect: (id: SelectionId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={[
        'group w-full text-left rounded-2xl border p-5 transition-all',
        selected ? 'bg-white shadow-lg' : 'bg-white/60 hover:bg-white',
      ].join(' ')}
      style={{
        borderColor: selected ? `${color}55` : 'rgba(148,163,184,0.35)',
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
          style={{ backgroundColor: `${color}1A` }}
        >
          <svg className="w-6 h-6" fill="none" stroke={color} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d={iconPath} />
          </svg>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-extrabold tracking-[0.25em]"
              style={{ color }}
            >
              {id}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {title}
            </h3>
          </div>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

export function ProcessSection() {
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
      if (autoRotationTimer.current) clearInterval(autoRotationTimer.current);
    };
  }, [isAutoPlaying, runShowcaseStep]);

  const toggleSelection = useCallback(
    (id: SelectionId) => {
      setSelectedId(id);
      const clickedIndex = SEQUENCE.indexOf(id);
      if (clickedIndex !== -1) animationIndex.current = clickedIndex;
      setIsAutoPlaying(false);

      if (autoRotationTimer.current) {
        clearInterval(autoRotationTimer.current);
        autoRotationTimer.current = null;
      }
    },
    []
  );

  const steps = useMemo(
    () =>
      CARDINAL_ITEMS.map((s) => ({
        id: s.id,
        title: s.label,
        description: s.description,
        color: s.color,
        iconPath: s.iconPath,
      })),
    []
  );

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-4">
            THE PROCESS
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-4">How it works</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            One lifecycle, one language. Start with a <b>NEED</b>, validate it into a <b>SEED</b>, let suppliers compete in <b>FEED</b>, then assign and execute in <b>REED</b>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-100/30 blur-[120px] rounded-full -z-10" />
            <ClockIllustration
              selectedId={selectedId}
              onToggle={toggleSelection}
              showInternalDescription
            />

            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-500">
              <button
                type="button"
                onClick={() => setIsAutoPlaying((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isAutoPlaying ? '#10b981' : '#94a3b8' }} />
                {isAutoPlaying ? 'Auto play on' : 'Auto play off'}
              </button>
              <span className="hidden sm:inline">Tip: click any label to pin the explanation.</span>
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((s) => (
              <StepCard
                key={s.id}
                id={s.id}
                title={s.title}
                description={s.description}
                color={s.color}
                iconPath={s.iconPath}
                selected={selectedId === s.id}
                onSelect={toggleSelection}
              />
            ))}

            <div className="mt-6 rounded-2xl bg-slate-900 text-white p-6">
              <h3 className="text-lg font-bold">Trust through deeds</h3>
              <p className="mt-2 text-sm text-white/80 leading-relaxed">
                Every step can be backed by signed digital deeds � making terms, offers, and assignment auditable.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/create"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition"
                >
                  Start a Need
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition"
                >
                  Explore campaigns
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
