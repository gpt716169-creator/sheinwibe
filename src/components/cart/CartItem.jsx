import React from 'react';

export default function CartItem({ item, onEdit, onDelete, onUpdateQuantity }) {
  const isWarning = item.size === 'NOT_SELECTED' || !item.size;

  return (
    <div className={`relative group p-3 rounded-2xl bg-[#1c2636] border backdrop-blur-sm flex gap-3 transition-all overflow-hidden ${isWarning ? 'border-red-500/30 bg-red-900/10' : 'border-white/5'}`}>
        
        {/* Кнопка удаления */}
        <button 
            className="absolute top-2 right-2 text-white/20 hover:text-red-400 p-2 z-10 active:scale-90 transition-transform" 
            onClick={(e) => onDelete(e, item.id)}
        >
            <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Картинка */}
        <div 
            onClick={() => onEdit(item)}
            className="w-20 h-24 rounded-lg bg-cover bg-center shrink-0 bg-white/5 cursor-pointer border border-white/5" 
            style={{backgroundImage: `url('${item.image_url}')`}}
        ></div>

        <div className="flex flex-col justify-between flex-1 py-0.5 min-w-0">
            {/* Заголовок */}
            <div className="pr-8">
                 <h3 className="text-white text-xs leading-snug font-medium line-clamp-2">{item.product_name}</h3>
            </div>
            
            {/* Параметры */}
            <div onClick={() => onEdit(item)} className="mt-1 cursor-pointer group/edit">
                {isWarning ? (
                    <div className="flex items-center gap-1 text-red-400 text-[10px] font-bold uppercase animate-pulse">
                        <span className="material-symbols-outlined text-xs">warning</span>
                        Выбрать размер
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1 bg-black/20 border border-white/10 px-2 py-0.5 rounded text-[10px] text-white/70 group-hover/edit:border-primary/50 transition-colors">
                            <span className="font-mono font-bold">{item.size}</span>
                            <span className="material-symbols-outlined text-[10px] opacity-50">expand_more</span>
                        </div>
                        {item.color && (
                            <div className="flex items-center gap-1 bg-black/20 border border-white/10 px-2 py-0.5 rounded text-[10px] text-white/70">
                                <span className="w-2 h-2 rounded-full border border-white/20" style={{backgroundColor: item.color.toLowerCase() === 'white' ? '#fff' : item.color}}></span>
                                <span className="max-w-[60px] truncate">{item.color}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Цена и Кол-во */}
            <div className="flex justify-between items-end mt-2 gap-2">
                <span className="text-primary font-bold text-base truncate">{(item.final_price_rub * item.quantity).toLocaleString()} ₽</span>
                
                <div className="flex items-center gap-1 bg-black/20 rounded-lg p-0.5 border border-white/5 shrink-0">
                    <button className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white active:bg-white/10 rounded-md" onClick={() => onUpdateQuantity(item.id, -1)}>-</button>
                    <span className="text-xs w-5 text-center text-white font-bold">{item.quantity}</span>
                    <button className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white active:bg-white/10 rounded-md" onClick={() => onUpdateQuantity(item.id, 1)}>+</button>
                </div>
            </div>
        </div>
    </div>
  );
}
