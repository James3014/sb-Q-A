'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getLessons, Lesson } from '@/lib/lessons';
import { useAuth } from '@/components/AuthProvider';
import { signOut } from '@/lib/auth';
import { useFilteredLessons } from '@/lib/useFilteredLessons';
import { trackEvent } from '@/lib/analytics';
import { PageContainer } from '@/components/ui';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

// Components
import { HomeHeader } from '@/components/home/HomeHeader';
import { FilterBar } from '@/components/home/FilterBar';
import { ProblemCategories } from '@/components/home/ProblemCategories';
import { LessonList } from '@/components/home/LessonList';

export default function Home() {
  return (
    <Suspense fallback={<PageContainer className="p-4 text-center">載入中...</PageContainer>}>
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
  
  // 等待 lessons 載入完成後才恢復滾動位置
  useScrollRestoration(!loading);

  const levelFilter = searchParams.get('level');
  const slopeFilter = searchParams.get('slope');
  const skillFilter = searchParams.get('skill');
  const hasTagFilter = !!(levelFilter || slopeFilter || skillFilter);

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

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    setShowAll(false);
  };

  return (
    <PageContainer>
      <HomeHeader
        user={user}
        search={search}
        setSearch={setSearch}
        setShowAll={setShowAll}
        signOut={signOut}
      />

      <div className="p-4 space-y-6">
        <FilterBar
          levelFilter={levelFilter}
          slopeFilter={slopeFilter}
          skillFilter={skillFilter}
          hasTagFilter={hasTagFilter}
        />

        {user && !search && !selectedCategory && !hasTagFilter && (
          <div className="bg-zinc-800 rounded-lg p-3 text-sm text-zinc-300">
            💡 進入課程後，點 <span className="text-red-400">❤️</span> 收藏、點 <span className="text-blue-400">📝</span> 記錄練習
          </div>
        )}

        {!search && !hasTagFilter && (
          <ProblemCategories
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            setShowAll={setShowAll}
          />
        )}

        <LessonList
          loading={loading}
          filteredLessons={filteredLessons}
          showAll={showAll}
          setShowAll={setShowAll}
          search={search}
          selectedCategory={selectedCategory}
          hasTagFilter={hasTagFilter}
          clearFilters={clearFilters}
        />

        {/* 回報入口 */}
        <div className="text-center pt-4 pb-8">
          <Link href="/feedback" className="text-zinc-500 text-sm hover:text-zinc-300">
            💬 意見回報
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
