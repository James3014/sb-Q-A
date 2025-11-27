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
            <div className="grid grid-cols-2 gap-2">
                {PROBLEM_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                            setShowAll(false);
                        }}
                        className={`p-3 rounded-lg text-left transition-all ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'
                            }`}
                    >
                        <span className="text-lg mr-2">{cat.emoji}</span>
                        <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}
