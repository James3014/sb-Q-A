'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getLessons, Lesson } from '@/lib/lessons';
import LessonCard from '@/components/LessonCard';
import SearchBar from '@/components/SearchBar';
import { useAuth } from '@/components/AuthProvider';
import { signOut } from '@/lib/auth';
import { LEVEL_NAMES, SLOPE_NAMES, PROBLEM_CATEGORIES } from '@/lib/constants';
import { useFilteredLessons } from '@/lib/useFilteredLessons';
import { trackEvent } from '@/lib/analytics';

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-900 text-white p-4 text-center">載入中...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { user } = useAuth();
  const searchTimer = useRef<NodeJS.Timeout>(null);

  const levelFilter = searchParams.get('level');
  const slopeFilter = searchParams.get('slope');
  const skillFilter = searchParams.get('skill');
  const hasTagFilter = levelFilter || slopeFilter || skillFilter;

  useEffect(() => {
    getLessons().then(data => {
      setLessons(data);
      setLoading(false);
    });
  }, []);

  // 搜尋追蹤 (debounce 1秒)
  useEffect(() => {
    if (search.length >= 2) {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        trackEvent('search_keyword', undefined, { keyword: search });
      }, 1000);
    }
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  const filteredLessons = useFilteredLessons({
    lessons,
    search,
    selectedCategory,
    levelFilter,
    slopeFilter,
    skillFilter,
  });

  const displayLessons = showAll ? filteredLessons : filteredLessons.slice(0, 10);
  const hasMore = filteredLessons.length > 10 && !showAll;

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    setShowAll(false);
  };

  return (
    <main className="min-h-screen bg-zinc-900 text-white">
      <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 p-4">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold">🏂 單板教學</h1>
          <div className="flex items-center gap-3">
            <Link href="/feedback" className="text-lg" title="意見回報">💬</Link>
            {user && <Link href="/practice" className="text-lg">📝</Link>}
            {user && <Link href="/favorites" className="text-lg">❤️</Link>}
            {user ? (
              <button onClick={() => signOut()} className="text-sm text-zinc-400">登出</button>
            ) : (
              <Link href="/login" className="text-sm text-blue-400">登入</Link>
            )}
          </div>
        </div>
        <SearchBar value={search} onChange={(v) => { setSearch(v); setShowAll(false); }} />
      </header>

      <div className="p-4 space-y-6">
        {hasTagFilter && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-zinc-400">篩選：</span>
            {levelFilter && (
              <span className="px-2 py-1 text-xs rounded-full bg-green-600">
                {LEVEL_NAMES[levelFilter] || levelFilter}
              </span>
            )}
            {slopeFilter && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-600">
                {SLOPE_NAMES[slopeFilter] || slopeFilter}
              </span>
            )}
            {skillFilter && (
              <span className="px-2 py-1 text-xs rounded-full bg-purple-600">{skillFilter}</span>
            )}
            <Link href="/" className="text-xs text-blue-400 ml-2">清除</Link>
          </div>
        )}

        {user && !search && !selectedCategory && !hasTagFilter && (
          <div className="bg-zinc-800 rounded-lg p-3 text-sm text-zinc-300">
            💡 進入課程後，點 <span className="text-red-400">❤️</span> 收藏、點 <span className="text-blue-400">📝</span> 記錄練習
          </div>
        )}

        {!search && !hasTagFilter && (
          <section>
            <h2 className="text-sm text-zinc-400 mb-3">你遇到什麼問題？</h2>
            <div className="grid grid-cols-2 gap-2">
              {PROBLEM_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                    setShowAll(false);
                  }}
                  className={`p-3 rounded-lg text-left transition-all ${
                    selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'
                  }`}
                >
                  <span className="text-lg mr-2">{cat.emoji}</span>
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm text-zinc-400">
              {loading ? '載入中...' : search || selectedCategory || hasTagFilter
                ? `找到 ${filteredLessons.length} 筆`
                : '熱門課程'}
            </h2>
            {(search || selectedCategory) && (
              <button onClick={clearFilters} className="text-xs text-blue-400">清除篩選</button>
            )}
          </div>

          {loading ? (
            <p className="text-center text-zinc-500 py-8">載入課程中...</p>
          ) : filteredLessons.length === 0 ? (
            <p className="text-center text-zinc-500 py-8">找不到相關課程</p>
          ) : (
            <div className="space-y-6">
              {displayLessons.map(lesson => <LessonCard key={lesson.id} lesson={lesson} />)}
            </div>
          )}

          {hasMore && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full mt-4 py-3 bg-zinc-800 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700"
            >
              顯示全部 {filteredLessons.length} 筆
            </button>
          )}
        </section>

        {/* 回報入口 */}
        <div className="text-center pt-4 pb-8">
          <Link href="/feedback" className="text-zinc-500 text-sm hover:text-zinc-300">
            💬 意見回報
          </Link>
        </div>
      </div>
    </main>
  );
}
