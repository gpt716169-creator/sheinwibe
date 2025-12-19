import React, { useState } from 'react';

export default function LoyaltyCard({ points = 0, totalSpent = 0 }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showModal, setShowModal] = useState(false); // Состояние для модалки

  // Данные об уровнях для модалки
  const LEVELS_INFO = [
      { name: 'Bronze', range: '0 - 15 000 ₽', cashback: '1%', coupons: 'Обычные купоны', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
      { name: 'Silver', range: '15 000 - 50 000 ₽', cashback: '2%', coupons: 'Серебрянные купоны до 10%', color: 'text-gray-300', bg: 'bg-gray-400/10 border-gray-400/20' },
      { name: 'Gold', range: '50 000 - 150 000 ₽', cashback: '3%', coupons: 'Золотые купоны до 15%', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
      { name: 'Platinum', range: '> 150 000 ₽', cashback: '5%', coupons: 'VIP купоны до 20', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  ];

  // Логика текущего уровня
  const getLevelInfo = (spent) => {
      if (spent >= 150000) return { current: 'Platinum', next: 'Max', target: 150000, color: 'from-slate-300 via-slate-100 to-slate-300', text: 'text-slate-800', percent: 100, icon: 'diamond' };
      if (spent >= 50000) return { current: 'Gold', next: 'Platinum', target: 150000, color: 'from-yellow-600 via-yellow-400 to-yellow-600', text: 'text-yellow-900', percent: ((spent - 50000) / 100000) * 100, icon: 'hotel_class' };
      if (spent >= 15000) return { current: 'Silver', next: 'Gold', target: 50000, color: 'from-gray-400 via-gray-200 to-gray-400', text: 'text-gray-800', percent: ((spent - 15000) / 35000) * 100, icon: 'stars' };
      return { current: 'Bronze', next: 'Silver', target: 15000, color: 'from-orange-700 via-orange-400 to-orange-700', text: 'text-[#102216]', percent: (spent / 15000) * 100, icon: 'workspace_premium' };
  };

  const info = getLevelInfo(totalSpent);
  const remaining = Math.max(0, info.target - totalSpent);

  // Обработчик открытия модалки (чтобы карта не переворачивалась при клике на кнопку)
  const handleOpenDetails = (e) => {
      e.stopPropagation(); 
      setShowModal(true);
  };

  return (
    <>
        {/* === САМА КАРТА === */}
        <div className="w-full h-52 perspective-1000 cursor-pointer group select-none relative z-10" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* ЛИЦЕВАЯ СТОРОНА */}
                <div className={`absolute inset-0 backface-hidden rounded-2xl p-6 bg-gradient-to-br ${info.color} shadow-[0_0_30px_rgba(255,255,255,0.1)] overflow-hidden flex flex-col justify-between z-20`}>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/30 rounded-full blur-3xl"></div>
                    
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className={`font-bold text-[10px] uppercase tracking-[0.2em] opacity-80 ${info.text}`}>Баланс WIBE</p>
                            <h2 className={`text-5xl font-black mt-1 tracking-tighter ${info.text}`}>{points.toLocaleString()}</h2>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner border border-white/20">
                            <span className={`material-symbols-outlined text-2xl ${info.text}`}>{info.icon}</span>
                        </div>
                    </div>

                    <div className="relative z-10 flex justify-between items-end">
                        <div>
                            <p className={`text-xs font-bold opacity-60 mb-1 ${info.text}`}>Ваш уровень</p>
                            <span className={`font-black text-xl uppercase tracking-wider ${info.text}`}>{info.current}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-60">
                            <span className={`material-symbols-outlined text-xl ${info.text}`}>touch_app</span>
                        </div>
                    </div>
                </div>

                {/* ОБРАТНАЯ СТОРОНА */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-5 bg-[#1c2636] border border-white/10 shadow-xl overflow-hidden flex flex-col justify-between z-10">
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider">Прогресс</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${info.current === 'Bronze' ? 'bg-orange-500/20 text-orange-400' : info.current === 'Silver' ? 'bg-gray-400/20 text-gray-300' : info.current === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                            {info.current}
                        </span>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center py-2">
                        {info.next !== 'Max' ? (
                            <>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-white/50">Выкуплено</span>
                                    <span className="text-white font-bold">{totalSpent.toLocaleString()} ₽</span>
                                </div>
                                <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden mb-3 border border-white/5 relative">
                                    <div className={`h-full bg-gradient-to-r ${info.color} absolute left-0 top-0 transition-all duration-1000`} style={{width: `${Math.max(5, info.percent)}%`}}></div>
                                </div>
                                <p className="text-white/60 text-[10px] text-center">
                                    Ещё <span className="text-primary font-bold">{remaining.toLocaleString()} ₽</span> до уровня <span className="font-bold text-white uppercase">{info.next}</span>
                                </p>
                            </>
                        ) : (
                            <div className="text-center">
                                <span className="material-symbols-outlined text-yellow-500 text-4xl mb-2">diamond</span>
                                <p className="text-white font-bold text-sm">Максимальный уровень!</p>
                            </div>
                        )}
                    </div>

                    {/* КНОПКА "ПОДРОБНЕЕ" */}
                    <div className="pt-3 border-t border-white/5 flex justify-center">
                        <button 
                            onClick={handleOpenDetails}
                            className="text-xs text-primary font-bold uppercase tracking-wider hover:text-white transition-colors flex items-center gap-1 p-2 active:scale-95"
                        >
                            Подробнее об уровнях <span className="material-symbols-outlined text-sm">info</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* === МОДАЛЬНОЕ ОКНО С ИНФОРМАЦИЕЙ === */}
        {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={(e) => { e.stopPropagation(); setShowModal(false); }}>
                <div className="bg-[#151c28] w-full max-w-sm rounded-2xl border border-white/10 overflow-hidden flex flex-col shadow-2xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                    
                    {/* Заголовок */}
                    <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#1a2332]">
                        <h3 className="text-white font-bold text-lg">Уровни лояльности</h3>
                        <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Список уровней */}
                    <div className="p-5 overflow-y-auto space-y-4">
                        {LEVELS_INFO.map((lvl) => (
                            <div key={lvl.name} className={`p-4 rounded-xl border ${lvl.bg} relative ${info.current === lvl.name ? 'ring-1 ring-white/50' : ''}`}>
                                {info.current === lvl.name && (
                                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold uppercase text-white/70 bg-white/10 px-2 py-0.5 rounded-full">
                                        <span className="material-symbols-outlined text-[10px]">check</span> Ваш уровень
                                    </div>
                                )}
                                <h4 className={`font-bold text-lg uppercase ${lvl.color} mb-1`}>{lvl.name}</h4>
                                <p className="text-white/40 text-[10px] mb-3 font-mono">{lvl.range}</p>
                                
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm">payments</span>
                                        <p className="text-white text-xs"><span className="opacity-60">Кешбэк:</span> <span className="font-bold">{lvl.cashback}</span></p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="material-symbols-outlined text-emerald-400 text-sm">confirmation_number</span>
                                        <p className="text-white text-xs leading-tight"><span className="opacity-60">Бонусы:</span> <span className="font-bold text-emerald-400">{lvl.coupons}</span></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-5 border-t border-white/5 bg-[#151c28]">
                        <button onClick={() => setShowModal(false)} className="w-full h-12 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors">
                            Понятно
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
}
