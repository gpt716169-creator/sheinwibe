import React from 'react';

export default function ReviewsBanner() {
  const handleOpenChannel = () => {
    const link = 'https://t.me/reviewsheinwibe';
    // Используем нативный метод Telegram, чтобы канал открылся мгновенно внутри приложения
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(link);
    } else {
      window.open(link, '_blank');
    }
  };

  return (
    <div className="px-4 mt-2 mb-4 animate-fade-in">
      <button 
        onClick={handleOpenChannel}
        className="w-full relative overflow-hidden group bg-[#1A222D] border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-[0.98] transition-all duration-200"
      >
        {/* Фоновый градиент для красоты */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-center gap-4 z-10">
          {/* Иконка (камера или звезда) */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-[#00ff88] flex items-center justify-center text-[#101622] shadow-[0_0_15px_rgba(19,236,91,0.3)]">
            <span className="material-symbols-outlined text-2xl">photo_camera</span>
          </div>

          <div className="text-left">
            <h3 className="text-white font-bold text-base leading-tight">
              Живые отзывы
            </h3>
            <p className="text-white/50 text-xs mt-0.5">
              Смотри фото реальных заказов
            </p>
          </div>
        </div>

        {/* Стрелочка */}
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors z-10">
          <span className="material-symbols-outlined text-white/50 text-sm group-hover:text-white transition-colors">arrow_forward_ios</span>
        </div>
      </button>
    </div>
  );
}
