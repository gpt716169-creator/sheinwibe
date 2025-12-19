import React, { useState, useEffect } from 'react';
import LinkSearch from '../components/home/LinkSearch';
import ActiveOrders from '../components/home/ActiveOrders';
import LoyaltyCard from '../components/home/LoyaltyCard';

export default function Home({ user, dbUser, setActiveTab }) {
  const [activeOrders, setActiveOrders] = useState([]);
  
  useEffect(() => {
    if (user?.id) {
        loadData();
    }
  }, [user]);

  const loadData = async () => {
      // Загружаем заказы для виджета
      try {
          const res = await fetch(`https://proshein.com/webhook/get-orders?tg_id=${user?.id}`);
          const json = await res.json();
          setActiveOrders(json.orders || json.items || []);
      } catch (e) { console.error("Err loading orders", e); }
  };

  const handleSearch = async (link) => {
      window.Telegram?.WebApp?.MainButton.showProgress();
      try {
          const res = await fetch('https://proshein.com/webhook/parse-item', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ link, tg_id: user?.id })
          });
          const json = await res.json();
          
          if (json.status === 'success') {
              window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
              window.Telegram?.WebApp?.showAlert('Товар добавлен в корзину!');
          } else {
              window.Telegram?.WebApp?.showAlert('Ошибка: Не удалось найти товар');
          }
      } catch (e) {
          window.Telegram?.WebApp?.showAlert('Ошибка сети');
      } finally {
          window.Telegram?.WebApp?.MainButton.hideProgress();
      }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent animate-fade-in pb-28 overflow-y-auto">
        
        {/* HEADER */}
        <div className="pt-8 px-6 pb-6 flex items-center justify-between">
            <div>
                <h1 className="text-white text-2xl font-bold">Привет, {user?.first_name || 'Друг'}! 👋</h1>
                <p className="text-white/40 text-xs mt-1">Найдем твой стиль сегодня?</p>
            </div>
            {/* Аватарка (можно сделать переход в профиль) */}
            <div onClick={() => setActiveTab('profile')} className="w-10 h-10 rounded-full bg-white/10 border border-white/10 bg-cover bg-center cursor-pointer" style={{backgroundImage: user?.photo_url ? `url('${user.photo_url}')` : 'none'}}>
                 {!user?.photo_url && <span className="material-symbols-outlined text-white/50 w-full h-full flex items-center justify-center">person</span>}
            </div>
        </div>

        <div className="px-6 space-y-8">
            
            {/* 1. ПОИСК (Самое важное) */}
            <LinkSearch onSearch={handleSearch} />

           {/* 2. КАРТА ЛОЯЛЬНОСТИ */}
            <div className="animate-fade-in delay-100">
                <LoyaltyCard 
                    points={dbUser?.points || 0} 
                    totalSpent={dbUser?.total_spent || 0}  // Передаем сумму покупок
                />
            </div>

            {/* 3. АКТИВНЫЕ ЗАКАЗЫ (Показываем только если есть) */}
            <ActiveOrders 
                orders={activeOrders} 
                onGoToOrders={() => setActiveTab('profile')} 
            />

            {/* Дополнительный блок (например, FAQ или Инструкция) */}
            <div onClick={() => window.Telegram?.WebApp?.openLink('https://t.me/sheinwibe_help')} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">help</span>
                </div>
                <div className="flex-1">
                    <h4 className="text-white font-bold text-sm">Как это работает?</h4>
                    <p className="text-white/40 text-xs">Инструкция по заказу и доставке</p>
                </div>
                <span className="material-symbols-outlined text-white/20">chevron_right</span>
            </div>

        </div>
    </div>
  );
}
