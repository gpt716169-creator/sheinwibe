import React, { useState, useEffect } from 'react';

// --- МИКРО-КОМПОНЕНТ ВЗРЫВА СНЕГА ---
const SnowExplosion = ({ trigger }) => {
  // Генерируем снежинки только в момент клика (изменения trigger)
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Создаем 12 частиц, разлетающихся в разные стороны
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      angle: (i / 12) * 360, // Распределяем по кругу
      distance: Math.random() * 60 + 40, // Разная дальность полета
      size: Math.random() * 4 + 2,
    }));
    setParticles(newParticles);
    
    // Очищаем через секунду, чтобы не грузить память
    const timer = setTimeout(() => setParticles([]), 800);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
        <style>
        {`
          @keyframes flyOut {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(0); opacity: 0; }
          }
        `}
        </style>
        {particles.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const x = Math.cos(rad) * p.distance;
            const y = Math.sin(rad) * p.distance;
            return (
                <div
                    key={p.id}
                    className="absolute bg-white rounded-full shadow-[0_0_5px_white]"
                    style={{
                        width: p.size,
                        height: p.size,
                        '--tw-translate-x': `${x}px`,
                        '--tw-translate-y': `${y}px`,
                        animation: 'flyOut 0.6s ease-out forwards'
                    }}
                />
            );
        })}
    </div>
  );
};

