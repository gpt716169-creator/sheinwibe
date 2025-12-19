import React, { useState, useEffect, useMemo } from 'react';
import CartItem from '../components/cart/CartItem';
import PaymentBlock from '../components/cart/PaymentBlock';
import FullScreenVideo from '../components/ui/FullScreenVideo'; // <-- Импорт
import EditItemModal from '../components/cart/EditItemModal';
import CheckoutModal from '../components/cart/CheckoutModal';
import CouponModal from '../components/cart/CouponModal';       // <-- Импорт

export default function Cart({ user, dbUser, setActiveTab, onRefreshData }) {
  // ... (весь state остается без изменений) ...
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
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
  const MAX_POINTS_PERCENT = 0.35;
  const userPointsBalance = dbUser?.points || 0;

  // ... (useEffect, loadCart, loadAddresses, manageAddresses, updateQuantity, deleteItem, saveItemParams - БЕЗ ИЗМЕНЕНИЙ) ...
  
  // --- CALCULATIONS (БЕЗ ИЗМЕНЕНИЙ) ---
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + (i.final_price_rub * i.quantity), 0), [items]);
  const maxAllowedPoints = Math.floor(subtotal * MAX_POINTS_PERCENT);
  const availablePointsLimit = Math.min(maxAllowedPoints, userPointsBalance);

  // --- ОБНОВЛЕННАЯ ЛОГИКА КУПОНОВ ---
  // Теперь принимает аргумент codeFromModal (опционально)
  const applyCoupon = (codeFromModal) => {
      // Если передали код (клик по карточке), берем его. Если нет - берем из стейта (если бы был инпут в самой корзине, но у нас он теперь в модалке)
      const code = (codeFromModal || '').toUpperCase().trim();
      
      if (!code) return;
      
      let discount = 0;
      if (code === 'WELCOME') discount = 500;
      else if (code === 'SALE10') discount = Math.floor(subtotal * 0.1);
      else { 
          window.Telegram?.WebApp?.showAlert('Неверный код или купон истек'); 
          return; 
      }

      setCouponDiscount(discount);
      setActiveCoupon(code);
      setShowCouponModal(false); // Закрываем модалку после успеха
      window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
      window.Telegram?.WebApp?.showAlert(`Купон ${code} применен! Скидка: ${discount} ₽`);
  };

  const handlePointsChange = (val) => {
      let num = parseInt(val) || 0;
      if (num < 0) num = 0;
      if (num > availablePointsLimit) num = availablePointsLimit;
      setPointsInput(num > 0 ? num.toString() : '');
  };

  const pointsUsed = parseInt(pointsInput) || 0;
  const finalTotal = Math.max(0, subtotal - couponDiscount - pointsUsed);

  const openCheckout = () => {
      if (items.some(i => i.size === 'NOT_SELECTED' || !i.size)) {
          window.Telegram?.WebApp?.showAlert('Сначала выберите размер для всех товаров!');
          return;
      }
      setShowCheckout(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent animate-fade-in pb-32">
      <div className="p-6 pt-8 pb-4"><h1 className="text-white text-lg font-medium">Корзина ({items.length})</h1></div>

      {loading ? <div className="text-center text-white/50 mt-10">Загрузка...</div> : 
       items.length === 0 ? <div className="text-center text-white/50 mt-10">Пусто</div> : (
          <div className="px-6 space-y-4">
              <div className="space-y-3">
                  {items.map(item => (
                      <CartItem key={item.id} item={item} onEdit={setEditingItem} onDelete={handleDeleteItem} onUpdateQuantity={handleUpdateQuantity} />
                  ))}
              </div>
              <div className="h-px bg-white/5 my-4"></div>
              <PaymentBlock 
                  subtotal={subtotal} total={finalTotal} discount={couponDiscount}
                  pointsInput={pointsInput} setPointsInput={handlePointsChange}
                  userPointsBalance={userPointsBalance} handleUseMaxPoints={() => handlePointsChange(userPointsBalance)}
                  onOpenCoupons={() => setShowCouponModal(true)}
                  onPay={openCheckout} onPlayVideo={() => setVideoOpen(true)} 
              />
          </div>
      )}

      {/* --- MODALS --- */}

      {/* Редактирование */}
      {editingItem && (
        <EditItemModal 
          item={editingItem} onClose={() => setEditingItem(null)} 
          onSave={saveItemParams} saving={savingItem} 
        />
      )}

      {/* КУПОНЫ (НОВЫЙ КОМПОНЕНТ) */}
      {showCouponModal && (
         <CouponModal 
            onClose={() => setShowCouponModal(false)}
            onApply={applyCoupon}
            activeCoupon={activeCoupon}
         />
      )}

      {/* Оформление заказа */}
      {showCheckout && (
        <CheckoutModal 
           onClose={(success) => { setShowCheckout(false); if(success) { setItems([]); if (onRefreshData) onRefreshData(); setActiveTab('home'); } }}
           user={user} dbUser={dbUser}
           total={finalTotal} items={items} pointsUsed={pointsUsed} couponDiscount={couponDiscount} activeCoupon={activeCoupon}
           addresses={addresses} deliveryMethod={deliveryMethod} setDeliveryMethod={setDeliveryMethod}
           selectedAddress={selectedAddress} setSelectedAddress={setSelectedAddress}
           selectedPvz={selectedPvz} setSelectedPvz={setSelectedPvz}
           onManageAddresses={handleManageAddresses} 
        />
      )}

      {/* Видео (НОВЫЙ КОМПОНЕНТ С PORTAL) */}
      {videoOpen && <FullScreenVideo src={VIDEO_URL} onClose={() => setVideoOpen(false)} />}
    </div>
  );
}
