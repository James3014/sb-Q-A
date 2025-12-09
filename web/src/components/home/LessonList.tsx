import LessonCard from '@/components/LessonCard';
import { Lesson } from '@/lib/lessons';
import { User } from '@supabase/supabase-js';

interface LessonListProps {
    loading: boolean;
    filteredLessons: Lesson[];
    showAll: boolean;
    setShowAll: (show: boolean) => void;
    search: string;
    selectedCategory: string | null;
    hasTagFilter: boolean;
    clearFilters: () => void;
    user: User | null;
}

export function LessonList({
    loading,
    filteredLessons,
    showAll,
    setShowAll,
    search,
    selectedCategory,
    hasTagFilter,
    clearFilters,
    user,
}: LessonListProps) {
    // 未登入只顯示 5 堂，已登入顯示全部
    const displayLessons = !user && !showAll ? filteredLessons.slice(0, 5) : filteredLessons;
    const hasMore = !user && filteredLessons.length > 5 && !showAll;

    // 判斷來源
    const from = search ? 'search' : selectedCategory ? 'category' : hasTagFilter ? 'filter' : 'home';

    return (
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
                    {displayLessons.map(lesson => (
                        <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            from={from}
                        />
                    ))}
                </div>
            )}

            {hasMore && (
                <button
                    onClick={() => {
                        if (confirm('登入後可查看全部 28 堂初級課程，是否前往登入？')) {
                            window.location.href = '/login'
                        }
                    }}
                    className="w-full mt-4 py-3 bg-zinc-800 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700"
                >
                    登入查看全部 {filteredLessons.length} 堂初級課程
                </button>
            )}
        </section>
    );
}
