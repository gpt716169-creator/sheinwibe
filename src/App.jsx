import { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Profile from './pages/Profile';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  // tgUser - данные от Телеграма (ID, Username)
  const [tgUser, setTgUser] = useState(null);
  // dbUser - данные из нашей Базы (Баллы, Статус, Адрес)
  const [dbUser, setDbUser] = useState(null);

  useEffect(() => {
    // Безопасное получение объекта Telegram WebApp
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      tg.expand();
      tg.enableClosingConfirmation();
      
      // Пытаемся получить данные пользователя
      const user = tg.initDataUnsafe?.user;
      
      if (user) {
          setTgUser(user);
          // Инициализируем пользователя в БД (получаем баллы и статус)
          initUserInDB(user);
      } else {
          // Логика для разработки в браузере (чтобы не было белого экрана)
          // В продакшене лучше закомментировать или оставить как fallback для тестов
          const devUser = { 
            id: 1332986231, 
            first_name: "Konstantin (Dev)", 
            username: "browser_test" 
          };
          console.log("App: Запущен вне Telegram, использую тестового юзера");
          setTgUser(devUser);
          initUserInDB(devUser);
      }

      // Хак для клавиатуры на Android (чтобы не перекрывала инпуты)
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
    try {
        const res = await fetch('https://proshein.com/webhook/init-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tg_id: userData.id,
                first_name: userData.first_name,
                username: userData.username
            })
        });
        const json = await res.json();
        if (json.status === 'success') {
            setDbUser(json.data);
        }
    } catch (e) {
        console.error("App: Ошибка инициализации юзера:", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden font-display selection:bg-primary/30">
      {/* Фоновый градиент */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-[#0f172a] to-[#020617] z-0"></div>

      <div className="relative z-10 pb-24 max-w-md mx-auto h-screen flex flex-col">
        {/* Рендеринг активной страницы */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
            {activeTab === 'home' && <Home user={tgUser} dbUser={dbUser} setActiveTab={setActiveTab} />}
            {activeTab === 'cart' && <Cart user={tgUser} dbUser={dbUser} setActiveTab={setActiveTab} />}
            {activeTab === 'profile' && <Profile user={tgUser} dbUser={dbUser} />}
        </div>
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;