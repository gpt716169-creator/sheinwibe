import { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Profile from './pages/Profile';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [tgUser, setTgUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);

  // --- 1. ПРОКРУТКА НАВЕРХ ПРИ СМЕНЕ ВКЛАДКИ ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // --- 2. ОБРАБОТКА ВОЗВРАТА ПОСЛЕ ОПЛАТЫ ---
  useEffect(() => {
      const path = window.location.pathname;

      if (path === '/success' || path === '/success/') {
          window.Telegram?.WebApp?.showAlert("Оплата прошла успешно! Ваш заказ принят в работу.");
          setActiveTab('profile');
          window.history.replaceState(null, '', '/'); // Чистим URL
      } 
      else if (path === '/fail' || path === '/fail/') {
          window.Telegram?.WebApp?.showAlert("Оплата не прошла или была отменена.");
          setActiveTab('cart'); 
          window.history.replaceState(null, '', '/');
      }
  }, []);

  // --- 3. ИНИЦИАЛИЗАЦИЯ TELEGRAM WEBAPP ---
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation(); // Подтверждение закрытия, чтобы случайно не смахнуть
      
      const user = tg.initDataUnsafe?.user;
      const startParam = tg.initDataUnsafe?.start_param;

      // 🔥 ВРЕМЕННАЯ ДИАГНОСТИКА (Удалишь потом)
      // Если мы перешли по ссылке ?startapp=ref_123, здесь должно всплыть окно.
      if (startParam) {
          tg.showAlert(`Код приглашения распознан: ${startParam}`);
      }

      if (user) {
        setTgUser(user);
        // Запускаем регистрацию в базе
        initUserInDB(user, startParam);
      }

      // Хак для клавиатуры (чтобы не ломала верстку на iOS/Android)
      const handleFocus = () => document.body.classList.add('keyboard-open');
      const handleBlur = () => document.body.classList.remove('keyboard-open');
      const inputs = document.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.addEventListener('focus', handleFocus);
        input.addEventListener('blur', handleBlur);
      });
    }
  }, []);

  // --- 4. РЕГИСТРАЦИЯ/ОБНОВЛЕНИЕ ЮЗЕРА ЧЕРЕЗ ВЕБХУК ---
  const initUserInDB = async (userData, refCode) => {
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
                is_premium: userData.is_premium,
                // Передаем реферальный код, если он есть
                ref_code: refCode 
            })
        });
        
        if (!res.ok) throw new Error('Ошибка инициализации');

        const json = await res.json();

        // Обработка разных форматов ответа от n8n
        let finalUser = null;
        if (json.data) {
             finalUser = Array.isArray(json.data) ? json.data[0] : json.data;
        } else if (Array.isArray(json)) {
             finalUser = json[0];
        } else {
             finalUser = json;
        }
        
        if (finalUser) {
            setDbUser(finalUser);
        }
    } catch (e) {
        console.error("Init User Error:", e);
    }
  };

  // Функция для обновления данных (например, после покупки)
  const handleRefreshData = () => {
      if (tgUser) {
          initUserInDB(tgUser, null); 
      }
  };

  return (
    <div className="min-h-screen bg-luxury-gradient text-white overflow-hidden font-display">
      {/* Фон */}
      <div className="fixed inset-0 pointer-events-none bg-luxury-gradient z-0"></div>

      <div className="relative z-10 pb-24">
        {activeTab === 'home' && (
            <Home user={tgUser} dbUser={dbUser} setActiveTab={setActiveTab} />
        )}
        
        {activeTab === 'cart' && (
            <Cart 
                user={tgUser} 
                dbUser={dbUser} 
                setActiveTab={setActiveTab} 
                onRefreshData={handleRefreshData} 
            />
        )}
        
        {activeTab === 'profile' && (
            <Profile user={tgUser} dbUser={dbUser} />
        )}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
