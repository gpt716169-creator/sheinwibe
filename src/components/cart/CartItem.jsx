import React from 'react';

export default function CartItem({ item, onEdit, onDelete, onUpdateQuantity }) {
  const isWarning = item.size === 'NOT_SELECTED' || !item.size;

  return (
    <div className={`relative group p-3 rounded-2xl bg-dark-card/80 border backdrop-blur-sm flex gap-3 transition-all ${isWarning ? 'border-red-500/30 bg-red-900/5' : 'border-white/5'}`}>
        
        {/* Кнопка удаления */}
        <button 
            className="absolute top-3 right-3 text-white/20 hover:text-red-400 p-2 z-10" 
            onClick={(e) => onDelete(e, item.id)}
        >
            <span className="material-symbols-outlined text-sm">close</span>
        </button>

        {/* Картинка (тоже открывает редактирование) */}
        <div 
            onClick={() => onEdit(item)}
            className="w-20 h-24 rounded-lg bg-cover bg-center shrink-0 bg-white/5 cursor-pointer" 
            style={{backgroundImage: `url('${item.image_url}')`}}
        ></div>

        <div className="flex flex-col justify-between flex-1 py-1 pr-6">
            <h3 className="text-white text-xs leading-tight line-clamp-2 font-medium">{item.product_name}</h3>
            
            {/* Блок характеристик (Кликабельный) */}
            <div onClick={() => onEdit(item)} className="mt-2 cursor-pointer group/edit">
                {isWarning ? (
                    <div className="flex items-center gap-1 text-red-400 text-[10px] font-bold uppercase animate-pulse">
                        <span className="material-symbols-outlined text-xs">warning</span>
                        Выбрать размер
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {/* Размер */}
                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-white/70 group-hover/edit:border-primary/50 transition-colors">
                            <span className="font-mono">{item.size}</span>
                            <span className="material-symbols-outlined text-[10px] opacity-50">keyboard_arrow_down</span>
                        </div>
                        
                        {/* Цвет */}
                        {item.color && (
                            <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-white/70 group-hover/edit:border-primary/50 transition-colors">
                                <span className="w-2 h-2 rounded-full border border-white/20" style={{backgroundColor: item.color.toLowerCase() === 'white' ? '#fff' : item.color}}></span>
                                <span>{item.color}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Цена и Кол-во */}
            <div className="flex justify-between items-end mt-2">
                <span className="text-primary font-bold text-base">{(item.final_price_rub * item.quantity).toLocaleString()} ₽</span>
                
                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1 border border-white/5">
                    <button className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white active:scale-90" onClick={() => onUpdateQuantity(item.id, -1)}>-</button>
                    <span className="text-xs w-4 text-center text-white font-medium">{item.quantity}</span>
                    <button className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white active:scale-90" onClick={() => onUpdateQuantity(item.id, 1)}>+</button>
                </div>
            </div>
        </div>
    </div>
  );
}
