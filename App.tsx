
import React, { useState, useCallback, useEffect } from 'react';
import { SlotState, MoodResult } from './types';
import { TEAS, ACTIVITIES, PERFUMES, FLOWERS } from './constants';
import SlotReel from './components/SlotReel';
import { getLocalCommentary } from './services/commentaryData';
import { getRealtimeShoppingItems, ShoppingItem } from './services/gemini';
import { translations, Language } from './translations';

const USAGE_LIMIT = 5;

const App: React.FC = () => {
  const [slotState, setSlotState] = useState<SlotState>(SlotState.IDLE);
  const [indices, setIndices] = useState<number[]>([0, 0, 0, 0]);
  const [result, setResult] = useState<MoodResult | null>(null);
  const [shoppingItem, setShoppingItem] = useState<ShoppingItem | null>(null);
  const [isLoadingItem, setIsLoadingItem] = useState(false);
  const [finishedCount, setFinishedCount] = useState(0);

  // Usage Guard State
  const [usageCount, setUsageCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);

  // i18n State
  const [lang, setLang] = useState<Language>('KR');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storedDate = localStorage.getItem('ritual_usage_date');
    const storedCount = localStorage.getItem('ritual_usage_count');

    if (storedDate !== today) {
      localStorage.setItem('ritual_usage_date', today);
      localStorage.setItem('ritual_usage_count', '0');
      setUsageCount(0);
    } else {
      const count = parseInt(storedCount || '0', 10);
      setUsageCount(count);

      const adminStatus = localStorage.getItem('ritual_admin_mode') === 'true';
      setIsAdmin(adminStatus);

      const storedLang = localStorage.getItem('ritual_lang') as Language;
      if (storedLang) setLang(storedLang);

      if (!adminStatus && count >= USAGE_LIMIT) setIsLimitReached(true);
    }
  }, []);

  const changeLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('ritual_lang', newLang);
  };

  const toggleAdmin = () => {
    const nextClicks = adminClicks + 1;
    if (nextClicks >= 7) {
      const nextAdmin = !isAdmin;
      setIsAdmin(nextAdmin);
      localStorage.setItem('ritual_admin_mode', nextAdmin.toString());
      setAdminClicks(0);
      if (nextAdmin) setIsLimitReached(false);
      alert(nextAdmin ? translations[lang].admin_mode_on : translations[lang].admin_mode_off);
    } else {
      setAdminClicks(nextClicks);
    }
  };

  const spin = useCallback(() => {
    if (slotState === SlotState.SPINNING) return;
    if (!isAdmin && isLimitReached) return;

    setIndices([
      Math.floor(Math.random() * TEAS.length),
      Math.floor(Math.random() * ACTIVITIES.length),
      Math.floor(Math.random() * PERFUMES.length),
      Math.floor(Math.random() * FLOWERS.length),
    ]);
    setFinishedCount(0);
    setResult(null);
    setShoppingItem(null);
    setSlotState(SlotState.SPINNING);
  }, [slotState, isLimitReached]);

  const handleReelFinish = useCallback(async () => {
    setFinishedCount(prev => {
      const next = prev + 1;
      if (next === 4) {
        const t = TEAS[indices[0]];
        const a = ACTIVITIES[indices[1]];
        const p = PERFUMES[indices[2]];
        const f = FLOWERS[indices[3]];

        const commentary = getLocalCommentary(t.id, a.id, p.id, f.id, lang);
        const score = 80 + Math.floor(Math.random() * 20);

        setResult({ tea: t, activity: a, perfume: p, flower: f, score, aiCommentary: commentary });
        setSlotState(SlotState.FINISHED);

        // Update Usage
        if (!isAdmin) {
          const newCount = usageCount + 1;
          setUsageCount(newCount);
          localStorage.setItem('ritual_usage_count', newCount.toString());
          if (newCount >= USAGE_LIMIT) setIsLimitReached(true);
        }

        // AI 쇼핑 추천 엔진 가동
        setIsLoadingItem(true);
        // Pass language to Gemini service
        getRealtimeShoppingItems(t.name, a.name, p.name, f.name, lang).then(item => {
          setShoppingItem(item);
          setIsLoadingItem(false);
        });
      }
      return next;
    });
  }, [indices, usageCount]);

  return (
    <div className="max-w-screen-md mx-auto min-h-screen bg-[#FDFCFB] text-[#1E293B] pb-32 font-sans selection:bg-pink-100">
      <header className="pt-24 px-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-pink-50/50 to-transparent -z-10" />

        <div
          onClick={toggleAdmin}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-pink-100 rounded-full shadow-sm mb-8 animate-float cursor-pointer select-none"
        >
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAdmin ? 'bg-indigo-400' : 'bg-pink-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isAdmin ? 'bg-indigo-500' : 'bg-pink-500'}`}></span>
          </span>
          <span className={`text-[10px] font-bold ${isAdmin ? 'text-indigo-500' : 'text-[#FF7EAD]'} tracking-[0.2em] uppercase`}>
            {isAdmin ? 'Admin Mode (Unlimited)' : 'Private Ritual v3.0'}
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-serif font-semibold leading-[1.1] mb-6 tracking-tight text-slate-800">
          {translations[lang].title_line1}<br />
          <span className="gradient-text">{translations[lang].title_line2}</span>
        </h1>

        <div className="flex flex-col items-center justify-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center gap-2 mb-2">
            {(['KR', 'EN', 'JA'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${lang === l
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-white/50 text-slate-400 hover:bg-white'
                  }`}
              >
                {l === 'KR' ? '한국어' : l === 'EN' ? 'ENGLISH' : '日本語'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 opacity-40">
            <div className="h-px w-8 bg-slate-300"></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">{translations[lang].subtitle}</p>
            <div className="h-px w-8 bg-slate-300"></div>
          </div>
          <p className="text-[10px] font-black text-pink-300 tracking-[0.1em]">{translations[lang].energy}: {Math.max(0, USAGE_LIMIT - usageCount)} / {USAGE_LIMIT}</p>
        </div>
      </header>

      <main className="px-6 mt-12">
        <section className="soft-card p-10 mb-16 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-100/30 rounded-full blur-3xl group-hover:bg-pink-200/40 transition-colors duration-1000"></div>

          {isLimitReached && (
            <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/40 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
              <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
              </div>
              <h4 className="text-xl font-serif font-bold text-slate-800 mb-2">
                {translations[lang].out_of_energy}
              </h4>
              <p className="text-sm text-slate-500 break-keep leading-relaxed">
                {translations[lang].recharge_needed}
              </p>
            </div>
          )}

          <div className="grid grid-cols-4 gap-3 mb-12">
            {[
              { label: translations[lang].category_tea, list: TEAS, idx: 0, delay: 0 },
              { label: translations[lang].category_act, list: ACTIVITIES, idx: 1, delay: 200 },
              { label: translations[lang].category_scent, list: PERFUMES, idx: 2, delay: 400 },
              { label: translations[lang].category_bloom, list: FLOWERS, idx: 3, delay: 600 }
            ].map((reel) => (
              <div key={reel.label} className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">{reel.label}</p>
                <div className="slot-window rounded-[24px] p-1.5 bg-white shadow-inner">
                  <SlotReel items={reel.list} targetIndex={indices[reel.idx]} isSpinning={slotState === SlotState.SPINNING} onFinish={handleReelFinish} lang={lang} delay={reel.delay} />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={spin}
            disabled={slotState === SlotState.SPINNING || isLimitReached}
            className="magic-button w-full py-5 text-[16px] font-bold shadow-xl shadow-pink-100/50 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {slotState === SlotState.SPINNING ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                {lang === 'KR' ? '인연을 맺는 중...' : lang === 'EN' ? 'Connecting...' : '縁を結んでいます...'}
              </span>
            ) : isLimitReached ? translations[lang].recharging : translations[lang].spin_btn}
          </button>
        </section>

        {slotState === SlotState.FINISHED && result && (
          <div className="space-y-16 animate-toss">
            <div className="text-center relative">
              <span className="text-[12px] font-bold text-pink-300 uppercase tracking-[0.3em] block mb-3 font-serif">{translations[lang].result_harmony}</span>
              <h2 className="text-8xl font-serif font-semibold gradient-text tracking-tighter italic">{result.score}%</h2>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-pink-100"></div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {[
                { data: result.tea, tag: 'The Tea' },
                { data: result.activity, tag: 'The Act' },
                { data: result.perfume, tag: 'The Scent' },
                { data: result.flower, tag: 'The Bloom' }
              ].map((item, i) => (
                <div key={i} className="soft-card overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-700 group border-none">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={item.data.imageUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      alt={lang === 'KR' ? item.data.name_kr : lang === 'EN' ? item.data.name_en : item.data.name_ja}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=400&q=80`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-5 left-5 text-left">
                      <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">{item.tag}</p>
                      <p className="text-lg font-serif font-semibold text-white tracking-tight leading-tight">
                        {lang === 'KR' ? item.data.name_kr : lang === 'EN' ? item.data.name_en : item.data.name_ja}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="soft-card p-10 bg-white relative overflow-hidden ring-1 ring-pink-50">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14h.1"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <h3 className="text-xl font-serif font-semibold mb-6 flex items-center gap-4 text-slate-800">
                <span className="w-10 h-px bg-pink-200" />
                {translations[lang].commentary_title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-[17px] font-medium break-keep italic font-serif">
                "{result.aiCommentary}"
              </p>
            </div>

            <div className="soft-card p-0 border border-pink-50 overflow-hidden bg-white shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-200 via-pink-400 to-pink-200"></div>
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-serif font-bold mb-2 text-slate-800 tracking-tight">{translations[lang].lucky_item}</h3>
                    <p className="text-[10px] font-bold text-pink-400 uppercase tracking-[0.2em]">{translations[lang].curator_selection}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-pink-50 rounded-full">
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-black text-pink-600">PREMIUM</span>
                  </div>
                </div>

                {isLoadingItem ? (
                  <div className="py-24 flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-2 border-pink-50 border-t-pink-400 rounded-full animate-spin" />
                    <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase animate-pulse">{translations[lang].loading_ai}</p>
                  </div>
                ) : shoppingItem ? (
                  <div className="space-y-8 animate-toss">
                    {shoppingItem.itemImageUrl && (
                      <div className="rounded-[48px] overflow-hidden shadow-2xl bg-slate-50 aspect-square group">
                        <img src={shoppingItem.itemImageUrl} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-1000" alt="Lucky Item" />
                      </div>
                    )}

                    <div className="px-2 text-center">
                      <h4 className="text-3xl font-serif font-bold text-slate-800 mb-2 tracking-tight">{shoppingItem.itemName}</h4>
                      <div className="inline-block px-4 py-1 bg-slate-50 rounded-full mb-6">
                        <p className="text-[13px] font-bold text-pink-500 italic">{shoppingItem.itemPrice}</p>
                      </div>

                      <p className="text-[16px] text-slate-500 leading-relaxed font-medium mb-10 break-keep max-w-sm mx-auto">
                        {shoppingItem.itemReason}
                      </p>

                      <div className="space-y-3">
                        <a
                          href={`https://www.coupang.com/np/search?q=${encodeURIComponent(shoppingItem.searchKeyword)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-full py-6 bg-slate-900 text-white text-[16px] font-bold rounded-[30px] shadow-2xl active:scale-[0.98] transition-all hover:bg-slate-800"
                        >
                          {lang === 'KR' ? '쿠팡에서 바로 구매하기 ➔' : lang === 'EN' ? 'Check on Shop ➔' : 'ショップで確認する ➔'}
                        </a>
                        <p className="text-[9px] text-slate-400 text-center px-4 leading-normal">
                          {translations[lang].affiliate_disclosure}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-300 font-bold text-xs">AI 추천을 불러오지 못했습니다.</div>
                )}
              </div>
            </div>

            <button onClick={() => setSlotState(SlotState.IDLE)} className="w-full py-16 text-slate-300 font-bold text-[11px] tracking-[0.6em] uppercase hover:text-pink-400 transition-all">
              {translations[lang].restart}
            </button>
          </div>
        )}
      </main>

      <footer className="mt-10 py-10 px-8 text-center border-t border-slate-50">
        <p className="text-[9px] font-bold text-slate-300 tracking-[0.3em] mb-4 uppercase">MOOD BLOSSOM ARCHIVE • ALL RIGHTS RESERVED</p>
        <p className="text-[8px] text-slate-200 leading-loose max-w-xs mx-auto">
          {translations[lang].footer_desc}
        </p>
      </footer>
    </div>
  );
};

export default App;
