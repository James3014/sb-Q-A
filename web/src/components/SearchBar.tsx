'use client';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜尋問題，例如：後刃 抖"
        className="w-full h-14 px-5 pl-12 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-lg"
      />
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl">🔍</span>
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white active:scale-95"
        >
          ✕
        </button>
      )}
    </div>
  );
}
