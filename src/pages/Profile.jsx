import React, { useState, useEffect } from 'react';
import ProfileHeader from '../components/profile/ProfileHeader';
import OrdersTab from '../components/profile/OrdersTab';
import AddressesTab from '../components/profile/AddressesTab';
import ReferralTab from '../components/profile/ReferralTab';
import OrderDetailsModal from '../components/profile/OrderDetailsModal';
import AddressModal from '../components/profile/AddressModal';

export default function Profile({ user, dbUser }) {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'addresses' | 'referral'
  
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Modals State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // --- LOAD DATA ---
  useEffect(() => {
    if (user?.id) {
        loadOrders();
        loadAddresses();
    }
  }, [user]);

  const loadOrders = async () => {
      try {
          const res = await fetch(`https://proshein.com/webhook/get-orders?tg_id=${user.id}`);
          const json = await res.json();
          setOrders(json.orders || json.items || []);
      } catch (e) { console.error(e); }
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

  // --- HANDLERS ---
  const handleSaveAddress = async (addressData) => {
      if (!addressData.full_name || !addressData.phone || !addressData.street) {
          window.Telegram?.WebApp?.showAlert("Заполните все поля");
          return;
      }

      window.Telegram?.WebApp?.MainButton.showProgress();
      try {
          const res = await fetch('https://proshein.com/webhook/save-address', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  tg_id: user.id,
                  address: { ...addressData, email: dbUser?.email || '' }
              })
          });
          const json = await res.json();
          if (json.status === 'success') {
              window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
              setIsAddressModalOpen(false);
              setEditingAddress(null);
              loadAddresses(); 
          }
      } catch (e) {
          window.Telegram?.WebApp?.showAlert("Ошибка сохранения");
      } finally {
          window.Telegram?.WebApp?.MainButton.hideProgress();
      }
  };

  const handleDeleteAddress = async (id, e) => {
      e.stopPropagation();
      if(!window.confirm("Удалить адрес?")) return;
      try {
          await fetch('https://proshein.com/webhook/delete-address', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, tg_id: user.id })
          });
          setAddresses(prev => prev.filter(a => a.id !== id));
      } catch (e) { console.error(e); }
  };

  const openNewAddress = () => {
      setEditingAddress(null);
      setIsAddressModalOpen(true);
  };

  const openEditAddress = (addr) => {
      setEditingAddress(addr);
      setIsAddressModalOpen(true);
  };

  // --- RENDER ---
  return (
    <div className="flex flex-col h-screen pb-24 animate-fade-in overflow-y-auto">
        
        {/* 1. HEADER */}
        <ProfileHeader user={user} dbUser={dbUser} />

        {/* 2. TABS */}
        <div className="px-6 mb-6 shrink-0">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                <button onClick={() => setActiveTab('orders')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'orders' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'}`}>Заказы</button>
                <button onClick={() => setActiveTab('addresses')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'addresses' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'}`}>Адреса</button>
                <button onClick={() => setActiveTab('referral')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'referral' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'}`}>Друзья</button>
            </div>
        </div>

        {/* 3. CONTENT */}
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

        {/* 4. MODALS */}
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