export default function LoyaltyCard({ points = 0, totalSpent = 0, onOpenDetails }) {
  const [isFlipped, setIsFlipped] = useState(false);
  // Счетчик кликов для триггера анимации снега
  const [flipCount, setFlipCount] = useState(0);

  // 1. ДИАГНОСТИКА
  useEffect(() => {
      // console.log("💳 LoyaltyCard debug:", totalSpent); 
  }, [totalSpent]);

  // 2. БЕЗОПАСНОСТЬ
  const safeSpent = Number(totalSpent) || 0;

  const handleFlip = () => {
      setIsFlipped(!isFlipped);
      setFlipCount(prev => prev + 1); // Триггерим взрыв снега
      window.Telegram?.WebApp?.HapticFeedback.impactOccurred('light'); // Вибрация при перевороте
  };

  const getLevelInfo = (spent) => {
      // Бронза
      if (spent < 15000) {
          return { 
              current: 'Bronze', 
              next: 'Silver', 
              target: 15000, 
              color: 'from-orange-700 via-orange-500 to-orange-800', 
              text: 'text-[#2a1205]',
              bgOverlay: 'bg-orange-500/10',
              percent: (spent / 15000) * 100, 
              icon: 'ac_unit' // Снежинка для зимы
          };
      }
      // Серебро
      if (spent < 50000) {
          return { 
              current: 'Silver', 
              next: 'Gold', 
              target: 50000, 
              color: 'from-slate-400 via-slate-200 to-slate-400', 
              text: 'text-slate-800', 
              bgOverlay: 'bg-slate-400/10',
              percent: ((spent - 15000) / 35000) * 100, 
              icon: 'ac_unit' 
          };
      }
      // Золото
      if (spent < 150000) {
          return { 
              current: 'Gold', 
              next: 'Platinum', 
              target: 150000, 
              color: 'from-yellow-600 via-yellow-300 to-yellow-600', 
              text: 'text-yellow-900', 
              bgOverlay: 'bg-yellow-500/10',
              percent: ((spent - 50000) / 100000) * 100, 
              icon: 'star' 
          };
      }
      // Платина
      return { 
          current: 'Platinum', 
          next: 'Max', 
          target: 150000, 
          color: 'from-blue-200 via-white to-blue-200', 
          text: 'text-blue-900', 
          bgOverlay: 'bg-blue-400/10',
          percent: 100, 
          icon: 'diamond' 
      };
  };

  const info = getLevelInfo(safeSpent);
  const remaining = Math.max(0, info.target - safeSpent);

  return (
    <div className="w-full h-52 perspective-1000 cursor-pointer group select-none relative z-10" onClick={handleFlip}>
        
        {/* Компонент снежного взрыва срабатывает при изменении flipCount */}
        {flipCount > 0 && <SnowExplosion trigger={flipCount} />}

        <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            {/* FRONT (Лицевая сторона) */}
            <div className={`absolute inset-0 backface-hidden rounded-2xl p-6 bg-gradient-to-br ${info.color} shadow-[0_0_30px_rgba(255,255,255,0.2)] overflow-hidden flex flex-col justify-between z-20 border border-white/40`}>
                
                {/* Эффект инея / блеска */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/40 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <p className={`font-bold text-[10px] uppercase tracking-[0.2em] opacity-80 ${info.text}`}>Баланс WIBE</p>
                        <h2 className={`text-5xl font-black mt-1 tracking-tighter ${info.text} drop-shadow-sm`}>{points.toLocaleString()}</h2>
                    </div>
                    {/* Иконка в кружочке */}
                    <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-md shadow-inner border border-white/40 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/60 opacity-50"></div>
                        <span className={`material-symbols-outlined text-2xl ${info.text} relative z-10`}>{info.icon}</span>
                    </div>
                </div>

                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <p className={`text-xs font-bold opacity-70 mb-1 ${info.text}`}>Ваш уровень</p>
                        <span className={`font-black text-xl uppercase tracking-wider ${info.text} flex items-center gap-1`}>
                            {info.current} 
                            {/* Маленький значок елки для атмосферы */}
                            <span className="text-base opacity-80">🎄</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-70 bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">
                        <span className={`material-symbols-outlined text-sm ${info.text}`}>360</span>
                        <span className={`text-[9px] font-bold uppercase ${info.text}`}>Переверни</span>
                    </div>
                </div>
            </div>

            {/* BACK (Обратная сторона) */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-5 bg-[#1c2636] border border-white/10 shadow-xl overflow-hidden flex flex-col justify-between z-10 relative">
                
                {/* Фоновый узор снежинок на обороте */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

                <div className="flex justify-between items-center pb-3 border-b border-white/5 relative z-10">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">Прогресс года</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${info.current === 'Bronze' ? 'bg-orange-500/20 text-orange-400' : info.current === 'Silver' ? 'bg-gray-400/20 text-gray-300' : info.current === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                        {info.current}
                    </span>
                </div>
                
                <div className="flex-1 flex flex-col justify-center py-2 relative z-10">
                    {info.next !== 'Max' ? (
                        <>
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-white/50">Выкуплено</span>
                                <span className="text-white font-bold">{safeSpent.toLocaleString()} ₽</span>
                            </div>
                            
                            {/* ПРОГРЕСС БАР */}
                            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden mb-3 border border-white/5 relative">
                                <div 
                                    className={`h-full bg-gradient-to-r ${info.color} absolute left-0 top-0 transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.3)]`} 
                                    style={{ width: `${Math.max(2, info.percent)}%` }} 
                                ></div>
                                {/* Блик на прогресс баре */}
                                <div className="absolute top-0 bottom-0 w-[2px] bg-white/50 blur-[1px] animate-[ping_3s_ease-in-out_infinite]" style={{ left: `${info.percent}%` }}></div>
                            </div>

                            <p className="text-white/60 text-[10px] text-center">
                                Ещё <span className="text-primary font-bold">{remaining.toLocaleString()} ₽</span> до подарков уровня <span className="font-bold text-white uppercase">{info.next}</span> 🎁
                            </p>
                        </>
                    ) : (
                        <div className="text-center animate-pulse">
                            <span className="material-symbols-outlined text-cyan-300 text-4xl mb-2 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">diamond</span>
                            <p className="text-white font-bold text-sm">Король вечеринки!</p>
                            <p className="text-white/50 text-xs">Максимальный уровень стиля ❄️</p>
                        </div>
                    )}
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-center relative z-10">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onOpenDetails(); }}
                        className="text-xs text-primary font-bold uppercase tracking-wider hover:text-white transition-colors flex items-center gap-1 p-2 active:scale-95"
                    >
                        Подробнее <span className="material-symbols-outlined text-sm">info</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}
