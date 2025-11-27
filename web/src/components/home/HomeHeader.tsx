import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { User } from '@supabase/supabase-js';

interface HomeHeaderProps {
    user: User | null;
    search: string;
    setSearch: (value: string) => void;
    setShowAll: (value: boolean) => void;
    signOut: () => void;
}

export function HomeHeader({ user, search, setSearch, setShowAll, signOut }: HomeHeaderProps) {
    return (
        <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-md border-b border-white/10 p-4">
            <div className="flex justify-between items-center mb-3">
                <h1 className="text-xl font-bold text-white">
                    🏂 <span className="text-gradient">單板教學</span>
                </h1>
                <div className="flex items-center gap-3">
                    <Link href="/feedback" className="text-lg hover:scale-110 transition-transform" title="意見回報">💬</Link>
                    {user && <Link href="/practice" className="text-lg hover:scale-110 transition-transform">📝</Link>}
                    {user && <Link href="/favorites" className="text-lg hover:scale-110 transition-transform">❤️</Link>}
                    {user ? (
                        <button onClick={() => signOut()} className="text-sm text-zinc-400 hover:text-white transition-colors">登出</button>
                    ) : (
                        <Link href="/login" className="text-sm text-brand-red hover:text-red-400 transition-colors font-medium">登入</Link>
                    )}
                </div>
            </div>
            <SearchBar value={search} onChange={(v) => { setSearch(v); setShowAll(false); }} />
        </header>
    );
}
