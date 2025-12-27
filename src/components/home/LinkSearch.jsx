import React, { useState, useEffect } from 'react';

export default function LinkSearch({ onSearch, isLocked }) {
    const [link, setLink] = useState('');
    const [loadingMsg, setLoadingMsg] = useState('');
    
    // Фразы, которые будут меняться
    const MESSAGES = [
        "Связываемся с SHEIN... 🌏",
        "Ищем твой товар... 🔎",
        "Проверяем наличие... 📦",
        "Скачиваем фоточки... 📸",
        "Считаем скидку... 💸",
        "Почти готово! 🎁"
    ];

    // Эффект для переключения сообщений
    useEffect(() => {
        let interval;
        if (isLocked) {
            let i = 0;
            setLoadingMsg(MESSAGES[0]);
            interval = setInterval(() => {
                i = (i + 1) % MESSAGES.length;
                setLoadingMsg(MESSAGES[i]);
            }, 2000); // Меняем фразу каждые 2 секунды
        } else {
            setLink(''); // Очищаем поле, когда блокировка снята
        }
        return () => clearInterval(interval);
    }, [isLocked]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!link.trim()) return;
        
        // Отправляем ссылку наверх
        onSearch(link);
        // isLocked переключится в Home.jsx и запустит анимацию здесь
    };

    return (
        <div className="relative z-20">
            {/* ЗАГОЛОВОК */}
            <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider opacity-80">
                    Поиск товаров
                </h3>
                {isLocked && (
                    <span className="text-[10px] text-white/40 animate-pulse">
                        Не закрывай меня...
                    </span>
                )}
            </div>

            {/* ОСНОВНОЙ КОНТЕЙНЕР */}
            <div className="relative h-14 w-full">
                
                {/* 1. СОСТОЯНИЕ ОЖИДАНИЯ (КРАСИВАЯ АНИМАЦИЯ) */}
                <div 
                    className={`absolute inset-0 bg-gradient-to-r from-red-600/80 to-purple-600/80 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center transition-all duration-500 transform ${
                        isLocked ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 -z-10'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        {/* Крутящийся спиннер */}
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        
                        {/* Меняющийся текст */}
                        <span className="text-white font-bold text-sm tracking-wide animate-fade-in key={loadingMsg}">
                            {loadingMsg}
                        </span>
                    </div>
                    
                    {/* Прогресс-бар внизу */}
                    <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full rounded-b-2xl overflow-hidden">
                        <div className="h-full bg-white/80 animate-[progress_10s_linear_forwards] w-full origin-left transform scale-x-0"></div>
                        <style>{`
                            @keyframes progress {
                                0% { transform: scaleX(0); }
                                100% { transform: scaleX(1); }
                            }
                        `}</style>
                    </div>
                </div>

                {/* 2. ОБЫЧНОЕ СОСТОЯНИЕ (ИНПУТ) */}
                <form 
                    onSubmit={handleSubmit}
                    className={`absolute inset-0 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center pl-4 pr-2 transition-all duration-500 ${
                        isLocked ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`}
                >
                    <span className="material-symbols-outlined text-white/40 mr-2">link</span>
                    
                    <input
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="Вставь ссылку на товар..."
                        className="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none font-medium"
                        disabled={isLocked}
                    />

                    {link && (
                        <button 
                            type="submit"
                            className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all shadow-lg"
                        >
                            <span className="material-symbols-outlined text-xl">search</span>
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}
