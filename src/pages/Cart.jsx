import React, { useState, useEffect, useMemo } from 'react';
import CartItem from '../components/cart/CartItem';
import PaymentBlock from '../components/cart/PaymentBlock';
import FullScreenVideo from '../components/ui/FullScreenVideo';
import EditItemModal from '../components/cart/EditItemModal';
import CheckoutModal from '../components/cart/CheckoutModal';
import CouponModal from '../components/cart/CouponModal';

// --- КОМПОНЕНТ СНЕГА (Оставляем для красоты) ---
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

export default function Cart({ user, dbUser, setActiveTab, onRefreshData }) {
  // --- STATE: DATA ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
   
  // ID выбранных товаров
  const [selectedIds, setSelectedIds] = useState([]); 
    
  // --- STATE: ADDRESS & DELIVERY ---
  const [addresses, setAddresses] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState('ПВЗ (5Post)');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPvz, setSelectedPvz] = useState(null);

  // --- STATE: DISCOUNTS ---
  const [pointsInput, setPointsInput] = useState('');
  const [activeCoupon, setActiveCoupon] = useState(null); 
  const [couponDiscount, setCouponDiscount] = useState(0);

  // --- STATE: UI ---
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [savingItem, setSavingItem] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  // CONSTANTS
  const VIDEO_URL = "https://storage.yandexcloud.net/videosheinwibe/vkclips_20251219083418.mp4"; 
  
  // НАСТРОЙКИ
  const MIN_ORDER_AMOUNT = 3000;       
  const MAX_TOTAL_DISCOUNT_PERCENT = 0.50; 
  
  const userPointsBalance = dbUser?.points || 0;

  // --- LOAD DATA ---
  useEffect(() => {
    if (user?.id) { 
        loadCart(); 
        loadAddresses(); 
    } else {
        const t = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(t);
    }
  }, [user]);

  // Авто-выбор товаров при загрузке (только тех, что в наличии)
  useEffect(() => {
      if (items.length > 0) {
          setSelectedIds(prev => {
              const availableIds = items
                  .filter(i => i.is_in_stock !== false)
                  .map(i => i.id);

              if (prev.length === 0) return availableIds;
              return prev.filter(id => availableIds.includes(id));
          });
      }
  }, [items]);

  // 🔥 1. ЗАГРУЗКА КОРЗИНЫ
  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://proshein.com/webhook/get-cart?user_id=${user?.id}`);
      
      if (!res.ok) throw new Error('Ошибка сети');
      
      const jsonResponse = await res.json();
      
      const responseData = (Array.isArray(jsonResponse) && jsonResponse.length > 0) 
                           ? jsonResponse[0] 
                           : jsonResponse;
                           
      const cartItems = responseData.items || [];

      const formattedItems = cartItems.map(i => ({ 
          ...i, 
          quantity: Number(i.quantity) || 1,
          final_price_rub: Number(i.final_price_rub) || 0,
          // СУПЕР-ВАЖНО: Приводим всё к единому флагу is_in_stock
          // Если есть is_available (от парсера) берем его, если нет - берем is_in_stock
          is_in_stock: (i.is_available !== undefined ? i.is_available : i.is_in_stock) !== false 
      }));

      setItems(formattedItems);

      // Запускаем тихую проверку цен и наличия
      if (formattedItems.length > 0) {
          checkStockBackground(formattedItems);
      }

    } catch (e) { 
        console.error("Ошибка загрузки корзины:", e); 
    } finally { 
        setLoading(false); 
    }
  };

  // 🔥 2. ФОНОВАЯ ПРОВЕРКА (ИСПРАВЛЕННАЯ)
  const checkStockBackground = async (currentItems) => {
      try {
          const itemsToCheck = currentItems.map(i => ({ 
              id: i.id,             
              product_url: i.product_url, 
              shein_id: i.shein_id 
          }));

          const res = await fetch('https://proshein.com/webhook/check-cart-stock', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: itemsToCheck })
          });

          const json = await res.json();

          // Если пришли обновления
          if (json.updated_items && json.updated_items.length > 0) {
              setItems(prevItems => prevItems.map(item => {
                  // Ищем, есть ли обновление для этого товара
                  const update = json.updated_items.find(u => u.shein_id === item.shein_id);
                  
                  if (update) {
                      return { 
                          ...item, 
                          // 1. Обновляем статус (берем is_available от бэка и кладем в is_in_stock)
                          is_in_stock: update.is_available, 
                          
                          // 2. Обновляем цену (если вдруг подешевело/подорожало)
                          final_price_rub: update.final_price_rub || item.final_price_rub
                      };
                  }
                  return item;
              }));
          }
      } catch (e) {
          console.error("Ошибка фоновой проверки наличия:", e);
      }
  };

  // 🔥 3. ЗАГРУЗКА АДРЕСОВ
  const loadAddresses = async () => {
      try {
          const res = await fetch(`https://proshein.com/webhook/get-addresses?user_id=${user?.id}`);
          if (!res.ok) throw new Error('Network error');
          
          const jsonResponse = await res.json();
          
          const responseData = (Array.isArray(jsonResponse) && jsonResponse.length > 0) 
                               ? jsonResponse[0] 
                               : jsonResponse;

          const addressesList = responseData.addresses || (Array.isArray(responseData) ? responseData : []);
          
          setAddresses(addressesList);
      } catch (e) { 
          console.error("Ошибка загрузки адресов:", e); 
      }
  };

  // --- ACTIONS ---

  const handleToggleSelect = (id) => {
      setSelectedIds(prev => {
          if (prev.includes(id)) {
              return prev.filter(i => i !== id); 
          } else {
              return [...prev, id]; 
          }
      });
  };

  const handleManageAddresses = () => {
      sessionStorage.setItem('open_profile_tab', 'addresses');
      setActiveTab('profile');
  };

  const handleUpdateQuantity = async (id, delta) => {
      const currentItem = items.find(i => i.id === id);
      if (!currentItem) return;

      const newQty = Math.max(1, currentItem.quantity + delta);
      if (newQty === currentItem.quantity) return;

      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));

      try {
          await fetch('https://proshein.com/webhook/update-cart-item', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  id, 
                  quantity: newQty, 
                  size: currentItem.size, 
                  color: currentItem.color,
                  tg_id: user?.id 
              })
          });
      } catch (e) {
          console.error("Ошибка сохранения количества:", e);
      }
  };

  const saveItemParams = async (id, newSize, newColor) => {
    setSavingItem(true);
    const currentItem = items.find(i => i.id === id);
    const quantity = currentItem ? currentItem.quantity : 1;
    const colorToSave = newColor || (currentItem ? currentItem.color : '');

    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, size: newSize, color: colorToSave } 
        : item
    ));

    try {
      const res = await fetch('https://proshein.com/webhook/update-cart-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: id,
          tg_id: user?.id,
          quantity: quantity,
          size: newSize,
          color: colorToSave
        })
      });
      if (!res.ok) throw new Error('Failed to update');
      window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
      setEditingItem(null); 
    } catch (e) {
      console.error('Ошибка сохранения параметров:', e);
      window.Telegram?.WebApp?.showAlert('Не удалось сохранить изменения');
    } finally {
      setSavingItem(false);
    }
  };
    
  const handleDeleteItem = async (e, id) => {
      if(!window.confirm('Удалить товар из корзины?')) return;
      
      setItems(prev => prev.filter(i => i.id !== id));
      setSelectedIds(prev => prev.filter(selId => selId !== id));

      try {
          await fetch('https://proshein.com/webhook/delete-item', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({ id, tg_id: user?.id }) 
          });
      } catch (e) { console.error(e); }
  };

  // --- CALCULATIONS ---
  
  const subtotal = useMemo(() => {
      return items
          .filter(i => selectedIds.includes(i.id))
          .reduce((sum, i) => sum + (i.final_price_rub * i.quantity), 0);
  }, [items, selectedIds]);

  const maxTotalDiscount = Math.floor(subtotal * MAX_TOTAL_DISCOUNT_PERCENT); 
  
  const availablePointsLimit = Math.max(0, Math.min(
      userPointsBalance,              
      maxTotalDiscount - couponDiscount 
  ));

  const handlePointsChange = (val) => {
      let num = parseInt(val) || 0;
      if (num < 0) num = 0;
      
      if (num > availablePointsLimit) {
          num = availablePointsLimit;
      }
      setPointsInput(num > 0 ? num.toString() : '');
  };

  // --- ЛОГИКА КУПОНОВ ---
  const applyCoupon = (coupon) => {
      if (!coupon) {
          setActiveCoupon(null);
          setCouponDiscount(0);
          return;
      }

      if (subtotal < (coupon.min_order_amount || 0)) {
          window.Telegram?.WebApp?.showAlert(`Мин. сумма заказа для этого купона: ${coupon.min_order_amount}₽`);
          return;
      }

      let discount = 0;
      if (coupon.type === 'percent') {
          discount = Math.floor(subtotal * (coupon.discount_amount / 100));
      } else {
          discount = Number(coupon.discount_amount);
      }

      if (discount > maxTotalDiscount) discount = maxTotalDiscount;

      setCouponDiscount(discount);
      setActiveCoupon(coupon); 
      
      if ((parseInt(pointsInput) || 0) > (maxTotalDiscount - discount)) {
          setPointsInput('');
      }

      setShowCouponModal(false);
      window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
  };

  const pointsUsed = Math.min(parseInt(pointsInput) || 0, availablePointsLimit); 
  const finalTotal = Math.max(0, subtotal - couponDiscount - pointsUsed);

  // --- РАСПРЕДЕЛЕНИЕ СКИДКИ ---
  const itemsForCheckout = useMemo(() => {
      const selectedItems = items.filter(item => selectedIds.includes(item.id));
      
      const totalDiscountValue = couponDiscount + pointsUsed;
      
      if (totalDiscountValue <= 0) {
          return selectedItems.map(item => ({
              ...item,
              price_at_purchase: item.final_price_rub
          }));
      }

      let distributedDiscount = 0;
      
      return selectedItems.map((item, index) => {
          const itemTotalOriginal = item.final_price_rub * item.quantity;
          let itemDiscount = Math.floor((itemTotalOriginal / subtotal) * totalDiscountValue);
          
          if (index === selectedItems.length - 1) {
              itemDiscount = totalDiscountValue - distributedDiscount;
          } else {
              distributedDiscount += itemDiscount;
          }

          const totalDiscountedPrice = itemTotalOriginal - itemDiscount;
          const unitPrice = Math.floor(totalDiscountedPrice / item.quantity);

          return {
              ...item,
              final_price_rub: unitPrice, 
              price_at_purchase: unitPrice 
          };
      });
  }, [items, selectedIds, subtotal, couponDiscount, pointsUsed]);


  const openCheckout = () => {
      if (selectedIds.length === 0) {
          window.Telegram?.WebApp?.showAlert('Выберите товары для оплаты!');
          return;
      }

      const selectedItems = items.filter(i => selectedIds.includes(i.id));
      // Проверка размера
      if (selectedItems.some(i => i.size === 'NOT_SELECTED' || !i.size)) {
          window.Telegram?.WebApp?.showAlert('Выберите размер для всех отмеченных товаров!');
          return;
      }
      
      // Проверка наличия (на всякий случай)
      if (selectedItems.some(i => !i.is_in_stock)) {
           window.Telegram?.WebApp?.showAlert('Некоторые товары закончились. Удалите их из выбора.');
           return;
      }

      if (subtotal < MIN_ORDER_AMOUNT) {
          window.Telegram?.WebApp?.showAlert(`Минимальная сумма заказа: ${MIN_ORDER_AMOUNT.toLocaleString()} ₽`);
          return;
      }

      setShowCheckout(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent animate-fade-in pb-32 relative">
      
      {/* --- ФОНОВЫЕ ЭФФЕКТЫ --- */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-red-600/30 to-transparent pointer-events-none z-0" />
      <SnowEffect />

      {/* HEADER */}
      <div className="p-6 pt-8 pb-4 relative z-10 flex items-center justify-between">
          <h1 className="text-white text-lg font-medium flex items-center gap-2">
            Мои подарки 🛒 
            <span className="text-white/50 text-sm font-normal">({items.length})</span>
          </h1>
      </div>

      <div className="relative z-10 flex flex-col flex-1">
          {loading ? (
              <div className="text-center text-white/50 mt-10">Загружаем список желаний... ❄️</div>
          ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-10 opacity-50">
                 <span className="material-symbols-outlined text-4xl mb-2 text-white/40">card_giftcard</span>
                 <p className="text-sm text-white/60">Пока что без подарков...</p>
                 <p className="text-xs text-white/40 mt-1">Самое время что-то выбрать!</p>
              </div>
          ) : (
              <div className="px-6 space-y-4">
                  <div className="space-y-3">
                      {items.map(item => (
                          <CartItem 
                            key={item.id} 
                            item={item}
                            // Важно: CartItem теперь получит актуальное состояние is_in_stock
                            isSelected={selectedIds.includes(item.id)}
                            onToggleSelect={handleToggleSelect}
                            onEdit={setEditingItem} 
                            onDelete={handleDeleteItem} 
                            onUpdateQuantity={handleUpdateQuantity} 
                          />
                      ))}
                  </div>
                  <div className="h-px bg-white/5 my-4"></div>
                  
                  {selectedIds.length > 0 ? (
                      <PaymentBlock 
                          subtotal={subtotal} 
                          total={finalTotal} 
                          discount={couponDiscount}
                          pointsInput={pointsInput} 
                          setPointsInput={handlePointsChange}
                          userPointsBalance={userPointsBalance} 
                          handleUseMaxPoints={() => handlePointsChange(availablePointsLimit)}
                          activeCouponCode={activeCoupon?.code}
                          onOpenCoupons={() => setShowCouponModal(true)}
                          onPay={openCheckout} 
                          onPlayVideo={() => setVideoOpen(true)} 
                      />
                  ) : (
                      <div className="text-center text-white/40 py-4 text-sm bg-white/5 rounded-xl backdrop-blur-sm border border-white/5">
                          Выберите товары, чтобы рассчитать стоимость подарка 🎁
                      </div>
                  )}
              </div>
          )}
      </div>

      {/* --- MODALS --- */}
      {editingItem && (
        <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} onSave={saveItemParams} saving={savingItem} />
      )}

      {showCouponModal && (
         <CouponModal 
           userId={user?.id}
           subtotal={subtotal}
           onClose={() => setShowCouponModal(false)}
           onApply={applyCoupon}
           activeCouponCode={activeCoupon?.code}
        />
      )}

      {showCheckout && (
        <CheckoutModal 
           onClose={(success) => { 
               setShowCheckout(false); 
               if(success) { 
                   setItems(prev => prev.filter(i => !selectedIds.includes(i.id)));
                   setSelectedIds([]); 
                   
                   if (onRefreshData) onRefreshData(); 
                   setActiveTab('home'); 
               } 
           }}
           user={user} dbUser={dbUser}
           total={finalTotal} 
           items={itemsForCheckout} 
           pointsUsed={pointsUsed} 
           couponDiscount={couponDiscount} activeCoupon={activeCoupon}
           addresses={addresses} deliveryMethod={deliveryMethod} setDeliveryMethod={setDeliveryMethod}
           selectedAddress={selectedAddress} setSelectedAddress={setSelectedAddress}
           selectedPvz={selectedPvz} setSelectedPvz={setSelectedPvz}
           onManageAddresses={handleManageAddresses} 
        />
      )}

      {videoOpen && <FullScreenVideo src={VIDEO_URL} onClose={() => setVideoOpen(false)} />}
    </div>
  );
}
