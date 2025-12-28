// src/utils/colorUtils.js

// 1. СЛОВАРЬ ЦВЕТОВ SHEIN
const COLOR_MAP = {
  // --- СПЕЦИАЛЬНЫЕ ---
  'multi': 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
  'multicolor': 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
  'rainbow': 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',

  // --- КРАСНЫЕ / РОЗОВЫЕ ---
  'burgundy': '#800020',
  'wine': '#722F37',
  'wine red': '#722F37',
  'maroon': '#800000',
  'red': '#FF0000',
  'rose': '#FF007F',
  'rose gold': '#B76E79',
  'fuchsia': '#FF00FF',
  'hot pink': '#FF69B4',
  'pink': '#FFC0CB',
  'baby pink': '#F4C2C2',
  'coral': '#FF7F50',
  'rust': '#B7410E',

  // --- СИНИЕ / ГОЛУБЫЕ ---
  'navy': '#000080',
  'navy blue': '#000080',
  'royal': '#4169E1',
  'royal blue': '#4169E1',
  'blue': '#0000FF',
  'teal': '#008080',
  'cyan': '#00FFFF',
  'sky blue': '#87CEEB',
  'baby blue': '#89CFF0',
  'turquoise': '#40E0D0',
  'mint': '#98FF98',

  // --- ЗЕЛЕНЫЕ ---
  'green': '#008000',
  'lime': '#00FF00',
  'olive': '#808000',
  'army green': '#4B5320',
  'khaki': '#C3B091', // Shein Khaki часто ближе к бежево-песочному
  'sage': '#BCB88A',

  // --- КОРИЧНЕВЫЕ / БЕЖЕВЫЕ ---
  'brown': '#A52A2A',
  'coffee': '#6F4E37',
  'camel': '#C19A6B',
  'beige': '#F5F5DC',
  'cream': '#FFFDD0',
  'apricot': '#FDD5B1',
  'tan': '#D2B48C',
  'nude': '#E3BC9A',
  'champagne': '#F7E7CE',

  // --- ЖЕЛТЫЕ / ОРАНЖЕВЫЕ ---
  'yellow': '#FFFF00',
  'mustard': '#FFDB58',
  'gold': '#FFD700',
  'orange': '#FFA500',

  // --- ФИОЛЕТОВЫЕ ---
  'purple': '#800080',
  'violet': '#EE82EE',
  'lilac': '#C8A2C8',
  'mauve': '#E0B0FF',
  'lavender': '#E6E6FA',

  // --- МОНОХРОМ ---
  'black': '#000000',
  'white': '#FFFFFF',
  'grey': '#808080',
  'gray': '#808080',
  'silver': '#C0C0C0',
  'charcoal': '#36454F'
};

// 2. ГЕНЕРАТОР ЦВЕТА (ФОЛБЕК)
// Превращает любую строку в HEX-цвет. Гарантирует, что прозрачности не будет.
const generateColorFromString = (str) => {
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

// 3. ГЛАВНАЯ ФУНКЦИЯ (Экспортируем её)
export const getColorStyle = (rawColor) => {
  if (!rawColor || typeof rawColor !== 'string') return { backgroundColor: '#333' };
  
  const input = rawColor.toLowerCase().trim();

  // 1. Если это HEX код
  if (input.startsWith('#')) return { backgroundColor: input };

  // 2. Ищем в нашей карте (точное или частичное совпадение)
  // Сортируем ключи по длине (сначала ищем "navy blue", потом "blue")
  const mapKeys = Object.keys(COLOR_MAP).sort((a, b) => b.length - a.length);
  
  for (const key of mapKeys) {
    if (input.includes(key)) {
       const val = COLOR_MAP[key];
       // Если это градиент, используем background, иначе backgroundColor
       return val.includes('gradient') ? { background: val } : { backgroundColor: val };
    }
  }

  // 3. Если это стандартный HTML цвет (red, blue), браузер поймет сам
  const s = new Option().style;
  s.color = input;
  if (s.color !== '') return { backgroundColor: input };

  // 4. Если ничего не помогло — генерируем уникальный цвет
  return { backgroundColor: generateColorFromString(input) };
};
