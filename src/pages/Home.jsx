import React, { useState, useEffect } from 'react';

export default function Profile({ user, dbUser }) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrdersExpanded, setIsOrdersExpanded] = useState(false);

  // --- State для Адресов ---
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  
  const [addressForm, setAddressForm] = useState({
      id: null,
      full_name: '',
      phone: '',
      email: '',
      region: '',
      street: '',
      is_default: false
  });

  // 1. ЗАГРУЗКА ДАННЫХ
  useEffect(() => {
      if(user && user.id) {
          loadOrders();
      } else {
          setLoadingOrders(false);
      }
  }, [user]);

  const loadOrders = async () => {
      setLoadingOrders(true);
      try {
          const tgId = user?.id;
          if (!tgId) return;

          const res = await fetch(`https://proshein.com/webhook/get-orders?tg_id=${tgId}`);
          const text = await res.text();
          
          if (!text) { setOrders([]); return; }
          const json = JSON.parse(text);
          
          let list = [];
          if (Array.isArray(json)) list = json;
          else if (json.items) list = json.items;
          else if (json.orders) list = json.orders;
          
          setOrders(list);
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingOrders(false);
      }
  };

  const loadAddresses = async () => {
      setLoadingAddresses(true);
      try {
          const tgId = user?.id;
          if (!tgId) return;

          const res = await fetch(`https://proshein.com/webhook/get-addresses?tg_id=${tgId}`);
          const text = await res.text();
          
          if (text) {
              const json = JSON.parse(text);
              const list = json.addresses || (Array.isArray(json) ? json : []);
              setAddresses(list);
          } else {
              setAddresses([]);
          }
      } catch (e) {
          console.error("Ошибка загрузки адресов:", e);
      } finally {
          setLoadingAddresses(false);
      }
  };

  // 2. РЕФЕРАЛЬНАЯ СИСТЕМА
  const copyRefLink = () => {
      if(user && user.id) {
          navigator.clipboard.writeText(`https://t.me/sheinwibe_bot?start=ref_${user.id}`);
          window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
          window.Telegram?.WebApp?.showAlert('Ссылка скопирована');
      }
  };

  const handleWithdraw = async () => {
      if (!user || !user.id) return;

      if (!dbUser || dbUser.referral_balance <= 0) {
          window.Telegram?.WebApp?.showAlert('Недостаточно средств для вывода');
          return;
      }
      
      if(!window.confirm(`Перевести ${dbUser.referral_balance}₽ на бонусный счет?`)) return;

      try {
          window.Telegram?.WebApp?.MainButton.showProgress();
          const res = await fetch('https://proshein.com/webhook/withdraw-referrals', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tg_id: user.id })
          });
          const json = await res.json();
          
          if(json.status === 'success') {
              window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
              window.Telegram?.WebApp?.showAlert('Средства зачислены на баланс!');
          } else {
              throw new Error(json.message);
          }
      } catch (e) {
          window.Telegram?.WebApp?.showAlert('Ошибка вывода');
      } finally {
          window.Telegram?.WebApp?.MainButton.hideProgress();
      }
  };

  // 3. УПРАВЛЕНИЕ АДРЕСАМИ
  const openAddressModal = () => {
      loadAddresses();
      setIsAddressModalOpen(true);
      setIsEditingAddress(false);
  };

  const startEditAddress = (addr) => {
      if (addr) {
          setAddressForm(addr);
      } else {
          setAddressForm({
              id: null,
              full_name: user?.first_name || '',
              phone: '',
              email: '',
              region: '',
              street: '',
              is_default: addresses.length === 0
          });
      }
      setIsEditingAddress(true);
  };

  const saveAddress = async () => {
      if(!addressForm.full_name || !addressForm.phone || !addressForm.street) {
           window.Telegram?.WebApp?.showAlert('Заполните обязательные поля');
           return;
      }
      
      window.Telegram?.WebApp?.MainButton.showProgress();

      try {
          const tgId = user?.id;
          if (!tgId) throw new Error("User ID not found");

          const res = await fetch('https://proshein.com/webhook/save-address', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  tg_id: tgId,
                  address: addressForm
              })
          });
          
          const json = await res.json();
          if (json.status === 'success') {
              await loadAddresses(); 
              setIsEditingAddress(false);
              window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
          } else {
              throw new Error(json.message);
          }
      } catch (e) {
          console.error(e);
          window.Telegram?.WebApp?.showAlert('Ошибка сохранения');
      } finally {
          window.Telegram?.WebApp?.MainButton.hideProgress();
      }
  };

  const deleteAddress = async (id) => {
      if(!window.confirm('Удалить адрес?')) return;
      
      setAddresses(prev => prev.filter(a => a.id !== id));

      try {
         await fetch('https://proshein.com/webhook/delete-address', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: id })
         });
         window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
      } catch(e) {
         console.error(e);
         loadAddresses();
      }
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
  };

  // 4. ДЕТАЛИ ЗАКАЗА
  const openOrderDetails = (orderId) => {
      const order = orders.find(o => o.id === orderId);
      if(order) setSelectedOrder(order);
  };

  const renderTimeline = (status, date) => {
      const steps = [
        { id: 'paid', label: 'Оплачен', icon: 'credit_score' },
        { id: 'purchased', label: 'Выкуплен (Shein)', icon: 'shopping_bag' },
        { id: 'warehouse_cn', label: 'Склад Китай', icon: 'warehouse' },
        { id: 'shipping', label: 'В пути в РФ', icon: 'flight_takeoff' },
        { id: 'arrived_ru', label: 'Прибыл в РФ', icon: 'flag' },
        { id: 'delivery', label: 'В доставке', icon: 'local_shipping' }
      ];
      
      let activeIndex = steps.findIndex(s => s.id === status);
      if (activeIndex === -1) activeIndex = 0; 

      return steps.map((step, index) => {
          const isCompleted = index <= activeIndex;
          const isCurrent = index === activeIndex;
          
          let colorClass = isCompleted ? 'bg-primary text-black border-primary' : 'bg-[#101622] text-white/20 border-white/10';
          let textClass = isCompleted ? 'text-white' : 'text-white/30';
          let subText = '';

          if (index === 0) subText = new Date(date).toLocaleDateString('ru-RU');
          if (isCurrent && index > 0) subText = 'Текущий статус';

          return (
              <div key={step.id} className="relative flex items-center gap-4 z-10">
                   <div className={`w-6 h-6 rounded-full ${colorClass} flex items-center justify-center shrink-0 border-2 transition-all ${isCurrent ? 'shadow-[0_0_15px_rgba(19,236,91,0.5)] scale-110' : ''}`}>
                       <span className="material-symbols-outlined text-[14px]">{step.icon}</span>
                   </div>
                   <div>
                       <p className={`text-sm font-medium ${textClass}`}>{step.label}</p>
                       {subText && <p className="text-[10px] text-primary/80 font-medium">{subText}</p>}
                   </div>
              </div>
          );
      });
  };

  const visibleOrders = isOrdersExpanded ? orders : orders.slice(0, 3);

  return (
    <div className="flex flex-col h-full animate-fade-in pb-24">
        {/* Header */}
        <div className="relative z-10 flex items-center justify-center p-6 pt-8 pb-4">
            <h2 className="text-white text-lg font-bold leading-tight text-center">Профиль</h2>
        </div>

        {/* Profile Card */}
        <div className="flex flex-col items-center pt-2 relative z-10">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-600 rounded-full opacity-75 blur"></div>
                {/* РЕАЛЬНОЕ ФОТО */}
                <div className="relative bg-center bg-no-repeat bg-cover rounded-full h-24 w-24 ring-4 ring-[#102216] flex items-center justify-center bg-[#102216]" 
                     style={{backgroundImage: user?.photo_url ? `url('${user.photo_url}')` : 'none'}}>
                     {!user?.photo_url && (
                        <span className="material-symbols-outlined text-white/30 text-4xl">person</span>
                     )}
                </div>
            </div>
            <h2 className="text-white text-xl font-bold mt-4">{user?.first_name || '...'}</h2>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/5 mt-2">
                <span className="material-symbols-outlined text-[#cd7f32] text-[16px]">star</span>
                <p className="text-[#cd7f32] text-xs font-bold uppercase tracking-wider">{dbUser?.status || 'Bronze'}</p>
            </div>
        </div>

        <div className="px-6 pt-8 space-y-4 relative z-10">
            {/* Referral System */}
            <div className="bg-card-gradient border border-white/10 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-bold">Мои рефералы</span>
                    <span className="text-primary text-xs bg-primary/10 px-2 py-0.5 rounded">Доход: {dbUser?.referral_balance || 0} ₽</span>
                </div>
                <div className="flex gap-2">
                    <input className="custom-input flex-1 h-10 rounded-lg text-xs px-3" value={user?.id ? `https://t.me/sheinwibe_bot?start=ref_${user.id}` : '...'} readOnly
