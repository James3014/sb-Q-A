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
import { useHomePersistence } from '@/hooks/useHomePersistence';

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
  const { user, subscription } = useAuth();
  const searchTimer = useRef<NodeJS.Timeout>(null);

  // 資料載入完成後恢復滾動位置
  useHomePersistence(!loading);

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

  // 追蹤搜尋無結果
  useEffect(() => {
    if (search.length >= 2 && filteredLessons.length === 0 && !loading) {
      trackEvent('search_no_result', undefined, { keyword: search });
    }
  }, [search, filteredLessons.length, loading]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    setShowAll(false);
  };

  return (
    <PageContainer>
      <HomeHeader
        user={user}
        subscription={subscription}
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
            💡 進入課程後，點 <span className="text-red-400">❤️</span> 收藏、點 <span className="text-blue-400">📝</span> 紀錄練習
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
          user={user}
        />

        {/* 🆕 升級 CTA - 免費用戶看到 28 筆課程後的升級提示 */}
        {user && !subscription.isActive && !search && !hasTagFilter && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">🏔️</div>
            <h3 className="text-lg font-bold text-white mb-2">想學習進階技巧？</h3>
            <p className="text-sm text-zinc-300 mb-4">
              升級到 PRO 解鎖 185+ 進階課程，掌握黑道、野雪等高難度技能
            </p>
            <Link
              href="/pricing"
              className="inline-block px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 font-bold rounded-lg hover:shadow-lg hover:shadow-amber-500/50 transition-all transform hover:scale-105"
            >
              查看 PRO 方案 →
            </Link>
          </div>
        )}

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
