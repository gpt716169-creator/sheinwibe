import { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Profile from './pages/Profile';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [tgUser, setTgUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);

  useEffect(() => {
    // Безопасная проверка наличия Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Сообщаем Телеграму, что приложение готово
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
      
      // Получаем РЕАЛЬНЫЕ данные. Никаких заглушек.
      const user = tg.initDataUnsafe?.user;

      if (user) {
        setTgUser(user);
        // Инициализируем в базе
        initUserInDB(user);
      } else {
        // Если открыто не в Телеграме или данные не пришли
        console.warn("Нет данных пользователя Telegram. Webhook не будет отправлен.");
      }

      // Хак для клавиатуры
      const handleFocus = () => document.body.classList.add('keyboard-open');
      const handleBlur = () => document.body.classList.remove('keyboard-open');
      const inputs = document.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.addEventListener('focus', handleFocus);
        input.addEventListener('blur', handleBlur);
      });
    }
  }, []);

  const initUserInDB = async (userData) => {
    // Проверка на всякий случай
    if (!userData || !userData.id) return;

    try {
        const res = await fetch('https://proshein.com/webhook/init-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tg_id: userData.id,
                first_name: userData.first_name,
                username: userData.username,
                language_code: userData.language_code,
                is_premium: userData.is_premium
            })
        });
        
        if (!res.ok) {
            throw new Error(`HTTP Error: ${res.status}`);
        }

        const json = await res.json();
        
        if (json.status === 'success') {
            console.log("User initialized:", json.data);
            setDbUser(json.data);
        } else {
            console.error("Init Error:", json);
        }
    } catch (e) {
        console.error("Ошибка авторизации (Network/CORS):", e);
        // Можно включить алерт для отладки, если совсем тишина
        // window.Telegram?.WebApp?.showAlert(`Ошибка init-user: ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-gradient text-white overflow-hidden font-display">
      <div className="fixed inset-0 pointer-events-none bg-luxury-gradient z-0"></div>

      <div className="relative z-10 pb-24">
        {activeTab === 'home' && <Home user={tgUser} dbUser={dbUser} setActiveTab={setActiveTab} />}
        {activeTab === 'cart' && <Cart user={tgUser} dbUser={dbUser} setActiveTab={setActiveTab} />}
        {activeTab === 'profile' && <Profile user={tgUser} dbUser={dbUser} />}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
