import { PROBLEM_CATEGORIES } from '@/lib/constants';

interface ProblemCategoriesProps {
    selectedCategory: string | null;
    setSelectedCategory: (id: string | null) => void;
}

export function ProblemCategories({ selectedCategory, setSelectedCategory }: ProblemCategoriesProps) {
    // Priority 2: 定義優先按鈕（最常見問題）
    const PRIORITY_CATEGORIES = ['heel', 'toe'];

    return (
        <section>
            {/* 標題：Alpine Velocity 風格 */}
            <h2
                className="text-base font-bold mb-4 tracking-wide"
                style={{ fontFamily: 'var(--font-display)' }}
            >
                你遇到什麼問題？
            </h2>

            {/* 水平滾動容器 */}
            <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                {PROBLEM_CATEGORIES.map(cat => {
                    const isSelected = selectedCategory === cat.id;
                    const isPriority = PRIORITY_CATEGORIES.includes(cat.id);

                    return (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setSelectedCategory(isSelected ? null : cat.id);
                                // 觸覺回饋
                                if (navigator.vibrate) navigator.vibrate(10);
                            }}
                            className={`
                                velocity-shine
                                relative
                                flex-shrink-0
                                px-6 py-3
                                min-h-[48px]
                                rounded-xl
                                text-left
                                whitespace-nowrap
                                transition-all duration-200
                                active:scale-95

                                ${isSelected
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black border-2 border-amber-400 shadow-lg shadow-amber-500/30'
                                    : isPriority
                                    ? 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-2 border-amber-500/50 text-amber-200 hover:border-amber-500/70'
                                    : 'bg-zinc-800 border-2 border-zinc-700 hover:border-zinc-600'
                                }
                            `}
                        >
                            {/* Emoji + 標籤 */}
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl leading-none">{cat.emoji}</span>
                                <span
                                    className={`text-sm font-bold tracking-wide ${isSelected ? 'text-black' : 'text-white'}`}
                                    style={{ fontFamily: isSelected ? 'var(--font-display)' : 'inherit' }}
                                >
                                    {cat.label}
                                </span>
                            </div>

                            {/* 選中指示器（底部條紋） */}
                            {isSelected && (
                                <div className="
                                    absolute bottom-1 left-1/2 -translate-x-1/2
                                    w-3/4 h-0.5
                                    bg-black/30
                                    rounded-full
                                " />
                            )}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
