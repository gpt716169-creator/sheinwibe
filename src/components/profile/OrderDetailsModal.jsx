import React from 'react';

export default function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  // Если истории пока нет в базе, показываем заглушку на основе общего статуса
  const trackingHistory = order.tracking_history && order.tracking_history.length > 0 
      ? order.tracking_history 
      : [
          { date: order.created_at, status: 'Заказ создан', location: 'Приложение' },
          { date: null, status: 'Ожидает информации от службы доставки...', location: '' }
      ];

  // Форматирование даты
  const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div className="bg-[#151c28] w-full max-w-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            
            {/* HEADER */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1a2332] shrink-0">
                <div>
                    <h3 className="text-white font-bold">Заказ #{order.id.slice(0,6).toUpperCase()}</h3>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${order.status === 'paid' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                        <p className="text-white/50 text-[10px] uppercase font-bold">{order.status}</p>
                    </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* 1. ТРЕКИНГ (ТАЙМЛАЙН) */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-white/40">История пути</h4>
                        <span className="text-primary font-mono text-xs select-all bg-primary/10 px-2 py-1 rounded">{order.tracking_number || 'Нет трека'}</span>
                    </div>

                    <div className="relative pl-2 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                        {trackingHistory.map((event, index) => {
                            const isFirst = index === 0; // Самый свежий статус
                            return (
                                <div key={index} className="relative pl-6">
                                    {/* Точка на линии */}
                                    <div className={`absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full flex items-center justify-center border-4 border-[#1c232e] z-10 ${isFirst ? 'bg-primary shadow-[0_0_10px_rgba(19,236,91,0.4)]' : 'bg-white/20'}`}>
                                        {isFirst && <div className="w-2 h-2 bg-white rounded-full animate-ping absolute"></div>}
                                    </div>
                                    
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-bold leading-tight ${isFirst ? 'text-white' : 'text-white/50'}`}>
                                            {event.status}
                                        </span>
                                        {event.location && (
                                            <span className="text-[10px] text-white/40 mt-0.5">{event.location}</span>
                                        )}
                                        {event.date && (
                                            <span className="text-[10px] text-primary/80 font-mono mt-1">
                                                {formatDate(event.date)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. ИНФОРМАЦИЯ О ПОЛУЧАТЕЛЕ */}
                <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">Данные доставки</h4>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-white/30 text-lg mt-0.5">location_on</span>
                            <div>
                                <p className="text-white/40 text-[10px]">Адрес / ПВЗ</p>
                                <p className="text-white text-sm font-medium leading-snug">{order.delivery_address}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-white/30 text-lg">person</span>
                            <div>
                                <p className="text-white/40 text-[10px]">Получатель</p>
                                <p className="text-white text-sm font-medium">{order.recipient_name || order.user_info?.name}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. ТОВАРЫ */}
                <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-white/40 ml-1">Состав заказа</h4>
                    {order.order_items?.map((item, i) => (
                        <div key={i} className="flex gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                            <div className="w-12 h-16 rounded bg-cover bg-center bg-white/5 shrink-0" style={{backgroundImage: `url('${item.image_url}')`}}></div>
                            <div className="flex flex-col justify-center w-full">
                                <div className="flex justify-between items-start">
                                    <p className="text-white text-xs line-clamp-1 mr-2">{item.product_name}</p>
                                    <p className="text-white font-bold text-xs">{item.final_price_rub?.toLocaleString()} ₽</p>
                                </div>
                                <div className="flex justify-between items-end mt-1">
                                    <div className="flex gap-1">
                                        <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">{item.size}</span>
                                        <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">{item.color}</span>
                                    </div>
                                    <p className="text-white/40 text-[10px]">x{item.quantity}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* 4. ИТОГО */}
                <div className="space-y-1 pt-2 border-t border-white/10">
                     <div className="flex justify-between items-center">
                        <span className="text-white/50 text-xs">Итоговая стоимость</span>
                        <span className="text-lg font-bold text-primary">{order.total_amount?.toLocaleString()} ₽</span>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
}
