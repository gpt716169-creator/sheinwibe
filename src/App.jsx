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
        
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

        const json = await res.json();
        
        if (json.status === 'success') {
            // !!! ВАЖНОЕ ИСПРАВЛЕНИЕ !!!
            // Если база вернула массив [user], берем user
            const finalUser = Array.isArray(json.data) ? json.data[0] : json.data;
            
            console.log("User Set to State:", finalUser);
            setDbUser(finalUser);
        }
    } catch (e) {
        console.error("Init Error:", e);
    }
  };

  // --- НОВАЯ ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ ДАННЫХ ---
  const handleRefreshData = () => {
      if (tgUser) {
          console.log("Refreshing user data...");
          // Вызываем инициализацию повторно, чтобы получить свежие points и total_spent
          initUserInDB(tgUser, null); 
      }
  };

  return (
    <div className="min-h-screen bg-luxury-gradient text-white overflow-hidden font-display">
      <div className="fixed inset-0 pointer-events-none bg-luxury-gradient z-0"></div>

      <div className="relative z-10 pb-24">
        {activeTab === 'home' && <Home user={tgUser} dbUser={dbUser} setActiveTab={setActiveTab} />}
        
        {/* ПЕРЕДАЕМ ФУНКЦИЮ onRefreshData В КОРЗИНУ */}
        {activeTab === 'cart' && (
            <Cart 
                user={tgUser} 
                dbUser={dbUser} 
                setActiveTab={setActiveTab} 
                onRefreshData={handleRefreshData} // <--- ВОТ ЭТО ВАЖНО
            />
        )}
        
        {activeTab === 'profile' && <Profile user={tgUser} dbUser={dbUser} />}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
