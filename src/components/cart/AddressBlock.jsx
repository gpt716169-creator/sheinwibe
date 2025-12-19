import React from 'react';

export default function AddressBlock({ 
    deliveryMethod, 
    setDeliveryMethod, 
    addresses, 
    selectedAddress, 
    setSelectedAddress, 
    pvzQuery, 
    setPvzQuery, 
    pvzResults, 
    selectedPvz, 
    setSelectedPvz,
    loadingPvz,
    onOpenProfile
}) {

  // Фильтруем адреса: если в тексте адреса есть "5Post", скрываем его из списка для Курьера
  const filteredAddresses = addresses.filter(addr => {
      const fullString = (addr.street + addr.city + addr.region).toLowerCase();
      return !fullString.includes('5post');
  });

  return (
    <div className="space-y-4">
        {/* Переключатель */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
           <button 
               onClick={() => setDeliveryMethod('ПВЗ (5Post)')}
               className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${deliveryMethod === 'ПВЗ (5Post)' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
           >
               <span className="material-symbols-outlined text-base">package_2</span> 5Post
           </button>
           <button 
               onClick={() => setDeliveryMethod('Почта РФ')}
               className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${deliveryMethod === 'Почта РФ' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
           >
               <span className="material-symbols-outlined text-base">local_shipping</span> Почта / Курьер
           </button>
        </div>

        {/* 5POST */}
        {deliveryMethod === 'ПВЗ (5Post)' && (
            <div className="animate-fade-in space-y-3">
                {!selectedPvz ? (
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-3.5 text-white/40">search</span>
                        <input 
                           className="custom-input w-full rounded-xl pl-10 pr-4 py-3 text-sm bg-[#1c2636] border border-white/10 text-white focus:border-primary outline-none" 
                           placeholder="Город, улица..."
                           value={pvzQuery}
                           onChange={(e) => setPvzQuery(e.target.value)}
                        />
                        {loadingPvz && <div className="absolute right-3 top-3.5"><span className="material-symbols-outlined animate-spin text-primary text-sm">progress_activity</span></div>}
                        
                        {/* Результаты поиска */}
                        {pvzResults.length > 0 && (
                            <div className="mt-2 bg-[#1c2636] border border-white/10 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                                {pvzResults.map(pvz => (
                                    <div 
                                        key={pvz.id} 
                                        onClick={() => setSelectedPvz(pvz)} 
                                        className="p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer active:bg-white/10 last:border-0"
                                    >
                                        <p className="text-white text-sm font-bold leading-tight">{pvz.city}, {pvz.address}</p>
                                        <p className="text-white/50 text-[10px] mt-1">{pvz.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {pvzResults.length === 0 && pvzQuery.length > 2 && !loadingPvz && (
                            <div className="text-center text-white/30 text-xs mt-2 p-2">Ничего не найдено</div>
                        )}
                    </div>
                ) : (
                    <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl flex justify-between items-center gap-3">
                        <div className="min-w-0">
                            <p className="text-primary text-[10px] font-bold uppercase mb-1">Выбран пункт:</p>
                            <p className="text-white text-sm font-medium leading-snug truncate">{selectedPvz.city}, {selectedPvz.address}</p>
                            <p className="text-white/40 text-[10px] truncate">{selectedPvz.name}</p>
                        </div>
                        <button onClick={() => { setSelectedPvz(null); setPvzQuery(''); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 shrink-0">
                            <span className="material-symbols-outlined text-white/70 text-sm">close</span>
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* ПОЧТА РФ */}
        {deliveryMethod === 'Почта РФ' && (
            <div className="animate-fade-in space-y-3">
                {filteredAddresses.length > 0 ? (
                    <div className="space-y-2">
                        {filteredAddresses.map(addr => (
                            <div 
                               key={addr.id} 
                               onClick={() => setSelectedAddress(addr)}
                               className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center gap-3 ${selectedAddress?.id === addr.id ? 'bg-primary/10 border-primary shadow-[0_0_10px_rgba(19,236,91,0.1)]' : 'bg-[#1c2636] border-white/10 hover:border-white/20'}`}
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-white font-medium truncate">{addr.city}, {addr.street}, {addr.house}</p>
                                    <p className="text-[10px] text-white/50 truncate">{addr.full_name || 'Без имени'}</p>
                                </div>
                                {selectedAddress?.id === addr.id && <span className="material-symbols-outlined text-primary shrink-0">check_circle</span>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 border border-dashed border-white/10 rounded-xl bg-white/5">
                        <p className="text-white/50 text-xs mb-3">Нет подходящих адресов</p>
                        <button onClick={onOpenProfile} className="bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-white/20">
                            + Добавить в Профиле
                        </button>
                    </div>
                )}
            </div>
        )}
    </div>
  );
}
