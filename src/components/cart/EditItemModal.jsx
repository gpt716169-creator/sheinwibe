import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// --- 1. КАРТА ЦВЕТОВ (РАСШИРЕННАЯ) ---
// Все ключи пишем в нижнем регистре!
const SHEIN_COLOR_MAP = {
  // Красные / Розовые
  'burgundy': '#800020',
  'wine': '#722F37',
  'red': '#FF0000',
  'rose': '#FF007F',
  'fuchsia': '#FF00FF',
  'coral': '#FF7F50',
  'pink': '#FFC0CB',
  'hot pink': '#FF69B4',
  
  // Синие / Голубые
  'navy': '#000080',
  'navy blue': '#000080',
  'blue': '#0000FF',
  'royal blue': '#4169E1',
  'baby blue': '#89CFF0',
  'teal': '#008080',
  'cyan': '#00FFFF',
  'sky blue': '#87CEEB',

  // Зеленые
  'green': '#008000',
  'lime': '#00FF00',
  'olive': '#808000',
  'mint': '#98FF98',
  'army green': '#4B5320',
  'khaki': '#F0E68C',

  // Коричневые / Бежевые
  'brown': '#A52A2A',
  'coffee': '#6F4E37',
  'camel': '#C19A6B',
  'beige': '#F5F5DC',
  'cream': '#FFFDD0',
  'apricot': '#FDD5B1',
  'tan': '#D2B48C',

  // Желтые / Оранжевые
  'yellow': '#FFFF00',
  'mustard': '#FFDB58',
  'gold': '#FFD700',
  'orange': '#FFA500',
  'rust': '#B7410E',

  // Фиолетовые
  'purple': '#800080',
  'violet': '#EE82EE',
  'lilac': '#C8A2C8',
  'mauve': '#E0B0FF',

  // Монохром / Металл
  'black': '#000000',
  'white': '#FFFFFF',
  'grey': '#808080',
  'gray': '#808080',
  'silver': '#C0C0C0',
  'bronze': '#CD7F32',
  'champagne': '#F7E7CE',
};

// Хелпер
const getColorStyle = (rawColor) => {
  if (!rawColor) return { backgroundColor: '#333' }; // Если цвета нет — темно-серый
  
  // Нормализация: убираем пробелы по краям, приводим к нижнему регистру
  const key = rawColor.toString().toLowerCase().trim();

  // 1. Мультиколор
  if (key.includes('multi') || key.includes('mix')) {
    return { background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)' };
  }

  // 2. Поиск в карте
  if (SHEIN_COLOR_MAP[key]) {
    return { backgroundColor: SHEIN_COLOR_MAP[key] };
  }

  // 3. Если цвет "White"
  if (key === 'white') {
    return { backgroundColor: '#ffffff', border: '1px solid #ccc' };
  }

  // 4. Пробуем использовать как есть (вдруг это валидный цвет типа 'red')
  // Если браузер не поймет цвет, он оставит прозрачный, поэтому добавим серый фолбек
  return { backgroundColor: rawColor };
};

export default function EditItemModal({ item, onClose, onSave, saving }) {
  const [tempSize, setTempSize] = useState(item?.size === 'NOT_SELECTED' ? null : item?.size);
  const [tempColor, setTempColor] = useState(item?.color);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => document.body.style.overflow = 'auto';
  }, []);

  if (!item) return null;

  const handleSave = () => {
    if (!tempSize) {
       window.Telegram?.WebApp?.showAlert('Выберите размер!');
       return;
    }
    onSave(item.id, tempSize, tempColor);
  };

  let sizeOptions = [];
  try {
    sizeOptions = typeof item.size_options === 'string' 
      ? JSON.parse(item.size_options) 
      : (item.size_options || []);
  } catch (e) {}

  return createPortal(
    <div 
        className="fixed inset-0 z-[99999] flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div 
          className="bg-[#151c28] w-full max-w-sm rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl relative mt-safe-top" 
          onClick={e => e.stopPropagation()}
      >
        
        {/* Хедер */}
        <div className="flex gap-4 p-5 border-b border-white/5 bg-[#1a2332]">
          <div className="w-16 h-20 rounded-lg bg-cover bg-center shrink-0 bg-white/5 border border-white/10" style={{backgroundImage: `url('${item.image_url}')`}}></div>
          <div className="flex flex-col justify-center pr-8 min-w-0">
            <h3 className="text-white font-bold text-sm leading-tight truncate">{item.product_name}</h3>
            <p className="text-white/40 text-xs mt-1">Параметры товара</p>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white p-2">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Контент */}
        <div className="p-5 space-y-5">
          {/* Размер */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Размер</h4>
              <span className="text-primary text-[10px] font-bold">{tempSize || 'Не выбран'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.length === 0 ? <p className="text-white/30 text-xs">Нет вариантов</p> : 
               sizeOptions.map((opt, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setTempSize(opt.name)} 
                  className={`h-10 px-4 min-w-[45px] rounded-xl border text-xs font-bold transition-all ${tempSize === opt.name ? 'bg-white text-black border-white shadow-lg transform scale-105' : 'bg-white/5 border-white/10 text-white/70'}`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Цвет */}
          {item.color && (
             <div>
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Цвет</h4>
                    {/* 👇 ДЕБАГ: Выводим название цвета текстом, чтобы проверить, что приходит */}
                    <span className="text-white/70 text-[10px] bg-white/10 px-2 py-0.5 rounded">
                        Пришло: {item.color}
                    </span>
                </div>

                <div 
                  onClick={() => setTempColor(item.color)}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${tempColor === item.color ? 'border-primary shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border-white/10'}`} 
                  // Применяем стиль
                  style={getColorStyle(item.color)}
                >
                  {tempColor === item.color && (
                    <span className={`material-symbols-outlined text-lg font-bold drop-shadow-md ${
                        ['white', 'beige', 'cream', 'apricot', 'silver', 'yellow'].includes((item.color || '').toLowerCase()) 
                        ? 'text-black' 
                        : 'text-white'
                    }`}>
                        check
                    </span>
                  )}
                </div>
             </div>
          )}
        </div>

        {/* Футер */}
        <div className="p-5 pt-2 bg-[#151c28]">
          <button onClick={handleSave} disabled={saving} className="w-full h-12 bg-primary text-[#102216] font-bold rounded-xl text-sm uppercase shadow-lg active:scale-95 transition-transform">
            {saving ? 'Сохранение...' : 'Применить'}
          </button>
        </div>
      </div>
    </div>,
    document.body 
  );
}
