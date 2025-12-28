export const getColorStyle = (colorName) => {
    if (!colorName) return '#ccc'; // Fallback

    const lower = String(colorName).toLowerCase().replace('-', ' ').trim();

    const colorMap = {
        'burgundy': '#800020',
        'wine': '#722F37',
        'maroon': '#800000',
        'navy blue': '#000080',
        'navy': '#000080',
        'beige': '#F5F5DC',
        'khaki': '#F0E68C', // Или #C3B091
        'camel': '#C19A6B',
        'coffee': '#6F4E37',
        'brown': '#A52A2A',
        'teal': '#008080',
        'grey': '#808080',
        'gray': '#808080',
        'off white': '#FAF9F6',
        'white': '#FFFFFF',
        'black': '#000000',
        'cream': '#FFFDD0',
        'mustard': '#FFDB58',
        'olive': '#808000',
        'mint': '#3EB489',
        'coral': '#FF7F50',
        'apricot': '#FBCEB1',
        'lilac': '#C8A2C8',
        'lavender': '#E6E6FA',
        'baby blue': '#89CFF0',
        'royal blue': '#4169E1',
        'denim': '#1560BD',
        'charcoal': '#36454F',
        'champagne': '#F7E7CE',
        'ivory': '#FFFFF0',
        'mauve': '#E0B0FF',
        'peach': '#FFE5B4',
        'salmon': '#FA8072',
        'tan': '#D2B48C',
        'taupe': '#483C32',
        'turquoise': '#40E0D0',
        'gold': '#FFD700',
        'silver': '#C0C0C0',
        'rose gold': '#B76E79',
        // Добавляем специфичные для Shein варианты
        'multicolor': 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
        'multi': 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)'
    };

    // 1. Если есть в мапе - возвращаем hex
    if (colorMap[lower]) {
        return colorMap[lower];
    }

    // 2. Проверка на вхождение (для сложных названий типа "Deep Burgundy")
    const keys = Object.keys(colorMap);
    for (const key of keys) {
        if (lower.includes(key)) {
            return colorMap[key];
        }
    }

    // 3. По умолчанию возвращаем как есть (на случай если это валидный цвет типа "red" или hex)
    return colorName;
};
