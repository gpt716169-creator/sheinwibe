import React, { useState } from 'react';

export default function ReferralTab({ userId }) {
  const [copied, setCopied] = useState(false);

  // --- ВАЖНО: ПРАВИЛЬНАЯ ССЫЛКА ---
  // 1. Имя бота: sheinwibebot (без подчеркивания, как ты сказал)
  // 2. Short Name приложения: app (настроили в BotFather)
  // 3. Параметр: startapp (для запуска внутри Web App)
  const inviteLink = `https://t.me/sheinwibebot/app?startapp=ref_${userId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      
      // Вибрация для приятного ощущения
      if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }

      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    // Используем нативный шеринг Телеграма
    const text = "Смотри, какой крутой магазин SHEIN внутри Телеграма! 👇";
    const url = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(text)}`;
    window.Telegram?.WebApp?.openTelegramLink(url);
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Баннер */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6 rounded-2xl border border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <h3 className="text-white font-bold text-lg relative z-10">Пригласи друга</h3>
        <p className="text-white/60 text-sm mt-1 relative z-10 max-w-[80%]">
          Получи <span className="text-primary font-bold">500 баллов</span> за каждого друга, который сделает первый заказ!
        </p>
      </div>

      {/* Ссылка */}
      <div className="bg-[#1c2636] p-4 rounded-2xl border border-white/5 space-y-4">
         <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Твоя уникальная ссылка</p>
         
         <div className="flex gap-3 items-center bg-black/30 p-3 rounded-xl border border-white/5">
            <span className="material-symbols-outlined text-white/30">link</span>
            <div className="flex-1 min-w-0">
                <p className="text-primary text-sm font-mono truncate">{inviteLink}</p>
            </div>
            <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <span className={`material-symbols-outlined ${copied ? 'text-green-400' : 'text-white/50'}`}>
                    {copied ? 'check' : 'content_copy'}
                </span>
            </button>
         </div>

         <button 
            onClick={handleShare}
            className="w-full py-4 bg-primary text-black font-bold rounded-xl text-sm uppercase tracking-wide shadow-[0_0_20px_rgba(19,236,91,0.2)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
         >
            <span className="material-symbols-outlined">ios_share</span>
            Поделиться с другом
         </button>
      </div>

      {/* Статистика (Заглушка) */}
      <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1c2636] p-4 rounded-2xl border border-white/5 text-center">
              <p className="text-2xl font-black text-white">0</p>
              <p className="text-xs text-white/40 mt-1">Приглашено</p>
          </div>
          <div className="bg-[#1c2636] p-4 rounded-2xl border border-white/5 text-center">
              <p className="text-2xl font-black text-primary">0</p>
              <p className="text-xs text-white/40 mt-1">Заработано баллов</p>
          </div>
      </div>
    </div>
  );
}
