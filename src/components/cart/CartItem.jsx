import React from 'react';

// 1. КАРТА ЦВЕТОВ (Самые частые)
const COLOR_MAP = {
  'multi': 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
  'multicolor': 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
  'burgundy': '#800020', 'wine': '#722F37', 'maroon': '#800000',
  'navy': '#000080', 'royal': '#4169E1', 'teal': '#008080',
  'khaki': '#F0E68C', 'camel': '#C19A6B', 'beige': '#F5F5DC', 'cream': '#FFFDD0',
  'coffee': '#6F4E37', 'brown': '#A52A2A', 'apricot': '#FDD5B1',
  'gold': '#FFD700', 'silver': '#C0C0C0', 'white': '#FFFFFF', 'black': '#000000',
  'mustard': '#FFDB58', 'olive': '#808000', 'mint': '#98FF98',
  'lilac': '#C8A2C8', 'mauve': '#E0B0FF', 'purple': '#800080',
  'rose': '#FF007F', 'fuchsia': '#FF00FF', 'pink': '#FFC0CB',
  'grey': '#808080', 'charcoal': '#36454F'
};

// 2. ГЕНЕРАТОР (Если цвета нет в карте - придумываем его)
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

// 3. ФУНКЦИЯ СТИЛЯ
const getColorStyle = (rawColor) => {
  if (!rawColor) return { backgroundColor: '#333' }; // Дефолт
  
  const input = String(rawColor).toLowerCase().trim();

  // Если это HEX
  if (input.startsWith('#')) return { backgroundColor: input };

  // Ищем в карте (частичное совпадение)
  const keys = Object.keys(COLOR_MAP).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (input.includes(key)) {
       const val = COLOR_MAP[key];
       return key.includes('multi') ? { background: val } : { backgroundColor: val };
    }
  }

  // Если не нашли - генерируем!
  return { backgroundColor: stringToColor(input) };
};

export default function CartItem({ 
  item, isSelected, onToggleSelect, onEdit, onDelete, onUpdateQuantity 
}) {
  const inStock = item.is_in_stock !== false;
  const isWarning = (item.size === 'NOT_SELECTED' || !item.size) && inStock;

  return (
    <div className={`relative group p-2.5 rounded-2xl border backdrop-blur-sm flex gap-3 transition-all overflow-hidden 
      ${!inStock ? 'bg-black/40 border-white/5 opacity-60 grayscale-[0.5]' : 
        isWarning ? 'border-red-500/30 bg-red-900/10' : 'bg-[#1c2636] border-white/5'}`}
    >
        {/* Чекбокс */}
        <div className="flex items-center shrink-0">
             <button 
                onClick={() => inStock && onToggleSelect(item.id)}
                disabled={!inStock}
                className={`p-1 -ml-1 transition-transform ${!inStock ? 'cursor-not-allowed opacity-30' : 'active:scale-90'}`}
             >
                <span className={`material-symbols-outlined text-[26px] ${isSelected && inStock ? 'text-primary' : 'text-white/20'}`}>
                    {isSelected && inStock ? 'check_box' : 'check_box_outline_blank'}
                </span>
             </button>
        </div>

        {/* Картинка */}
        <div onClick={() => inStock && onEdit(item)} className="w-18 h-22 rounded-lg bg-cover bg-center shrink-0 bg-white/5 cursor-pointer border border-white/5 relative overflow-hidden" 
            style={{ backgroundImage: `url('${item.image_url}')`, width: '4.5rem', height: '6rem' }}>
             {!inStock && (
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                     <span className="material-symbols-outlined text-white/50 text-2xl">block</span>
                 </div>
             )}
        </div>

        {/* Контент */}
        <div className="flex flex-col justify-between flex-1 py-0.5 min-w-0">
            <div className="flex justify-between items-start gap-2">
                 <h3 onClick={() => inStock && onEdit(item)} className={`text-white text-xs leading-snug font-medium line-clamp-2 pr-6 ${!inStock && 'line-through text-white/50'}`}>
                    {item.product_name}
                 </h3>
                 <button className="absolute top-2 right-2 text-white/20 hover:text-red-400 p-1 z-10 active:scale-90 transition-transform" onClick={(e) => onDelete(e, item.id)}>
                    <span className="material-symbols-outlined text-lg">close</span>
                </button>
            </div>
            
            <div onClick={() => inStock && onEdit(item)} className={`mt-1.5 ${inStock ? 'cursor-pointer group/edit' : ''}`}>
                {!inStock ? (
                     <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-white/40">
                        Нет в наличии
                     </span>
                ) : isWarning ? (
                    <div className="flex items-center gap-1 text-red-400 text-[10px] font-bold uppercase animate-pulse">
                        <span className="material-symbols-outlined text-xs">warning</span>
                        Выбрать размер
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {/* Размер */}
                        <div className="flex items-center gap-1 bg-black/20 border border-white/10 px-1.5 py-0.5 rounded text-[10px] text-white/80 group-hover/edit:border-primary/50 transition-colors">
                            <span className="font-mono font-bold">{item.size}</span>
                            <span className="material-symbols-outlined text-[10px] opacity-50">expand_more</span>
                        </div>
                        {/* Цвет (УМНЫЙ) */}
                        {item.color && (
                            <div className="flex items-center gap-1 bg-black/20 border border-white/10 px-1.5 py-0.5 rounded text-[10px] text-white/60">
                                <span 
                                    className="w-3 h-3 rounded-full shadow-sm ring-1 ring-white/10" 
                                    style={getColorStyle(item.color)}
                                ></span>
                                <span className="max-w-[50px] truncate">{item.color}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {inStock && (
                <div className="flex justify-between items-end mt-2">
                    <span className="text-primary font-bold text-sm whitespace-nowrap mr-2">
                        {(item.final_price_rub * item.quantity).toLocaleString()} ₽
                    </span>
                    <div className="flex items-center gap-1 bg-[#151c28] rounded-lg p-0.5 border border-white/10 shrink-0 shadow-sm">
                        <button className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white active:bg-white/10 rounded-md transition-colors" onClick={() => onUpdateQuantity(item.id, -1)}>−</button>
                        <span className="text-xs w-4 text-center text-white font-bold select-none">{item.quantity}</span>
                        <button className="w-7 h-7 flex items-center justify-center text-white/50 hover:text-white active:bg-white/10 rounded-md transition-colors" onClick={() => onUpdateQuantity(item.id, 1)}>+</button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
