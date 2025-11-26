'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getLessons, Lesson } from '@/lib/lessons';
import LessonCard from '@/components/LessonCard';
import SearchBar from '@/components/SearchBar';
import { useAuth } from '@/components/AuthProvider';
import { signOut } from '@/lib/auth';

const PROBLEM_CATEGORIES = [
  { id: 'heel', label: '後刃問題', keywords: ['後刃', '後腳', '後膝'], emoji: '🦶' },
  { id: 'toe', label: '前刃問題', keywords: ['前刃', '前腳', '前膝', '前腿'], emoji: '👣' },
  { id: 'edge', label: '換刃卡卡', keywords: ['換刃', '換邊', '轉換'], emoji: '🔄' },
  { id: 'balance', label: '重心不穩', keywords: ['重心', '平衡', '居中'], emoji: '⚖️' },
  { id: 'speed', label: '速度控制', keywords: ['控速', '減速', '煞車', '太快'], emoji: '🎿' },
  { id: 'mogul', label: '蘑菇地形', keywords: ['蘑菇', '包', 'mogul'], emoji: '🍄' },
  { id: 'steep', label: '陡坡技巧', keywords: ['陡坡', '黑道', '陡'], emoji: '⛷️' },
  { id: 'stance', label: '站姿調整', keywords: ['站姿', '姿勢', '站直'], emoji: '🧍' },
];

export default function Home() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    getLessons().then(data => {
      setLessons(data);
      setLoading(false);
    });
  }, []);

  const filteredLessons = useMemo(() => {
    let result = lessons;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.what.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      const cat = PROBLEM_CATEGORIES.find(c => c.id === selectedCategory);
      if (cat) {
        result = result.filter(l =>
          cat.keywords.some(k => l.title.includes(k) || l.what.includes(k))
        );
      }
    }

    return result;
  }, [lessons, search, selectedCategory]);

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
        {user && !search && !selectedCategory && (
          <div className="bg-zinc-800 rounded-lg p-3 text-sm text-zinc-300">
            💡 進入課程後，點 <span className="text-red-400">❤️</span> 收藏、點 <span className="text-blue-400">📝</span> 記錄練習
          </div>
        )}

        {!search && (
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
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700'
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
              {loading ? '載入中...' : search || selectedCategory
                ? `找到 ${filteredLessons.length} 筆`
                : '熱門課程'}
            </h2>
            {(search || selectedCategory) && (
              <button onClick={clearFilters} className="text-xs text-blue-400">
                清除篩選
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-center text-zinc-500 py-8">載入課程中...</p>
          ) : filteredLessons.length === 0 ? (
            <p className="text-center text-zinc-500 py-8">找不到相關課程</p>
          ) : (
            <div className="space-y-3">
              {displayLessons.map(lesson => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))}
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
      </div>
    </main>
  );
}
