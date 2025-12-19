import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function CouponModal({ onClose, onApply, activeCoupon }) {
  const [manualCode, setManualCode] = useState('');

  // Блокируем скролл
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => document.body.style.overflow = 'auto';
  }, []);

  // Тестовые купоны (потом можно грузить с сервера)
  const availableCoupons = [
    { 
      code: 'WELCOME', 
      title: 'Приветственный бонус', 
      desc: 'Скидка на первый заказ', 
      amount: '500 ₽',
      color: 'from-emerald-600 to-emerald-800'
    },
    { 
      code: 'SALE10', 
      title: 'Скидка 10%', 
      desc: 'На все товары от 5000 ₽', 
      amount: '10%',
      color: 'from-purple-600 to-blue-600'
    }
  ];

  const handleApplyManual = () => {
    if (manualCode.trim()) {
      onApply(manualCode);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] bg-[#101622]/90 backdrop-blur-sm flex flex-col animate-fade-in"
      onClick={onClose}
    >
      {/* Контент модалки */}
      <div 
        className="mt-auto bg-[#1c2636] rounded-t-3xl border-t border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()} // Чтобы клик внутри не закрывал окно
      >
        {/* Шапка */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#151b26]">
           <h3 className="text-white font-bold text-lg">Купоны и скидки</h3>
           <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white">
               <span className="material-symbols-outlined text-sm">close</span>
           </button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto pb-safe-bottom">
           
           {/* 1. Поле ввода ручного промокода */}
           <div className="flex gap-3">
              <input 
                 value={manualCode}
                 onChange={(e) => setManualCode(e.target.value)}
                 className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 text-sm focus:border-primary outline-none uppercase font-bold"
                 placeholder="Есть промокод?"
              />
              <button 
                 onClick={handleApplyManual}
                 className="bg-white/10 text-white px-5 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors"
              >
                 OK
              </button>
           </div>

           {/* 2. Список купонов */}
           <div className="space-y-3">
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Доступные купоны</p>
              
              {availableCoupons.map((coupon) => {
                 const isActive = activeCoupon === coupon.code;
                 
                 return (
                    <div 
                       key={coupon.code}
                       onClick={() => onApply(coupon.code)}
                       className={`relative group overflow-hidden rounded-2xl p-4 border transition-all cursor-pointer active:scale-[0.98] ${isActive ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'}`}
                    >
                       {/* Фон карточки (градиент) */}
                       <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${coupon.color} blur-2xl opacity-20 -mr-6 -mt-6`}></div>

                       <div className="relative z-10 flex justify-between items-center">
                          <div>
                             <h4 className="text-white font-bold">{coupon.title}</h4>
                             <p className="text-white/50 text-xs mt-1">{coupon.desc}</p>
                             <div className="mt-3 inline-flex items-center gap-2 bg-black/20 px-2 py-1 rounded-lg border border-white/5">
                                <span className="material-symbols-outlined text-[14px] text-white/60">confirmation_number</span>
                                <span className="text-xs font-mono font-bold text-white/80 tracking-widest">{coupon.code}</span>
                             </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                             <span className="text-xl font-black text-white">{coupon.amount}</span>
                             {isActive ? (
                                <div className="flex items-center gap-1 text-primary text-xs font-bold bg-primary/20 px-2 py-1 rounded-lg">
                                   <span className="material-symbols-outlined text-sm">check</span>
                                   Применен
                                </div>
                             ) : (
                                <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/20 group-hover:text-white group-hover:border-white transition-colors">
                                   <span className="material-symbols-outlined text-lg">add</span>
                                </span>
                             )}
                          </div>
                       </div>
                    </div>
                 );
              })}
           </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
