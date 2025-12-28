import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// --- 1. КАРТА ЦВЕТОВ ---
const SHEIN_COLOR_MAP = {
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
  'grey': '#808080', 'gray': '#808080', 'charcoal': '#36454F'
};

// --- 2. ГЕНЕРАТОР ЦВЕТА (МАТЕМАТИЧЕСКИЙ ФОЛБЕК) ---
// Гарантирует, что кружок никогда не будет прозрачным
const stringToColor = (str) => {
  if (!str) return '#333333';
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

// --- 3. ГЛАВНАЯ ФУНКЦИЯ СТИЛЕЙ ---
const getColorStyle = (rawColor) => {
  if (!rawColor || typeof rawColor !== 'string') return { backgroundColor: '#333' };
  
  const input = rawColor.toLowerCase().trim();

  // А) Если это HEX
  if (input.startsWith('#')) return { backgroundColor: input };

  // Б) Ищем в карте (включая частичное совпадение)
  const mapKeys = Object.keys(SHEIN_COLOR_MAP).sort((a, b) => b.length - a.length);
  for (const key of mapKeys) {
    if (input.includes(key)) {
       const val = SHEIN_COLOR_MAP[key];
       return key.includes('multi') ? { background: val } : { backgroundColor: val };
    }
  }

  // В) Если браузер понимает цвет сам (red, blue)
  const s = new Option().style;
  s.color = input;
  if (s.color !== '') return { backgroundColor: input };

  // Г) Генерируем цвет, чтобы не был прозрачным
  return { backgroundColor: stringToColor(input) };
};

export default function EditItemModal({ item, onClose, onSave, saving }) {
  const [tempSize, setTempSize] = useState(item?.size === 'NOT_SELECTED' ? null : item?.size);
  const [tempColor, setTempColor] = useState(item?.color);

  // Блокируем скролл боди
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

  // Парсинг опций размеров
  let sizeOptions = [];
  try {
    sizeOptions = typeof item.size_options === 'string' 
      ? JSON.parse(item.size_options) 
      : (item.size_options || []);
  } catch (e) {}

  // Проверка для цвета галочки (черная на светлом, белая на темном)
  const isLightColor = ['white', 'beige', 'cream', 'yellow', 'apricot', 'silver', 'gold'].some(c => (item.color || '').toLowerCase().includes(c));

  // Рендерим через Portal прямо в body
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
                <h4 className="text-[10px] uppercase tracking-wider text-white/50 font-bold mb-3">
                    Цвет: <span className="text-white normal-case font-normal ml-1">{item.color}</span>
                </h4>
                <div 
                  onClick={() => setTempColor(item.color)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-95 ring-1 ring-white/10 ${tempColor === item.color ? 'ring-2 ring-primary ring-offset-2 ring-offset-[#151c28]' : ''}`} 
                  // ПРИМЕНЯЕМ УМНЫЙ СТИЛЬ
                  style={getColorStyle(item.color)}
                >
                  {tempColor === item.color && (
                    <span className={`material-symbols-outlined text-lg font-bold drop-shadow-sm ${isLightColor ? 'text-black' : 'text-white'}`}>
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
