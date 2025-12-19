import React, { useState, useEffect } from 'react';

// Импортируй свои компоненты, если они вынесены
// import MyAddresses from '../components/profile/MyAddresses'; 
// import OrderHistory from '../components/profile/OrderHistory';

export default function Profile({ user, dbUser }) {
  const [activeTab, setActiveTab] = useState('main'); // 'main', 'addresses', 'orders', 'support'

  // --- ЛОГИКА АВТО-ПЕРЕХОДА ИЗ КОРЗИНЫ ---
  useEffect(() => {
    const redirectTab = sessionStorage.getItem('open_profile_tab');
    if (redirectTab === 'addresses') {
        setActiveTab('addresses');
        sessionStorage.removeItem('open_profile_tab'); // Очищаем, чтобы не прыгало постоянно
    }
  }, []);

  // --- РЕНДЕР КОНТЕНТА В ЗАВИСИМОСТИ ОТ ТАБА ---
  const renderContent = () => {
      switch (activeTab) {
          case 'addresses':
              return (
                  <div className="animate-fade-in">
                      {/* Кнопка Назад */}
                      <button onClick={() => setActiveTab('main')} className="mb-4 flex items-center gap-1 text-white/50 text-sm">
                          <span className="material-symbols-outlined text-lg">arrow_back</span> Назад в профиль
                      </button>
                      <h2 className="text-white font-bold text-xl mb-4">Мои Адреса</h2>
                      
                      {/* ТУТ ТВОЙ КОМПОНЕНТ УПРАВЛЕНИЯ АДРЕСАМИ */}
                      {/* <MyAddresses user={user} /> */}
                      <div className="p-4 bg-white/5 rounded-xl text-center text-white/50">
                          Тут будет список адресов и кнопка добавления
                      </div>
                  </div>
              );
          
          case 'orders':
              return (
                  <div className="animate-fade-in">
                      <button onClick={() => setActiveTab('main')} className="mb-4 flex items-center gap-1 text-white/50 text-sm">
                          <span className="material-symbols-outlined text-lg">arrow_back</span> Назад
                      </button>
                      <h2 className="text-white font-bold text-xl mb-4">Мои Заказы</h2>
                      {/* <OrderHistory user={user} /> */}
                  </div>
              );

          case 'main':
          default:
              return (
                <div className="space-y-6 animate-fade-in">
                    {/* Аватар и Инфо */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl border border-primary/30">
                            {user?.first_name?.[0] || 'U'}
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg">{user?.first_name} {user?.last_name}</h2>
                            <p className="text-primary font-mono text-sm">{dbUser?.points || 0} WIBE</p>
                        </div>
                    </div>

                    {/* Меню */}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setActiveTab('orders')} className="bg-[#1c2636] p-4 rounded-2xl border border-white/5 flex flex-col gap-2 hover:border-white/20 transition-all">
                            <span className="material-symbols-outlined text-white text-2xl">receipt_long</span>
                            <span className="text-white font-bold text-sm">Мои заказы</span>
                        </button>
                        <button onClick={() => setActiveTab('addresses')} className="bg-[#1c2636] p-4 rounded-2xl border border-white/5 flex flex-col gap-2 hover:border-white/20 transition-all">
                            <span className="material-symbols-outlined text-white text-2xl">location_on</span>
                            <span className="text-white font-bold text-sm">Мои адреса</span>
                        </button>
                    </div>

                    {/* Доп. инфо */}
                    <div className="space-y-2">
                        <div className="bg-[#1c2636] p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                            <span className="text-white/70 text-sm">Техподдержка</span>
                            <span className="material-symbols-outlined text-white/30">chevron_right</span>
                        </div>
                        <div className="bg-[#1c2636] p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                             <span className="text-white/70 text-sm">Оферта</span>
                             <span className="material-symbols-outlined text-white/30">chevron_right</span>
                        </div>
                    </div>
                </div>
              );
      }
  };

  return (
    <div className="p-6 pb-32 min-h-screen">
        {renderContent()}
    </div>
  );
}
