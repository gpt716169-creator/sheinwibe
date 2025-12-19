import React, { useState, useEffect } from 'react';

export default function AddressModal({ isOpen, onClose, editingAddress, user, onSave }) {
  if (!isOpen) return null;

  // --- STATE ---
  const [deliveryMethod, setDeliveryMethod] = useState('ПВЗ (5Post)');
  
  // Поля формы
  const [form, setForm] = useState({
      id: null,
      full_name: '',
      phone: '',
      email: '', // Добавили Email
      region: '', // Для курьера
      street: '', // Для курьера
      is_default: false
  });

  // Логика поиска 5Post
  const [pvzQuery, setPvzQuery] = useState('');
  const [pvzResults, setPvzResults] = useState([]);
  const [selectedPvz, setSelectedPvz] = useState(null);
  const [loadingPvz, setLoadingPvz] = useState(false);

  // --- INIT ---
  useEffect(() => {
      if (editingAddress) {
          // Если редактируем
          const isPvz = editingAddress.street.startsWith('5Post');
          setDeliveryMethod(isPvz ? 'ПВЗ (5Post)' : 'Почта РФ');

          setForm({
              id: editingAddress.id,
              full_name: editingAddress.full_name,
              phone: editingAddress.phone,
              email: editingAddress.email || user?.email || '', // Подтягиваем email если есть
              region: editingAddress.region || '',
              street: editingAddress.street || '',
              is_default: editingAddress.is_default
          });

          if (isPvz) {
               // Пытаемся восстановить вид ПВЗ из строки адреса
               // Строка обычно: "5Post: Город, Улица (Имя)"
               const cleanAddr = editingAddress.street.replace('5Post: ', '');
               // Разбиваем "Город, Улица (Имя)" грубо, чисто для визуала
               const parts = cleanAddr.split(', '); 
               const city = parts[0] || editingAddress.region;
               const addr = parts.slice(1).join(', ').split('(')[0] || cleanAddr;
               
               setSelectedPvz({ 
                   city: city, 
                   address: addr, 
                   name: 'Сохраненный ПВЗ' 
               });
          }
      } else {
          // Если новый адрес
          setDeliveryMethod('ПВЗ (5Post)');
          setForm({
              id: null,
              full_name: user?.first_name || '',
              phone: '',
              email: '',
              region: '',
              street: '',
              is_default: false
          });
          setSelectedPvz(null);
          setPvzQuery('');
          setPvzResults([]);
      }
  }, [editingAddress, user]);

  // --- ПОИСК ПВЗ (Debounce) ---
  useEffect(() => {
    const t = setTimeout(() => {
      if (pvzQuery.length > 2 && !selectedPvz) searchPvz(pvzQuery);
    }, 600);
    return () => clearTimeout(t);
  }, [pvzQuery]);

  const searchPvz = async (q) => {
      setLoadingPvz(true);
      try {
          const res = await fetch(`https://proshein.com/webhook/search-pvz?q=${encodeURIComponent(q)}`);
          const rawData = await res.json();
          
          // Универсальный парсинг (как мы чинили в корзине)
          let list = [];
          if (Array.isArray(rawData)) list = rawData;
          else if (rawData?.json && Array.isArray(rawData.json)) list = rawData.json;
          else if (rawData?.data && Array.isArray(rawData.data)) list = rawData.data;
          else if (rawData?.rows && Array.isArray(rawData.rows)) list = rawData.rows;

          setPvzResults(list);
      } catch (e) { 
          console.error(e); 
      } finally { 
          setLoadingPvz(false); 
      }
  };

  // --- SAVE ---
  const handleSave = () => {
      if (!form.full_name || !form.phone || !form.email) {
          window.Telegram?.WebApp?.showAlert("Заполните ФИО, телефон и Email");
          return;
      }

      let finalStreet = form.street;
      let finalRegion = form.region;

      if (deliveryMethod === 'ПВЗ (5Post)') {
          if (!selectedPvz) {
              window.Telegram?.WebApp?.showAlert("Выберите пункт выдачи");
              return;
          }
          finalStreet = `5Post: ${selectedPvz.city}, ${selectedPvz.address} (${selectedPvz.name})`;
          finalRegion = selectedPvz.city;
      } else {
          if (!form.street || !form.region) {
              window.Telegram?.WebApp?.showAlert("Заполните адрес и город");
              return;
          }
      }

      onSave({
          ...form,
          region: finalRegion,
          street: finalStreet
      });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#101622] flex flex-col animate-slide-up">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#101622] sticky top-0 z-10">
            <button onClick={onClose} className="text-white/50 hover:text-white">Отмена</button>
            <h3 className="text-white font-bold">{form.id ? 'Редактировать' : 'Новый адрес'}</h3>
            <button onClick={handleSave} className="text-primary font-bold">Сохранить</button>
        </div>
        
        {/* FORM BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-20">
            
            {/* 1. КОНТАКТЫ */}
            <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold text-white/40 ml-1">Контактные данные</h4>
                <input className="custom-input w-full rounded-xl px-4 py-3 text-sm" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="ФИО Получателя" />
                <input type="tel" className="custom-input w-full rounded-xl px-4 py-3 text-sm" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Телефон (+7...)" />
                <input type="email" className="custom-input w-full rounded-xl px-4 py-3 text-sm" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email (для чеков)" />
            </div>

            {/* 2. ТИП ДОСТАВКИ */}
            <div className="space-y-3">
                 <h4 className="text-[10px] uppercase font-bold text-white/40 ml-1">Способ доставки</h4>
                 <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                    <button onClick={() => setDeliveryMethod('ПВЗ (5Post)')} className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${deliveryMethod === 'ПВЗ (5Post)' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'}`}>📦 5Post</button>
                    <button onClick={() => setDeliveryMethod('Почта РФ')} className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all ${deliveryMethod === 'Почта РФ' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'}`}>🏠 Почта РФ</button>
                 </div>
            </div>

            {/* 3. ДЕТАЛИ АДРЕСА */}
            <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold text-white/40 ml-1">
                    {deliveryMethod === 'ПВЗ (5Post)' ? 'Поиск пункта выдачи' : 'Адрес доставки'}
                </h4>

                {deliveryMethod === 'ПВЗ (5Post)' ? (
                     <div className="space-y-2">
                        {!selectedPvz ? (
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-3.5 text-white/40">search</span>
                                <input 
                                    className="custom-input w-full rounded-xl pl-10 pr-4 py-3 text-sm bg-[#151c28] border border-white/10 text-white focus:border-primary" 
                                    placeholder="Город, Улица (пр. Москва Ленина)"
                                    value={pvzQuery}
                                    onChange={(e) => setPvzQuery(e.target.value)}
                                />
                                {loadingPvz && <div className="absolute right-3 top-3.5"><span className="material-symbols-outlined animate-spin text-primary text-sm">progress_activity</span></div>}
                                
                                {/* ВЫПАДАЮЩИЙ СПИСОК (СТАТИЧНЫЙ) */}
                                {pvzResults.length > 0 && (
                                    <div className="mt-2 bg-[#1c2636] border border-white/10 rounded-xl overflow-hidden animate-fade-in">
                                        {pvzResults.map(pvz => (
                                            <div key={pvz.id} onClick={() => { setSelectedPvz(pvz); setPvzQuery(''); setPvzResults([]); }} className="p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer">
                                                <p className="text-white text-xs font-bold">{pvz.city}, {pvz.address}</p>
                                                <p className="text-white/50 text-[10px]">{pvz.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {pvzResults.length === 0 && pvzQuery.length > 2 && !loadingPvz && (
                                    <div className="text-center text-white/30 text-xs mt-2">Ничего не найдено</div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl flex justify-between items-center animate-fade-in">
                                <div>
                                    <p className="text-primary text-[10px] font-bold uppercase mb-1">Выбран 5Post</p>
                                    <p className="text-white text-sm font-medium leading-snug">{selectedPvz.city}, {selectedPvz.address}</p>
                                    <p className="text-white/40 text-[10px]">{selectedPvz.name}</p>
                                </div>
                                <button onClick={() => setSelectedPvz(null)} className="text-white/50 hover:text-white p-2"><span className="material-symbols-outlined">close</span></button>
                            </div>
                        )}
                     </div>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-white/30 ml-1">Регион / Город</label>
                            <input className="custom-input w-full rounded-xl px-4 py-3 text-sm" value={form.region} onChange={e => setForm({...form, region: e.target.value})} placeholder="г. Москва" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-white/30 ml-1">Улица, Дом, Квартира</label>
                            <input className="custom-input w-full rounded-xl px-4 py-3 text-sm" value={form.street} onChange={e => setForm({...form, street: e.target.value})} placeholder="ул. Ленина, д. 1, кв. 5" />
                        </div>
                    </div>
                )}
            </div>

            {/* 4. ЧЕКБОКС ОСНОВНОГО */}
            <div className="pt-2 flex items-center justify-between border-t border-white/5">
                <span className="text-sm text-white">Сделать основным адресом</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={form.is_default} onChange={e => setForm({...form, is_default: e.target.checked})} />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>
        </div>
    </div>
  );
}
