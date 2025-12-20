import React, { useMemo } from 'react';

export default function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  // --- ЛОГИКА ВИРТУАЛЬНОГО ТРЕКИНГА ---
  const fullHistory = useMemo(() => {
    if (!order.created_at) return [];

    const createdDate = new Date(order.created_at);
    const now = new Date();
    // Разница в минутах между созданием и текущим моментом
    const diffMinutes = (now - createdDate) / (1000 * 60);

    // Сценарий "фейковых" статусов (время в минутах от начала)
    const scenario = [
      { time: 0, status: 'Заказ оформлен', location: 'Приложение' },
      { time: 15, status: 'Выкуплен на SHEIN', location: 'SHEIN' },
      { time: 24 * 60, status: 'Сборка заказа', location: 'Склад SHEIN' },           // 1 день
      { time: 2 * 24 * 60, status: 'Заказ отправлен', location: 'Логистика SHEIN' }, // 2 дня
      { time: 3 * 24 * 60, status: 'В пути на склад SHEINWIBE', location: 'Транзит' }, // 3 дня
      { time: 7 * 24 * 60, status: 'Прибыл на склад SHEINWIBE', location: 'Склад РФ' }, // 7 дней (4 дня после предыдущего)
      { time: 8 * 24 * 60, status: 'Обработка таможенных деклараций', location: 'Таможня' } // 8 дней
    ];

    // 1. Генерируем виртуальные статусы, которые УЖЕ наступили по времени
    const virtualHistory = scenario
      .filter(step => diffMinutes >= step.time)
      .map(step => ({
        // Рассчитываем "фейковую" дату события: Дата создания + время шага
        date: new Date(createdDate.getTime() + step.time * 60000).toISOString(),
        status: step.status,
        location: step.location,
        isVirtual: true // Пометка, что это авто-статус
      }));

    // 2. Берем реальные статусы из базы (если они уже есть)
    // Например, когда n8n начнет парсить реальный трек CDEK/5Post
    let realHistory = [];
    if (order.tracking_history && Array.isArray(order.tracking_history)) {
        realHistory = order.tracking_history;
    }

    // 3. Объединяем: Сначала виртуальные, потом реальные (если реальные новее)
    // Можно сделать так: если есть реальные статусы, показываем только их + "Оформлен"
    // Но пока сделаем простое слияние
    
    // Если есть реальные статусы, они обычно важнее последних виртуальных.
    // Для простоты выводим всё и сортируем по дате (новые сверху)
    const combined = [...virtualHistory, ...realHistory];
    
    // Сортировка: от новых к старым
    return combined.sort((a, b) => new Date(b.date) - new Date(a.date));

  }, [order]);

  // --- ФОРМАТИРОВАНИЕ ДАТЫ ---
  const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      
      const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      
      return isToday ? `Сегодня, ${timeStr}` : `${dateStr}, ${timeStr}`;
  };

  // Нормализация данных контакта
  const recipientName = order.recipient_name || order.contact_name || order.user_info?.name || 'Не указано';
  const recipientPhone = order.recipient_phone || order.contact_phone || order.user_info?.phone || 'Не указано';
  const address = order.delivery_address || order.address || 'Адрес не указан';

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
        {/* Фон */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
        
        {/* Контент (выезжает снизу на мобилках) */}
        <div className="relative z-10 flex flex-col w-full h-full md:h-auto md:max-h-[85vh] md:max-w-md md:mx-auto md:mt-10 bg-[#101622] md:rounded-3xl shadow-2xl overflow-hidden">
            
            {/* HEADER */}
            <div className="p-5 border-b border-white/5 bg-[#151c28] flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-white">Заказ #{order.id.slice(0,8).toUpperCase()}</h2>
                    <p className="text-white/40 text-xs">{formatDate(order.created_at)}</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-safe-bottom hide-scrollbar">
                
                {/* 1. СТАТУС БАР */}
                <div className="bg-gradient-to-r from-emerald-900/40 to-[#101622] border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <span className="material-symbols-outlined">local_shipping</span>
                    </div>
                    <div>
                        <p className="text-emerald-400 font-bold text-sm">
                            {fullHistory[0]?.status || order.status}
                        </p>
                        <p className="text-white/40 text-xs">
                            {fullHistory[0]?.location || 'В обработке'}
                        </p>
                    </div>
                </div>

                {/* 2. ТРЕКИНГ (TIMELINE) */}
                <div>
                    <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4">История отслеживания</h3>
                    <div className="space-y-0 relative pl-2">
                        {/* Линия timeline */}
                        <div className="absolute top-2 bottom-2 left-[19px] w-0.5 bg-white/10"></div>

                        {fullHistory.map((item, index) => {
                            const isLatest = index === 0;
                            return (
                                <div key={index} className="relative flex gap-4 pb-6 last:pb-0 group">
                                    {/* Точка */}
                                    <div className={`relative z-10 w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 transition-all ${isLatest ? 'bg-primary border-primary shadow-[0_0_10px_rgba(19,236,91,0.5)]' : 'bg-[#101622] border-white/20 group-hover:border-white/40'}`}></div>
                                    
                                    {/* Инфо */}
                                    <div className="flex-1 -mt-1">
                                        <div className="flex justify-between items-start">
                                            <p className={`text-sm font-medium leading-tight ${isLatest ? 'text-white' : 'text-white/60'}`}>
                                                {item.status}
                                            </p>
                                            <span className="text-[10px] text-white/30 whitespace-nowrap ml-2">
                                                {formatDate(item.date).split(', ')[1] || ''}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-[10px] text-white/30">{item.location}</p>
                                            <p className="text-[10px] text-white/20">{formatDate(item.date).split(', ')[0]}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. ДЕТАЛИ ДОСТАВКИ */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="bg-[#1a2333] rounded-xl p-3 flex gap-3 items-center">
                         <span className="material-symbols-outlined text-white/30">person</span>
                         <div className="overflow-hidden">
                             <p className="text-white/40 text-[10px] uppercase font-bold">Получатель</p>
                             <p className="text-white text-xs truncate">{recipientName}</p>
                             <p className="text-white/60 text-xs">{recipientPhone}</p>
                         </div>
                    </div>
                    <div className="bg-[#1a2333] rounded-xl p-3 flex gap-3 items-center">
                         <span className="material-symbols-outlined text-white/30">location_on</span>
                         <div className="overflow-hidden">
                             <p className="text-white/40 text-[10px] uppercase font-bold">Доставка</p>
                             <p className="text-white text-xs break-words line-clamp-2">{address}</p>
                         </div>
                    </div>
                </div>

                {/* 4. ТОВАРЫ */}
                <div>
                    <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">Состав заказа</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {(order.order_items || []).map((item, idx) => (
                            <div key={idx} className="aspect-[3/4] rounded-lg bg-cover bg-center border border-white/10 relative" style={{backgroundImage: `url('${item.image_url}')`}}>
                                <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-tl-lg font-bold">
                                    x{item.quantity}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

             {/* FOOTER */}
             <div className="p-4 bg-[#151c28] border-t border-white/5 shrink-0">
                 <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-white/50">Сумма заказа</span>
                    <span className="text-white font-bold">{Number(order.total_amount).toLocaleString()} ₽</span>
                 </div>
                 {order.tracking_number && (
                     <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                         <span className="text-xs text-white/40">Трек-номер:</span>
                         <span className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded select-all">
                             {order.tracking_number}
                         </span>
                     </div>
                 )}
             </div>

        </div>
    </div>
  );
}
