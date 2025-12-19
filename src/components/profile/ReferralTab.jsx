import React from 'react';

export default function ReferralTab({ userId }) {
  const refLink = `https://t.me/sheinwibe_bot?start=ref_${userId}`;

  const copyRefLink = () => {
      navigator.clipboard.writeText(refLink);
      window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
      window.Telegram?.WebApp?.showAlert("Ссылка скопирована!");
  };

  return (
    <div className="px-6 space-y-4 animate-fade-in">
        <div className="bg-gradient-to-br from-primary via-emerald-600 to-emerald-800 rounded-2xl p-6 text-center relative overflow-hidden shadow-lg shadow-emerald-900/40">
            <div className="relative z-10">
                <h3 className="text-[#102216] font-bold text-xl mb-1">Пригласи друга</h3>
                <p className="text-[#102216]/80 text-sm mb-4 font-medium">Получи 200 WIBE за каждого!</p>
                <div className="bg-white/90 rounded-xl p-3 flex justify-between items-center gap-2 cursor-pointer shadow-inner active:scale-95 transition-transform" onClick={copyRefLink}>
                    <span className="text-xs text-gray-800 font-mono truncate flex-1">{refLink}</span>
                    <span className="material-symbols-outlined text-gray-600">content_copy</span>
                </div>
            </div>
            <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-[140px] text-white/20 rotate-12">groups</span>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
             <h4 className="text-white font-bold text-sm mb-2">Как это работает?</h4>
             <ul className="text-xs text-white/50 space-y-2 list-disc list-inside">
                 <li>Отправь ссылку другу</li>
                 <li>Друг делает первый заказ</li>
                 <li>Ты получаешь 200 WIBE на счет</li>
             </ul>
        </div>
    </div>
  );
}
