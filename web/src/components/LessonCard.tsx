'use client'

import Link from 'next/link';
import { Lesson } from '@/lib/lessons';
import { LEVEL_NAMES } from '@/lib/constants';
import { useEffect, useRef } from 'react';

export default function LessonCard({ lesson }: { lesson: Lesson }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const levels = lesson.level_tags.map(t => LEVEL_NAMES[t] || t).join('/');

  // 滾動觸發動畫（手機優化）
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          card.classList.add('animate-slide-in-diagonal');
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <Link
      href={`/lesson/${lesson.id}`}
      ref={cardRef}
      className="
        block relative
        opacity-0
        mb-6
        pt-2
      "
    >
      {/* PRO 徽章（外層定位，不被卡片裁切） */}
      {lesson.is_premium && (
        <div className="
          absolute top-0 right-2
          px-4 py-1.5
          bg-gradient-to-r from-amber-500 to-orange-500
          text-black text-xs font-bold tracking-wider
          rounded-full
          shadow-lg shadow-amber-500/50
          transform rotate-6
          z-10
        ">
          PRO
        </div>
      )}

      <div className="
        velocity-shine
        relative
        p-6
        rounded-2xl
        bg-zinc-800
        border-2
        transition-all duration-200
        active:scale-[0.97]
        active:translate-y-1

        /* 斜切角效果（滑雪板邊緣） */
        [clip-path:polygon(0_12px,12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%)]
      "
      style={{
        borderImage: 'linear-gradient(165deg, var(--card-border), var(--card-border)) 1',
      }}
      >
        {/* 對角線裝飾條（速度感） */}
        <div className="
          absolute top-0 right-0
          w-24 h-24
          bg-gradient-to-br from-amber-500/10 to-transparent
          [clip-path:polygon(100%_0,100%_100%,0_0)]
          pointer-events-none
        " />

        {/* 標題：Bebas Neue 大字 */}
        <h3
          className="
            text-2xl font-bold
            text-gradient-velocity
            line-clamp-2 mb-4
            tracking-wide
            transform -skew-x-3
          "
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {lesson.title}
        </h3>

        {/* 徽章區：斜向排列 */}
        <div className="flex gap-2.5 flex-wrap transform -skew-x-2">
          {/* 等級徽章 */}
          <span className="
            px-4 py-2
            bg-gradient-to-r from-orange-500/25 to-amber-500/25
            border border-orange-400/40
            text-orange-300
            rounded-lg
            text-sm font-bold tracking-wide
            backdrop-blur-sm
            skew-x-2
          ">
            {levels}
          </span>

          {/* 技能徽章 */}
          <span className="
            px-4 py-2
            bg-gradient-to-r from-purple-500/25 to-pink-500/25
            border border-purple-400/40
            text-purple-300
            rounded-lg
            text-sm font-bold tracking-wide
            backdrop-blur-sm
            skew-x-2
          ">
            {lesson.casi?.Primary_Skill || '技能'}
          </span>
        </div>

        {/* 底部速度條紋（裝飾） */}
        <div className="
          absolute bottom-2 left-6 right-6
          h-1
          bg-gradient-to-r from-transparent via-amber-500/20 to-transparent
          rounded-full
        " />
      </div>
    </Link>
  );
}
