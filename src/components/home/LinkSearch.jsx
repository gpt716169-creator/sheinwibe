import React, { useState, useEffect } from 'react';

export default function LinkSearch({ onSearch, isLocked = false }) {
  const [link, setLink] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('');

  // Фразы для анимации
  const MESSAGES = [
      "Связываемся с SHEIN... 🌏",
      "Ищем твой товар... 🔎",
      "Проверяем наличие... 📦",
      "Скачиваем фоточки... 📸",
      "Считаем скидку... 💸",
      "Почти готово! 🎁"
  ];

  // Логика переключения фраз
  useEffect(() => {
      let interval;
      if (isLocked) {
          let i = 0;
          setLoadingMsg(MESSAGES[0]);
          interval = setInterval(() => {
              i = (i + 1) % MESSAGES.length;
              setLoadingMsg(MESSAGES[i]);
          }, 1500); // Меняем каждые 1.5 сек
      } else {
          // Если блокировка снялась, чистим поле (если нужно)
          if (!isLocked && link) setLink(''); 
      }
      return () => clearInterval(interval);
  }, [isLocked]);

  const handleSubmit = () => {
    if (!link.trim() || isLocked) return;
    
    // Отправляем ссылку наверх в Home.jsx
    onSearch(link);
    // Поле очистится само, когда isLocked станет false через 10 секунд
  };

  // --- РЕЖИМ ОЖИДАНИЯ (КРАСИВАЯ АНИМАЦИЯ) ---
  if (isLocked) {
      return (
        <div className="w-full h-32 relative bg-gradient-to-r from-[#1c2636] to-[#161f2e] border border-white/10 rounded-2xl overflow-hidden flex flex-col items-center justify-center animate-fade-in">
            {/* Фоновый пульс */}
            <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
            
            {/* Контент */}
            <div className="z-10 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-white font-bold text-sm tracking-wide animate-pulse">
                    {loadingMsg}
                </span>
                <span className="text-white/30 text-[10px]">Подождите ~10 сек</span>
            </div>

            {/* Прогресс бар внизу */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
                <div className="h-full bg-primary animate-[progress_10s_linear_forwards] origin-left scale-x-0 w-full"></div>
            </div>
            
            {/* Стиль для анимации прогресс бара */}
            <style>{`
                @keyframes progress {
                    0% { transform: scaleX(0); }
                    100% { transform: scaleX(1); }
                }
            `}</style>
        </div>
      );
  }

  // --- ОБЫЧНЫЙ РЕЖИМ (ТВОЙ ДИЗАЙН) ---
  return (
    <div className="w-full space-y-3 animate-fade-in">
        <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-white/40">link</span>
            </div>
            <input 
                type="text" 
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Вставьте ссылку на товар SHEIN..." 
                className="w-full h-14 pl-12 pr-12 bg-[#1c2636] border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-lg"
            />
            {link && (
                <button 
                    onClick={() => setLink('')}
                    className="absolute inset-y-0 right-4 flex items-center text-white/30 hover:text-white"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            )}
        </div>
        
        <button 
            onClick={handleSubmit}
            disabled={!link}
            className={`w-full h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                link 
                ? 'bg-gradient-to-r from-primary to-emerald-600 text-[#102216] shadow-primary/20 active:scale-[0.98]' 
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
        >
            <span>Найти и добавить</span>
            <span className="material-symbols-outlined">search</span>
        </button>
    </div>
  );
}
