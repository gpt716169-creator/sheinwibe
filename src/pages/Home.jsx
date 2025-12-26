import React, { useState, useEffect, useMemo } from 'react';
import LinkSearch from '../components/home/LinkSearch';
import ActiveOrders from '../components/home/ActiveOrders';
import LoyaltyCard from '../components/home/LoyaltyCard';
import LoyaltyModal from '../components/home/LoyaltyModal';
import FullScreenVideo from '../components/ui/FullScreenVideo';
import ReviewsBanner from '../components/home/ReviewsBanner';

// --- КОМПОНЕНТ СНЕГА (Внутренний) ---
const SnowEffect = () => {
  // Создаем массив снежинок один раз, чтобы не перерендеривать
  const snowflakes = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 3 + 5}s`,
    animationDelay: `${Math.random() * 5}s`,
    opacity: Math.random() * 0.5 + 0.3,
    size: Math.random() * 10 + 5
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <style>
        {`
          @keyframes snowfall {
            0% { transform: translateY(-10px) rotate(0deg); }
            100% { transform: translateY(100vh) rotate(360deg); }
          }
        `}
        </style>
        {snowflakes.map((flake) => (
            <div
                key={flake.id}
                className="absolute text-white"
                style={{
                    left: flake.left,
                    top: -20,
                    fontSize: `${flake.size}px`,
                    opacity: flake.opacity,
                    animation: `snowfall ${flake.animationDuration} linear infinite`,
                    animationDelay: flake.animationDelay,
                }}
            >
                ❄
            </div>
        ))}
    </div>
  );
};

export default function Home({ user, dbUser, setActiveTab }) {
  const [activeOrders, setActiveOrders] = useState([]);
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);
   
  // Состояние для видео-инструкции
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const TUTORIAL_VIDEO_URL = "https://storage.yandexcloud.net/videosheinwibe/202512261655%20(1).mp4";
   
  // Ссылки
  const VPN_LINK = "https://t.me/hitvpnbot?start=187358585644246";
  
  // Новая ссылка-джампер (Deep Link)
  const SHEIN_LINK = "https://api-shein.shein.com/h5/sharejump/appjump?lan=ru&country=RU"; 

  // --- ЭФФЕКТЫ ---
  useEffect(() => {
    if (user?.id) {
        loadData();
    }
  }, [user]);

  // --- ФУНКЦИИ ---
  const loadData = async () => {
      try {
          const res = await fetch(`https://proshein.com/webhook/get-orders?tg_id=${user?.id}`);
          const json = await res.json();
          setActiveOrders(json.orders || json.items || []);
      } catch (e) { console.error("Err loading orders", e); }
  };

  const handleSearch = async (link) => {
      window.Telegram?.WebApp?.MainButton.showProgress();
      try {
          const res = await fetch('https://proshein.com/webhook/parse-shein', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ link, tg_id: user?.id })
          });
          const json = await res.json();
           
          if (json.status === 'success') {
              window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
              window.Telegram?.WebApp?.showAlert('Товар добавлен в корзину! 🎁'); // Добавил подарок
          } else {
              window.Telegram?.WebApp?.showAlert('Ошибка: Не удалось найти товар');
          }
      } catch (e) {
          window.Telegram?.WebApp?.showAlert('Ошибка сети');
      } finally {
          window.Telegram?.WebApp?.MainButton.hideProgress();
      }
  };

  const openVpn = () => {
      window.Telegram?.WebApp?.openTelegramLink(VPN_LINK);
  };

  const openShein = () => {
      if (window.Telegram?.WebApp?.openLink) {
          window.Telegram.WebApp.openLink(SHEIN_LINK, { try_instant_view: false });
      } else {
          window.open(SHEIN_LINK, '_blank');
      }
  };

  // --- RENDER ---
  return (
    <div className="flex flex-col min-h-screen bg-transparent animate-fade-in pb-28 overflow-y-auto relative">
       
        {/* --- НОВОГОДНИЙ ФОН И ЭФФЕКТЫ --- */}
        {/* Красный градиент сверху для праздничной атмосферы */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-red-600/30 to-transparent pointer-events-none z-0" />
        <SnowEffect />

        {/* HEADER */}
        <div className="pt-8 px-6 pb-6 flex items-center justify-between relative z-10">
            <div>
                {/* Праздничное приветствие */}
                <h1 className="text-white text-2xl font-bold flex items-center gap-2">
                    С Новым Годом! 🎄
                </h1>
                <p className="text-white/60 text-xs mt-1">
                    {user?.first_name || 'Друг'}, время подарков! 🎁
                </p>
            </div>
            
            <div 
                onClick={() => setActiveTab('profile')} 
                className="relative w-10 h-10 cursor-pointer"
            >
                {/* Аватарка */}
                <div 
                    className="w-full h-full rounded-full bg-white/10 border border-white/20 bg-cover bg-center overflow-hidden" 
                    style={{backgroundImage: user?.photo_url ? `url('${user.photo_url}')` : 'none'}}
                >
                     {!user?.photo_url && <span className="material-symbols-outlined text-white/50 w-full h-full flex items-center justify-center">person</span>}
                </div>
                {/* Шапочка Санты на аватарке */}
                <div className="absolute -top-3 -right-2 text-2xl filter drop-shadow-lg transform -rotate-12">
                    🎅
                </div>
            </div>
        </div>

        <div className="px-6 space-y-8 relative z-10">
            
            {/* 1. ПОИСК */}
            <LinkSearch onSearch={handleSearch} />

            {/* 2. КАРТА ЛОЯЛЬНОСТИ */}
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 ml-1 opacity-60">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">Мой уровень</h3>
                    <span className="text-xs text-yellow-300">❄️ Хорошего настроения</span>
                </div>
                <LoyaltyCard 
                    points={parseInt(dbUser?.points) || 0} 
                    totalSpent={parseInt(dbUser?.total_spent) || 0}
                    onOpenDetails={() => setIsLoyaltyModalOpen(true)}
                />
            </div>

            {/* 3. АКТИВНЫЕ ЗАКАЗЫ */}
            <ActiveOrders 
                orders={activeOrders} 
                onGoToOrders={() => setActiveTab('profile')} 
            />

            {/* 4. БЛОК ССЫЛОК */}
            <div className="space-y-3">
                
                {/* Отзывы */}
                <ReviewsBanner />

                {/* Видео */}
                <div 
                    onClick={() => setIsTutorialOpen(true)} 
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors active:scale-[0.98] backdrop-blur-sm"
                >
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 relative shrink-0">
                        <span className="material-symbols-outlined">play_arrow</span>
                        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping opacity-75"></div>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-white font-bold text-sm">Как заказать?</h4>
                        <p className="text-white/40 text-xs">Видео-инструкция (45 сек)</p>
                    </div>
                    <span className="material-symbols-outlined text-white/20">chevron_right</span>
                </div>

                {/* --- КНОПКА: SHEIN APP --- */}
                <div 
                    onClick={openShein} 
                    className="bg-black/60 border border-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-black/80 transition-colors active:scale-[0.98] backdrop-blur-sm relative overflow-hidden"
                >
                    {/* Легкий золотистый блик для кнопки */}
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-yellow-500/20 blur-xl rounded-full"></div>

                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-extrabold text-lg shrink-0 z-10">
                        S
                    </div>
                    <div className="flex-1 z-10">
                        <h4 className="text-white font-bold text-sm">Выбрать подарки в SHEIN</h4>
                        <p className="text-white/40 text-xs">Перейти в приложение</p>
                    </div>
                    <span className="material-symbols-outlined text-white/20 z-10">open_in_new</span>
                </div>

                {/* VPN */}
                <div 
                    onClick={openVpn} 
                    className="bg-[#1e2a4a]/60 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-[#1e2a4a]/80 transition-colors active:scale-[0.98] backdrop-blur-sm"
                >
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                        <span className="material-symbols-outlined">vpn_lock</span>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-white font-bold text-sm">Не грузит SHEIN?</h4>
                        <p className="text-white/40 text-xs">Включи быстрый VPN</p>
                    </div>
                    <span className="material-symbols-outlined text-white/20">open_in_new</span>
                </div>
            </div>

        </div>

        {/* --- МОДАЛКИ --- */}
        {isLoyaltyModalOpen && (
            <LoyaltyModal 
                totalSpent={dbUser?.total_spent || 0} 
                onClose={() => setIsLoyaltyModalOpen(false)} 
            />
        )}

        {isTutorialOpen && (
            <FullScreenVideo 
                src={TUTORIAL_VIDEO_URL} 
                onClose={() => setIsTutorialOpen(false)} 
            />
        )}
    </div>
  );
}
