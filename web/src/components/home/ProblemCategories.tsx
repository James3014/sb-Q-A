import { PROBLEM_CATEGORIES } from '@/lib/constants';

interface ProblemCategoriesProps {
    selectedCategory: string | null;
    setSelectedCategory: (id: string | null) => void;
    setShowAll: (show: boolean) => void;
}

export function ProblemCategories({ selectedCategory, setSelectedCategory, setShowAll }: ProblemCategoriesProps) {
    return (
        <section>
            <h2 className="text-sm text-zinc-400 mb-3">你遇到什麼問題？</h2>
            
            {/* 水平滾動容器 */}
            <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                {PROBLEM_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                            setShowAll(false);
                        }}
                        className={`
                            flex-shrink-0 px-5 py-3 h-11 rounded-xl text-left transition-all whitespace-nowrap
                            ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}
                        `}
                    >
                        <span className="text-lg mr-2">{cat.emoji}</span>
                        <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}
