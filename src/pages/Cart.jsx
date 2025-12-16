import React, { useState, useEffect, useMemo } from 'react';

export default function Cart({ user, dbUser, setActiveTab }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Состояние калькулятора
  const [pointsInput, setPointsInput] = useState('');
  const [currentDiscount, setCurrentDiscount] = useState(0);
  const [promoCodeInput, setPromoCodeInput] = useState('');

  // Баланс
  const userPointsBalance = dbUser?.points || 0;

  // Состояние модалок
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCouponsOpen, setIsCouponsOpen] = useState(false);
  
  // Редактирование
  const [editingItem, setEditingItem] = useState(null); 
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  // Форма заказа
  const [checkoutForm, setCheckoutForm] = useState({
    name: dbUser?.name || user?.first_name || '',
    phone: dbUser?.phone || '',
    email: dbUser?.email || '',
    address: dbUser?.address || '',
    deliveryMethod: 'ПВЗ (5Post)',
    isDeliveryToggle: false,
    agreed: false,
    customsAgreed: false
  });

  useEffect(() => {
    if (dbUser) {
        setCheckoutForm(prev => ({
            ...prev,
            name: prev.name || dbUser.name,
            phone: prev.phone || dbUser.phone,
            email: prev.email || dbUser.email
        }));
    }
  }, [dbUser]);

  // Загрузка
  const loadCart = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const res = await fetch(`https://proshein.com/webhook/get-cart?tg_id=${user.id}`);
      const text = await res.text();
      
      if (!text) { setItems([]); return; }
      
      const json = JSON.parse(text);
      let loadedItems = json.items || (Array.isArray(json) ? json : []);
      loadedItems = loadedItems.map(i => ({ ...i, quantity: i.quantity || 1 }));
      setItems(loadedItems);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  // Математика
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.final_price_rub || 0) * item.quantity, 0);
  }, [items]);

  const pointsToUse = Math.min(parseInt(pointsInput) || 0, userPointsBalance);
  const finalTotal = Math.max(0, subtotal - currentDiscount - pointsToUse);

  // Действия
  const handleQuantity = (id, delta) => {
    setItems(prev => prev.map(item => {
        if (item.id === id) {
            return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
    }));
  };

  const handleDeleteItem = async (e, id) => {
      e.stopPropagation(); 
      if(!window.confirm('Удалить товар?')) return;

      setItems(prev => prev.filter(i => i.id !== id));
      try {
          await fetch('https://proshein.com/webhook/delete-item', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: id, tg_id: user?.id })
          }); 
      } catch (err) { console.error(err); }
  };

  const handleUseMaxPoints = () => {
      if (subtotal === 0) return;
      const maxAllowed = Math.floor(subtotal * 0.5);
      const toWrite = Math.min(userPointsBalance, maxAllowed, Math.max(0, subtotal - currentDiscount));
      setPointsInput(toWrite.toString());
  };

  const handlePayOrder = async () => {
      if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
          window.Telegram?.WebApp?.showAlert('Заполните поля доставки');
          return;
      }
      if (!checkoutForm.agreed || !checkoutForm.customsAgreed) {
          window.Telegram?.WebApp?.showAlert('Примите соглашения');
          return;
      }

      window.Telegram?.WebApp?.MainButton.showProgress();
      
      try {
          const res = await fetch('https://proshein.com/webhook/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  tg_id: user?.id,
                  user_info: {
                      name: checkoutForm.name,
                      phone: checkoutForm.phone,
                      email: checkoutForm.email,
                      address: checkoutForm.address,
                      delivery_method: checkoutForm.deliveryMethod
                  },
                  final_total: finalTotal,
                  discount_applied: currentDiscount + pointsToUse,
                  items: items
              })
          });
          
          const json = await res.json();
          if (json.status === 'success') {
              window.Telegram?.WebApp?.showAlert(`Заказ #${json.order_id} создан!`);
              setIsCheckoutOpen(false);
              setItems([]); 
              setActiveTab('home'); 
          } else {
              throw new Error(json.message);
          }
      } catch (e) {
          window.Telegram?.WebApp?.showAlert('Ошибка создания заказа');
      } finally {
          window.Telegram?.WebApp?.MainButton.hideProgress();
      }
  };

  const openEditModal = (item) => {
      setEditingItem(item);
      setSelectedSize(item.size === 'NOT_SELECTED' ? null : item.size);
      setSelectedColor(item.color || 'As shown');
  };

  const saveEditedItem = () => {
      if (!selectedSize) {
          window.Telegram?.WebApp?.showAlert('Выберите размер');
          return;
      }
      setItems(prev => prev.map(i => {
          if (i.id === editingItem.id) return { ...i, size: selectedSize, color: selectedColor };
          return i;
      }));
      setEditingItem(null);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in pb-24">
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 pt-8 pb-4">
        <div className="w-10"></div>
        <h1 className="text-white text-lg font-medium">Корзина</h1>
        <div className="w-10"></div>
      </div>

      {/* List */}
      <div className="px-6 space-y-4 relative z-10 flex-1 overflow-y-auto">
        {loading ? (
            <div className="animate-pulse text-white/50 text-center py-10">Загрузка...</div>
        ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-10 opacity-50">
                <span className="material-symbols-outlined text-[48px] mb-2">production_quantity_limits</span>
                <p>Корзина пуста</p>
            </div>
        ) : (
            items.map(item => {
                const isWarning = item.size === 'NOT_SELECTED' || !item.size;
                return (
                    <div 
                        key={item.id} 
                        onClick={() => openEditModal(item)}
                        className={`relative p-3 rounded-2xl bg-dark-card/80 border transition-all hover:bg-dark-card mb-3 cursor-pointer ${isWarning ? 'border-red-500/30 bg-red-900/5' : 'border-white/5'}`}
                    >
                        <button className="absolute top-3 right-3 text-white/20 hover:text-red-400 z-20" onClick={(e) => handleDeleteItem(e, item.id)}>
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>

                        <div className="flex gap-3 pointer-events-none">
                             <div className="relative w-20 h-24 shrink-0 rounded-lg overflow-hidden bg-white/5">
                                 <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url('${item.image_url}')`}}></div>
                             </div>
                             <div className="flex flex-col flex-1 justify-between py-0.5">
                                 <div>
                                     <h3 className="text-white font-medium text-xs line-clamp-2 mb-1">{item.product_name}</h3>
                                     {isWarning ? (
                                         <span className="text-red-400 text-[10px] font-bold">⚠ Выберите размер</span>
                                     ) : (
                                         <span className="text-white/60 text-[10px]">{item.size} • {item.color}</span>
                                     )}
                                 </div>
                                 <div className="flex items-center justify-between mt-2">
                                     <span className="text-primary font-bold">{(item.final_price_rub * item.quantity).toLocaleString()} ₽</span>
                                     <div className="flex items-center gap-3 bg-white/5 rounded-lg px-2 py-1 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                                         <button className="w-5 h-5 flex items-center justify-center text-white/50" onClick={() => handleQuantity(item.id, -1)}>-</button>
                                         <span className="text-white text-xs w-3 text-center">{item.quantity}</span>
                                         <button className="w-5 h-5 flex items-center justify-center text-white/50" onClick={() => handleQuantity(item.id, 1)}>+</button>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {/* Footer */}
      <div className="px-6 mt-4 relative z-10">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3 mb-4">
              <div className="flex justify-between text-sm text-white/60"><span>Товары</span><span>{subtotal.toLocaleString()} ₽</span></div>
              {(currentDiscount > 0 || pointsToUse > 0) && (
                  <div className="flex justify-between text-sm text-primary">
                      <span>Скидка</span><span>-{currentDiscount + pointsToUse}</span>
                  </div>
              )}
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">Итого</span>
                  <span className="text-2xl font-bold text-primary">{finalTotal.toLocaleString()} ₽</span>
              </div>
          </div>
          
          <button 
            onClick={() => {
                if(items.length > 0 && !items.some(i => i.size === 'NOT_SELECTED')) setIsCheckoutOpen(true);
            }}
            className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-xl flex items-center justify-center gap-3 text-white font-bold text-lg shadow-lg"
          >
              Оплатить
          </button>
      </div>

      {/* Checkout Modal (Simplified for brevity) */}
      {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 bg-[#101622] flex flex-col">
             <div className="flex justify-between p-6 border-b border-white/5">
                 <button onClick={() => setIsCheckoutOpen(false)}><span className="material-symbols-outlined text-white">close</span></button>
                 <h2 className="text-white font-bold">Оформление</h2>
                 <div className="w-6"></div>
             </div>
             <div className="p-6 space-y-4 overflow-y-auto flex-1">
                 <input className="custom-input w-full rounded-xl px-4 py-3" value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})} placeholder="ФИО" />
                 <input className="custom-input w-full rounded-xl px-4 py-3" value={checkoutForm.phone} onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})} placeholder="Телефон" />
                 <input className="custom-input w-full rounded-xl px-4 py-3" value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} placeholder="Адрес (ПВЗ)" />
                 
                 <label className="flex gap-2 text-sm text-white/60">
                    <input type="checkbox" checked={checkoutForm.agreed} onChange={e => setCheckoutForm({...checkoutForm, agreed: e.target.checked})} />
                    Я согласен с офертой
                 </label>
                 <label className="flex gap-2 text-sm text-white/60">
                    <input type="checkbox" checked={checkoutForm.customsAgreed} onChange={e => setCheckoutForm({...checkoutForm, customsAgreed: e.target.checked})} />
                    Согласен на таможенное оформление
                 </label>
             </div>
             <div className="p-6">
                 <button onClick={handlePayOrder} className="w-full h-14 bg-primary text-black font-bold rounded-xl">Подтвердить</button>
             </div>
          </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setEditingItem(null)}>
              <div className="bg-[#151c28] w-full max-w-sm rounded-2xl p-6" onClick={e => e.stopPropagation()}>
                  <h3 className="text-white font-bold mb-4">Выберите параметры</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                      {editingItem.size_options?.map(opt => (
                          <button key={opt.name} onClick={() => setSelectedSize(opt.name)} className={`px-3 py-2 rounded border ${selectedSize === opt.name ? 'bg-primary text-black border-primary' : 'border-white/20 text-white'}`}>{opt.name}</button>
                      ))}
                  </div>
                  <button onClick={saveEditedItem} className="w-full py-3 bg-primary text-black font-bold rounded-xl">Сохранить</button>
              </div>
          </div>
      )}
    </div>
  );
}