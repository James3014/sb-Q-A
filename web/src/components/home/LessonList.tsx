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
    // 未登入永遠只顯示 5 堂，已登入顯示全部
    const displayLessons = user ? filteredLessons : filteredLessons.slice(0, 5);
    const hasMore = !user && filteredLessons.length > 5;

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
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg text-center">
                    <p className="text-sm text-blue-300 mb-3">
                        還有 {filteredLessons.length - 5} 堂初級課程<br/>
                        登入後可查看全部 28 堂初級課程
                    </p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
                    >
                        立即登入
                    </button>
                </div>
            )}
        </section>
    );
}
