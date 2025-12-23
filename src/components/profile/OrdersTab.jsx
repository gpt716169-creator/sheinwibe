import React from 'react';

export default function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  // --- ИСПРАВЛЕНО: Английская B вместо русской И ---
  const displayId = order.order_number 
    ? `SHEIN B-${order.order_number}` 
    : `#${order.id.slice(0, 8).toUpperCase()}`;

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Логика статуса
  const getStatusInfo = (status) => {
    if (status === 'cancelled') return { text: 'Отменен', color: 'text-red-500 bg-red-500/10' };
    if (status === 'completed') return { text: 'Доставлен', color: 'text-green-500 bg-green-500/10' };
    if (status === 'waiting_for_pay') return { text: 'Ожидает оплаты', color: 'text-orange-400 bg-orange-400/10' };
    return { text: 'В обработке', color: 'text-blue-400 bg-blue-400/10' };
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[#151c28] border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* ШАПКА МОДАЛКИ */}
        <div className="sticky top-0 z-10 bg-[#151c28]/95 backdrop-blur border-b border-white/5 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              {displayId}
            </h2>
            <p className="text-xs text-white/40 mt-1">
              от {formatDate(order.created_at)}
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* КОНТЕНТ */}
        <div className="p-4 space-y-6">
          
          {/* Статус и Трек */}
          <div className="bg-[#1a2333] rounded-xl p-4 border border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/50 text-sm">Статус заказа</span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
            
            {order.tracking_number && (
              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <span className="text-white/50 text-sm">Трек-номер</span>
                <div className="flex items-center gap-2">
                   <span className="text-white font-mono tracking-wider">{order.tracking_number}</span>
                   <button 
                     onClick={() => navigator.clipboard.writeText(order.tracking_number)}
                     className="text-white/30 hover:text-white transition-colors"
                   >
                     <span className="material-symbols-outlined text-sm">content_copy</span>
                   </button>
                </div>
              </div>
            )}
          </div>

          {/* Список товаров */}
          <div>
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">checkroom</span>
              Товары ({order.order_items.length})
            </h3>
            <div className="space-y-2">
              {order.order_items.map((item, idx) => (
                <div key={idx} className="flex gap-3 bg-[#1a2333] p-2 rounded-xl border border-white/5">
                  <div 
                    className="w-16 h-20 bg-cover bg-center rounded-lg bg-[#0f1520] shrink-0"
                    style={{ backgroundImage: `url('${item.image_url}')` }}
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <p className="text-white text-sm line-clamp-2 leading-tight">
                      {item.product_name}
                    </p>
                    <div className="flex justify-between items-end mt-1">
                       <div className="text-xs text-white/40">
                         {item.goods_sn && <span className="block">SKU: {item.goods_sn}</span>}
                         <span>{item.quantity} шт.</span>
                       </div>
                       <span className="text-white/60 text-xs">
                         ~{Math.round(item.original_price_usd * 105)} ₽
                       </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Финансы */}
          <div className="bg-[#1a2333] rounded-xl p-4 border border-white/5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Сумма товаров</span>
              <span className="text-white">{Math.floor(order.total_amount).toLocaleString()} ₽</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Доставка</span>
              <span className="text-green-400">Бесплатно</span>
            </div>
            <div className="h-px bg-white/5 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Итого</span>
              <span className="text-xl font-bold text-primary">
                {Math.floor(order.total_amount).toLocaleString()} ₽
              </span>
            </div>
          </div>

          {/* Адрес доставки */}
          <div className="pb-4">
             <h3 className="text-white font-medium mb-2 text-sm text-white/50">Адрес доставки</h3>
             <p className="text-white text-sm bg-[#1a2333] p-3 rounded-xl border border-white/5">
               {order.delivery_address}
               <br />
               <span className="text-white/40 text-xs mt-1 block">
                 {order.contact_name}, {order.contact_phone}
               </span>
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}
