import React, { useState, useEffect, useMemo } from 'react';
import ProfileHeader from '../components/profile/ProfileHeader';
import OrdersTab from '../components/profile/OrdersTab';
import AddressesTab from '../components/profile/AddressesTab';
import ReferralTab from '../components/profile/ReferralTab';
import OrderDetailsModal from '../components/profile/OrderDetailsModal';
import AddressModal from '../components/profile/AddressModal';

const OFFER_LINK = window.location.origin + '/offer.pdf';

// --- КОМПОНЕНТ СНЕГА (Тот же, что и на Главной) ---
const SnowEffect = () => {
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

export default function Profile({ user, dbUser }) {
  const [activeTab, setActiveTab] = useState('orders'); 
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    const redirectTab = sessionStorage.getItem('open_profile_tab');
    if (redirectTab === 'addresses') {
        setActiveTab('addresses');
        sessionStorage.removeItem('open_profile_tab'); 
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
        loadOrders();
        loadAddresses();
    }
  }, [user]);

  // --- ФУНКЦИИ ЗАГРУЗКИ ---
  const loadOrders = async () => {
      try {
          const res = await fetch(`https://proshein.com/webhook/get-orders?tg_id=${user.id}`);
          const json = await res.json();
          
          let data = [];
          if (Array.isArray(json)) {
             data = json;
          } else if (json.orders) {
             data = json.orders;
          } else if (json.items) {
             data = json.items; 
          }
          
          setOrders(data || []);
      } catch (e) { 
          console.error("Ошибка загрузки заказов:", e); 
      }
  };

  const loadAddresses = async () => {
      setLoadingData(true);
      try {
          const res = await fetch(`https://proshein.com/webhook/get-addresses?tg_id=${user.id}`);
          const json = await res.json();
          setAddresses(json.addresses || []);
      } catch (e) { console.error(e); }
      finally { setLoadingData(false); }
  };

  const handleSaveAddress = async (addressData) => {
      window.Telegram?.WebApp?.MainButton.showProgress();
      try {
          const res = await fetch('https://proshein.com/webhook/save-address', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tg_id: user.id, address: addressData })
          });
          const json = await res.json();
          if (json.status === 'success') {
              window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
              setIsAddressModalOpen(false);
              setEditingAddress(null);
              loadAddresses(); 
          } else {
              window.Telegram?.WebApp?.showAlert("Ошибка: " + json.message);
          }
      } catch (e) {
          window.Telegram?.WebApp?.showAlert("Ошибка сохранения");
      } finally {
          window.Telegram?.WebApp?.MainButton.hideProgress();
      }
  };

  const handleDeleteAddress = async (addressId, e) => {
      e.stopPropagation();
      if(!window.confirm("Вы точно хотите удалить этот адрес?")) return;
      const newAddresses = addresses.filter(a => a.id !== addressId);
      setAddresses(newAddresses);
      try {
          await fetch('https://proshein.com/webhook/delete-address', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: addressId, tg_id: user.id })
          });
      } catch (e) { loadAddresses(); }
  };

  const openNewAddress = () => { setEditingAddress(null); setIsAddressModalOpen(true); };
  const openEditAddress = (addr) => { setEditingAddress(addr); setIsAddressModalOpen(true); };

  const openOffer = () => {
    if (window.Telegram?.WebApp?.openLink) {
        window.Telegram.WebApp.openLink(OFFER_LINK, { try_instant_view: false });
    } else {
        window.open(OFFER_LINK, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-screen pb-24 animate-fade-in overflow-y-auto relative">
        {/* --- НОВОГОДНИЙ ФОН --- */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-red-600/30 to-transparent pointer-events-none z-0" />
        <SnowEffect />

        {/* --- КОНТЕНТ (z-10 чтобы быть над снегом) --- */}
        <div className="relative z-10 flex flex-col flex-1">
            <ProfileHeader user={user} dbUser={dbUser} />

            <div className="px-6 mb-6 shrink-0">
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
                    <button onClick={() => setActiveTab('orders')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'orders' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}>Заказы</button>
                    <button onClick={() => setActiveTab('addresses')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'addresses' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}>Адреса</button>
                    <button onClick={() => setActiveTab('referral')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'referral' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}>Друзья</button>
                </div>
            </div>

            <div className="flex-1">
                {activeTab === 'orders' && (
                    <OrdersTab orders={orders} onSelectOrder={setSelectedOrder} />
                )}

                {activeTab === 'addresses' && (
                    <AddressesTab 
                        addresses={addresses} 
                        loading={loadingData} 
                        onAdd={openNewAddress} 
                        onEdit={openEditAddress} 
                        onDelete={handleDeleteAddress} 
                    />
                )}

                {activeTab === 'referral' && (
                    <ReferralTab userId={user?.id} />
                )}
            </div>

            <div className="p-6 mt-4 flex flex-col items-center justify-center opacity-50 hover:opacity-100 transition-opacity relative z-10">
                <button onClick={openOffer} className="flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] uppercase font-bold tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all">
                    <span className="material-symbols-outlined text-lg">description</span>
                    Договор оферты
                </button>
                <div className="text-[9px] text-white/20 mt-2">SHEINWIBE © 2025</div>
            </div>
        </div>

        {/* Модалки работают поверх всего благодаря своим порталам или фиксированному позиционированию */}
        <OrderDetailsModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
        />
        
        <AddressModal 
            isOpen={isAddressModalOpen} 
            onClose={() => setIsAddressModalOpen(false)} 
            editingAddress={editingAddress} 
            user={user} 
            onSave={handleSaveAddress} 
        />
    </div>
  );
}
