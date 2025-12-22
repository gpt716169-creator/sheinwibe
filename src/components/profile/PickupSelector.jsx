import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// ⚠️ Вставь сюда свои данные или импортируй из конфига
const supabase = createClient('https://nneccwuagyietimdqmoa.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uZWNjd3VhZ3lpZXRpbWRxbW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MzExNjQsImV4cCI6MjA4MTEwNzE2NH0.uPrGg6LoJgSff6WLFfRGCdYZBTXUPssqAPjyXW8FzwY');

export default function PickupSelector({ onSelect, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Логика поиска с задержкой (чтобы не спамить базу)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 3) return; 
            
            setLoading(true);
            const { data, error } = await supabase
                .rpc('search_pickup_points', { search_term: query });
            
            if (!error && data) {
                setResults(data);
            }
            setLoading(false);
        }, 600); // Ищем через 600мс после окончания ввода

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="fixed inset-0 z-[70] bg-[#101622] flex flex-col animate-fade-in">
            {/* Шапка поиска */}
            <div className="p-4 border-b border-white/10 flex gap-3 items-center">
                <button onClick={onClose} className="text-white/50 text-2xl">&larr;</button>
                <input 
                    autoFocus
                    placeholder="Город или улица (мин. 3 буквы)..."
                    className="flex-1 bg-transparent text-white outline-none placeholder:text-white/30"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
            </div>

            {/* Список результатов */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading && <div className="text-center text-white/40 mt-4">Поиск...</div>}
                
                {!loading && results.length === 0 && query.length > 2 && (
                    <div className="text-center text-white/30 mt-4">Ничего не найдено</div>
                )}

                {results.map((point) => (
                    <div 
                        key={point.id}
                        onClick={() => onSelect(point)}
                        className="bg-white/5 p-4 rounded-xl active:bg-white/20 border border-transparent hover:border-white/20 cursor-pointer transition-all"
                    >
                        <div className="text-white font-bold text-sm">{point.city}</div>
                        <div className="text-white/70 text-xs mt-1">{point.full_address || point.address}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
