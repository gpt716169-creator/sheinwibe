import React, { useState, useEffect, useMemo } from 'react';
import CartItem from '../components/cart/CartItem';
import PaymentBlock from '../components/cart/PaymentBlock';
import FullScreenVideo from '../components/ui/FullScreenVideo';
import EditItemModal from '../components/cart/EditItemModal';
import CheckoutModal from '../components/cart/CheckoutModal';
import CouponModal from '../components/cart/CouponModal';

export default function Cart({ user, dbUser, setActiveTab, onRefreshData }) {
  // --- STATE ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]); 
  const [addresses, setAddresses] = useState([]);
  
  // --- DISCOUNTS & UI ---
  const [deliveryMethod, setDeliveryMethod] = useState('ПВЗ (5Post)');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPvz, setSelectedPvz] = useState(null);
  const [pointsInput, setPointsInput] = useState('');
  const [activeCoupon, setActiveCoupon] = useState(null); 
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [savingItem, setSavingItem] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const VIDEO_URL = "https://storage.yandexcloud.net/videosheinwibe/vkclips_20251219083418.mp4"; 
  const MIN_ORDER_AMOUNT = 3000;
  const MAX_TOTAL_DISCOUNT_PERCENT = 0.50;
  const userPointsBalance = dbUser?.points || 0;

  // --- INITIAL LOAD ---
  useEffect(() => {
    if (user?.id) { 
        loadCart(); 
        loadAddresses(); 
    }
  }, [user]);

  // Авто-выбор доступных товаров при загрузке
  useEffect(() => {
      if (items.length > 0 && selectedIds.length === 0) {
          const availableIds = items.filter(i => i.is_in_stock !== false).map(i => i.id);
          setSelectedIds(availableIds);
      }
  }, [items]);

  // --- API CALLS (WEBHOOKS) ---

  const loadCart = async () => {
    setLoading(true);
    try {
      // ✅ ПРОСТОЙ ЗАПРОС К ВЕБХУКУ
      const res = await fetch(`https://proshein.com/webhook/get-cart?user_id=${user?.id}`);
      if (!res.ok) throw new Error('Network error');
      
      const data = await res.json();
      
      // Форматируем данные, чтобы они точно подошли фронтенду
      const formattedItems = (data || []).map(i => ({ 
          ...i, 
          // Гарантируем, что числа это числа
          quantity: Number(i.quantity) || 1,
          final_price_rub: Number(i.final_price_rub) || 0,
          is_in_stock: i.is_in_stock !== false 
      }));

      setItems(formattedItems);
    } catch (e) { 
        console.error("Cart load error:", e); 
    } finally { 
        setLoading(false); 
    }
  };

  const loadAddresses = async () => {
      try {
          // ✅ ПРОСТОЙ ЗАПРОС К ВЕБХУКУ АДРЕСОВ
          const res = await fetch(`https://proshein.com/webhook/get-addresses?user_id=${user?.id}`);
          if (res.ok) {
              const data = await res.json();
              setAddresses(data || []);
          }
      } catch (e) { 
          console.error("Address load error:", e); 
      }
  };

  // --- ACTIONS ---

  const handleToggleSelect = (id) => {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleUpdateQuantity = async (id, delta) => {
      const currentItem = items.find(i => i.id === id);
      if (!currentItem) return;
      const newQty = Math.max(1, currentItem.quantity + delta);
      if (newQty === currentItem.quantity) return;

      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));

      // Обновляем через вебхук
      try {
          await fetch('https://proshein.com/webhook/update-cart-item', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  id, quantity: newQty, size: currentItem.size, color: currentItem.color, tg_id: user?.id 
              })
          });
      } catch (e) { console.error(e); }
  };

  const saveItemParams = async (id, newSize, newColor) => {
    setSavingItem(true);
    const item = items.find(i => i.id === id);
    if (!item) return;

    setItems(prev => prev.map(i => i.id === id ? { ...i, size: newSize, color: newColor || i.color } : i));

    try {
      await fetch('https://proshein.com/webhook/update-cart-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, tg_id: user?.id, quantity: item.quantity, size: newSize, color: newColor || item.color
        })
      });
      setEditingItem(null); 
    } catch (e) {
      console.error(e);
      window.Telegram?.WebApp?.showAlert('Ошибка сохранения');
    } finally {
      setSavingItem(false);
    }
  };
    
  const handleDeleteItem = async (e, id) => {
      if(!window.confirm('Удалить?')) return;
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
  const availablePointsLimit = Math.max(0, Math.min(userPointsBalance, maxTotalDiscount - couponDiscount));

  const handlePointsChange = (val) => {
      let num = parseInt(val) || 0;
      if (num < 0) num = 0;
      if (num > availablePointsLimit) num = availablePointsLimit;
      setPointsInput(num > 0 ? num.toString() : '');
  };

  const applyCoupon = (coupon) => {
      if (!coupon) { setActiveCoupon(null); setCouponDiscount(0); return; }
      if (subtotal < (coupon.min_order_amount || 0)) {
          window.Telegram?.WebApp?.showAlert(`Мин. сумма: ${coupon.min_order_amount}₽`); return;
      }
      let discount = coupon.type === 'percent' 
          ? Math.floor(subtotal * (coupon.discount_amount / 100)) 
          : Number(coupon.discount_amount);
      if (discount > maxTotalDiscount) discount = maxTotalDiscount;

      setCouponDiscount(discount);
      setActiveCoupon(coupon); 
      if ((parseInt(pointsInput) || 0) > (maxTotalDiscount - discount)) setPointsInput('');
      setShowCouponModal(false);
  };

  const pointsUsed = Math.min(parseInt(pointsInput) || 0, availablePointsLimit); 
  const finalTotal = Math.max(0, subtotal - couponDiscount - pointsUsed);

  // Распределение скидки для чека
  const itemsForCheckout = useMemo(() => {
      const selectedItems = items.filter(item => selectedIds.includes(item.id));
      const totalDiscountValue = couponDiscount + pointsUsed;
      if (totalDiscountValue <= 0) return selectedItems.map(item => ({ ...item, price_at_purchase: item.final_price_rub }));

      let distributed = 0;
      return selectedItems.map((item, index) => {
          const itemTotal = item.final_price_rub * item.quantity;
          let discount = Math.floor((itemTotal / subtotal) * totalDiscountValue);
          if (index === selectedItems.length - 1) discount = totalDiscountValue - distributed;
          else distributed += discount;
          
          const unitPrice = Math.floor((itemTotal - discount) / item.quantity);
          return { ...item, final_price_rub: unitPrice, price_at_purchase: unitPrice };
      });
  }, [items, selectedIds, subtotal, couponDiscount, pointsUsed]);

  const openCheckout = () => {
      if (selectedIds.length === 0) return window.Telegram?.WebApp?.showAlert('Выберите товары!');
      if (subtotal < MIN_ORDER_AMOUNT) return window.Telegram?.WebApp?.showAlert(`Мин. заказ: ${MIN_ORDER_AMOUNT} ₽`);
      setShowCheckout(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent animate-fade-in pb-32">
      <div className="p-6 pt-8 pb-4"><h1 className="text-white text-lg font-medium">Корзина ({items.length})</h1></div>

      {loading ? (
          <div className="text-center text-white/50 mt-10">Загрузка...</div>
      ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-10 opacity-50">
             <span className="material-symbols-outlined text-4xl mb-2">shopping_basket</span>
             <p className="text-sm">Корзина пуста</p>
          </div>
      ) : (
          <div className="px-6 space-y-4">
              <div className="space-y-3">
                  {items.map(item => (
                      <CartItem 
                        key={item.id} item={item}
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
                      subtotal={subtotal} total={finalTotal} discount={couponDiscount}
                      pointsInput={pointsInput} setPointsInput={handlePointsChange}
                      userPointsBalance={userPointsBalance} 
                      handleUseMaxPoints={() => handlePointsChange(availablePointsLimit)}
                      activeCouponCode={activeCoupon?.code}
                      onOpenCoupons={() => setShowCouponModal(true)}
                      onPay={openCheckout} 
                      onPlayVideo={() => setVideoOpen(true)} 
                  />
              ) : (
                  <div className="text-center text-white/40 py-4 text-sm bg-white/5 rounded-xl">
                      Выберите товары для расчета
                  </div>
              )}
          </div>
      )}

      {editingItem && (
        <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} onSave={saveItemParams} saving={savingItem} />
      )}
      {showCouponModal && (
         <CouponModal userId={user?.id} subtotal={subtotal} onClose={() => setShowCouponModal(false)} onApply={applyCoupon} activeCouponCode={activeCoupon?.code} />
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
           user={user} dbUser={dbUser} total={finalTotal} items={itemsForCheckout} 
           pointsUsed={pointsUsed} couponDiscount={couponDiscount} activeCoupon={activeCoupon}
           addresses={addresses} deliveryMethod={deliveryMethod} setDeliveryMethod={setDeliveryMethod}
           selectedAddress={selectedAddress} setSelectedAddress={setSelectedAddress}
           selectedPvz={selectedPvz} setSelectedPvz={setSelectedPvz}
           onManageAddresses={() => { sessionStorage.setItem('open_profile_tab', 'addresses'); setActiveTab('profile'); }} 
        />
      )}
      {videoOpen && <FullScreenVideo src={VIDEO_URL} onClose={() => setVideoOpen(false)} />}
    </div>
  );
}
