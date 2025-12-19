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
      
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
      
      const user = tg.initDataUnsafe?.user;
      const startParam = tg.initDataUnsafe?.start_param;

      if (user) {
        setTgUser(user);
        initUserInDB(user, startParam);
      } else {
         // Для тестов в браузере (если нужно)
         // setTgUser({ id: 1332986231, first_name: "Test" });
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

  // --- ФУНКЦИЯ С ДЕБАГОМ ---
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
                ref_code: refCode 
            })
        });
        
        const json = await res.json();

        // 🚨 ДЕБАГ: ПОКАЗЫВАЕМ СТРУКТУРУ ОТВЕТА НА ЭКРАНЕ
        if (window.Telegram?.WebApp) {
             window.Telegram.WebApp.showAlert("RAW DB RESPONSE:\n" + JSON.stringify(json, null, 2).substring(0, 500));
        }

        // Умный парсинг (обрабатывает и массивы, и объекты)
        let finalUser = null;

        if (json.data) {
             // Если пришло { status: "success", data: [...] }
             finalUser = Array.isArray(json.data) ? json.data[0] : json.data;
        } else if (Array.isArray(json)) {
             // Если пришло просто [...]
             finalUser = json[0];
        } else {
             // Если пришло просто {...}
             finalUser = json;
        }
        
        if (finalUser) {
            console.log("User Set:", finalUser);
            setDbUser(finalUser);
        }

    } catch (e) {
        console.error("Init Error:", e);
        if (window.Telegram?.WebApp) window.Telegram.WebApp.showAlert("Fetch Error: " + e.message);
    }
  };

  const handleRefreshData = () => {
      if (tgUser) {
          initUserInDB(tgUser, null); 
      }
  };

  return (
    <div className="min-h-screen bg-luxury-gradient text-white overflow-hidden font-display">
      <div className="fixed inset-0 pointer-events-none bg-luxury-gradient z-0"></div>

      <div className="relative z-10 pb-24">
        {activeTab === 'home' && <Home user={tgUser} dbUser={dbUser} setActiveTab={setActiveTab} />}
        
        {activeTab === 'cart' && (
            <Cart 
                user={tgUser} 
                dbUser={dbUser} 
                setActiveTab={setActiveTab} 
                onRefreshData={handleRefreshData} 
            />
        )}
        
        {activeTab === 'profile' && <Profile user={tgUser} dbUser={dbUser} />}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App; // <--- ВОТ ЭТА СТРОЧКА БЫЛА ПОТЕРЯНА
