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
    );
}
