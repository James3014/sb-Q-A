'use client'
import Link from 'next/link';
import Image from 'next/image';
import SearchBar from '@/components/SearchBar';
import { User } from '@supabase/supabase-js';
import { useSnowMode } from '@/hooks/useSnowMode';
import { Subscription } from '@/lib/subscription';
import { handleProtectedFeatureClick } from '@/lib/accessControl';

interface HomeHeaderProps {
    user: User | null;
    subscription: Subscription;
    search: string;
    setSearch: (value: string) => void;
    signOut: () => void;
}

export function HomeHeader({ user, subscription, search, setSearch, signOut }: HomeHeaderProps) {
    const { snowMode, toggle } = useSnowMode();
    
    const canAccessFeatures = user && subscription.isActive;
    
    return (
        <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-md border-b border-white/10 p-4">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <Image src="/logo.jpeg" alt="Logo" width={36} height={36} className="rounded-lg" />
                    <h1 className="text-xl font-bold text-gradient">單板教學</h1>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={toggle} className="w-11 h-11 flex items-center justify-center text-xl hover:bg-zinc-800 rounded-lg active:scale-95 transition-all" title={snowMode ? '一般模式' : '雪地模式'}>
                        {snowMode ? '☀️' : '❄️'}
                    </button>
                    <Link href="/feedback" className="w-11 h-11 flex items-center justify-center text-xl hover:bg-zinc-800 rounded-lg active:scale-95 transition-all" title="意見回報">💬</Link>
                    
                    {/* 練習紀錄 */}
                    {canAccessFeatures ? (
                        <Link href="/practice" className="w-11 h-11 flex items-center justify-center text-xl hover:bg-zinc-800 rounded-lg active:scale-95 transition-all" title="練習紀錄">📝</Link>
                    ) : (
                        <button 
                            onClick={() => handleProtectedFeatureClick('練習紀錄', user, subscription)}
                            className="w-11 h-11 flex items-center justify-center text-xl hover:bg-zinc-800 rounded-lg active:scale-95 transition-all" 
                            title="練習紀錄"
                        >
                            📝
                        </button>
                    )}
                    
                    {/* 收藏 */}
                    {canAccessFeatures ? (
                        <Link href="/favorites" className="w-11 h-11 flex items-center justify-center text-xl hover:bg-zinc-800 rounded-lg active:scale-95 transition-all" title="收藏">❤️</Link>
                    ) : (
                        <button 
                            onClick={() => handleProtectedFeatureClick('收藏', user, subscription)}
                            className="w-11 h-11 flex items-center justify-center text-xl hover:bg-zinc-800 rounded-lg active:scale-95 transition-all" 
                            title="收藏"
                        >
                            ❤️
                        </button>
                    )}
                    
                    {user ? (
                        <button onClick={() => signOut()} className="h-11 px-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg active:scale-95 transition-all">登出</button>
                    ) : (
                        <Link href="/login" className="h-11 px-3 flex items-center text-sm text-brand-red hover:text-red-400 hover:bg-zinc-800 rounded-lg active:scale-95 transition-all font-medium">登入</Link>
                    )}
                </div>
            </div>
            <SearchBar value={search} onChange={setSearch} />
        </header>
    );
}
