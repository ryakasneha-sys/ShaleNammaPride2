import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Utensils, 
  School, 
  Star, 
  MessageSquare, 
  Plus, 
  ChevronRight, 
  LogOut, 
  Globe,
  Camera,
  X,
  User,
  Send,
  Eye,
  Settings,
  ImageOff,
  Home,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  setDoc, 
  doc, 
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { 
  Role, 
  UserProfile, 
  DailyMeal, 
  Facility, 
  StudentStar, 
  FeedbackEntry, 
  Language 
} from './types';
import { TRANSLATIONS, COLORS } from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Sub-components
const Card = ({ children, className, onClick, style }: { children: React.ReactNode, className?: string, onClick?: () => void, style?: React.CSSProperties, key?: React.Key }) => (
  <motion.div 
    key={style?.toString()} // Using a placeholder since key is usually handled by React, but this satisfies the prop existence
    whileHover={{ y: -6, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    style={style}
    className={cn(
      "bg-white rounded-[40px] p-6 shadow-sm border-2 border-slate-100 cursor-pointer overflow-hidden flex flex-col", 
      className
    )}
  >
    {children}
  </motion.div>
);

const Button = ({ children, onClick, variant = 'primary', className, disabled }: any) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 font-bold",
        isPrimary && "text-white shadow-lg shadow-orange-100",
        isSecondary && "text-white shadow-lg shadow-green-100",
        variant === 'outline' && "border-2 border-slate-200 text-slate-700 bg-white",
        variant === 'ghost' && "text-slate-500 hover:bg-slate-100",
        variant === 'dark' && "bg-slate-900 text-white hover:bg-slate-800",
        className
      )}
      style={{
        backgroundColor: isPrimary ? COLORS.primary : isSecondary ? COLORS.secondary : variant === 'dark' ? '#0f172a' : undefined
      }}
    >
      {children}
    </button>
  );
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = 'https://images.unsplash.com/photo-1594122230689-73b590c7b469?q=80&w=800'; // Reliable fallback
};

// Tab Components
const HomeTab = ({ meals, stars, facilities, t, lang, setActiveTab }: any) => (
  <div className="space-y-6 max-w-5xl mx-auto">
    <header className="flex justify-between items-center bg-white p-4 rounded-3xl border-2 border-slate-100 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="bg-orange-500 p-3 rounded-2xl">
          <School className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {t.appName} <span className="text-orange-500 font-bold ml-1 text-base sm:text-lg hidden sm:inline">{lang === 'en' ? 'Pride' : 'ಹೆಮ್ಮೆ'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium italic">{lang === 'en' ? 'Govt. Primary School, Karnataka' : 'ಸರ್ಕಾರಿ ಪ್ರಾಥಮಿಕ ಶಾಲೆ, ಕರ್ನಾಟಕ'}</p>
        </div>
      </div>
    </header>

    <div className="grid grid-cols-12 gap-6">
      {/* Main Feature: Daily Meal */}
      <section className="col-span-12 lg:col-span-12 grid grid-cols-12 gap-6">
        <Card 
          onClick={() => setActiveTab('meals')}
          className="col-span-12 md:col-span-5 bg-[#FFFAED] border-4 border-[#FFE8A3] min-h-[400px] group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="bg-[#F9D461] text-[#7A5C00] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider italic">
              {lang === 'en' ? "Today's Nutrition" : "ಇಂದಿನ ಪೌಷ್ಟಿಕಾಂಶ"}
            </span>
            <span className="text-slate-400 font-mono text-xs uppercase">{meals[0]?.date || new Date().toISOString().split('T')[0]}</span>
          </div>
          
          <div className="flex-grow relative overflow-hidden rounded-3xl mb-4 bg-slate-100">
            {meals[0] ? (
              <img 
                src={meals[0].imageUrl} 
                alt="Meal" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 italic gap-2 text-sm">
                 <Utensils className="w-10 h-10 opacity-20" />
                 {t.noPostsYet}
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">{meals[0]?.description || t.dailyMeal}</h3>
            <p className="text-slate-500 text-xs mt-1">
              {lang === 'en' 
                ? 'Nutritious mix of local seasonal vegetables and grains.' 
                : 'ಸ್ಥಳೀಯ ಕಾಲೋಚಿತ ತರಕಾರಿಗಳು ಮತ್ತು ಧಾನ್ಯಗಳ ಪೌಷ್ಟಿಕ ಮಿಶ್ರಣ.'}
            </p>
          </div>
        </Card>

        {/* Student Stars Mini Section */}
        <Card 
          onClick={() => setActiveTab('stars')}
          className="col-span-12 md:col-span-7 bg-white p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black flex items-center gap-2">
              <span className="text-yellow-500">★</span> {t.studentStars}
            </h2>
            <button className="text-sm font-bold text-orange-500 flex items-center gap-1">
              {lang === 'en' ? 'View Hall of Fame' : 'ಗೌರವ ಫಲಕ'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
            {stars.slice(0, 2).map((star: any, idx: number) => (
              <div key={star.id} className={cn(
                "rounded-3xl p-5 border relative flex items-center gap-4",
                idx === 0 ? "bg-[#F2F8FF] border-blue-100" : "bg-[#FDF2FF] border-purple-100"
              )}>
                 <div className={cn(
                   "absolute -top-3 -right-3 text-white p-2 rounded-xl text-[10px] font-bold",
                   idx === 0 ? "bg-blue-500" : "bg-purple-500"
                 )}>
                   {lang === 'en' ? (idx === 0 ? 'Academic' : 'Sports') : (idx === 0 ? 'ಶೈಕ್ಷಣಿಕ' : 'ಕ್ರೀಡೆ')}
                 </div>
                 <img 
                  src={star.imageUrl} 
                  className="w-14 h-14 rounded-2xl bg-slate-200 object-cover ring-2 ring-white shadow-sm" 
                  referrerPolicy="no-referrer"
                  onError={handleImageError}
                 />
                 <div>
                   <p className="font-bold text-base truncate">{star.name}</p>
                   <p className={cn("text-xs", idx === 0 ? "text-blue-600" : "text-purple-600")}>
                     {star.achievement}
                   </p>
                 </div>
              </div>
            ))}
            {stars.length === 0 && Array(2).fill(0).map((_, idx) => (
               <div key={idx} className="bg-slate-50 rounded-3xl p-5 border border-slate-100 animate-pulse h-24"></div>
            ))}
          </div>
        </Card>
      </section>

      {/* School Tour section */}
      <Card 
        onClick={() => setActiveTab('facility')}
        className="col-span-12 sm:col-span-7 bg-[#EAF7ED] border-2 border-[#C8EBCF]"
      >
        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
          <School className="w-5 h-5 text-green-600" /> {t.facilityTour}
        </h2>
        <div className="flex-grow rounded-3xl bg-white border border-[#C8EBCF] overflow-hidden p-2 group">
          {facilities[0] ? (
            <>
              <img 
                src={facilities[0].imageUrl} 
                className="w-full h-40 object-cover rounded-2xl mb-3 group-hover:scale-105 transition-transform" 
                referrerPolicy="no-referrer"
                onError={handleImageError}
              />
              <div className="flex justify-between items-center px-2 pb-1">
                <span className="text-sm font-bold text-green-800">{facilities[0].title}</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-40 bg-slate-50 rounded-2xl flex items-center justify-center italic text-slate-400 text-xs">
              {t.noPostsYet}
            </div>
          )}
        </div>
      </Card>

      {/* Feedback box */}
      <Card 
        onClick={() => setActiveTab('feedback')}
        className="col-span-12 sm:col-span-5 bg-slate-900 border-none text-white justify-between p-7"
      >
        <div>
          <div className="bg-orange-500 w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-white">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t.feedback}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{lang === 'en' ? 'Help us grow your school. Share feedback anonymously.' : 'ನಿಮ್ಮ ಶಾಲೆಯ ಬೆಳವಣಿಗೆಗೆ ಸಹಕರಿಸಿ. ನಿಮ್ಮ ಅನಿಸಿಕೆಗಳನ್ನು ನಮ್ಮೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ.'}</p>
        </div>
        <button className="mt-4 w-full bg-white text-slate-900 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
          {lang === 'en' ? 'Share Note' : 'ಅನಿಸಿಕೆ ತಿಳಿಸಿ'}
        </button>
      </Card>

      {/* Parent Trust / Footer in Grid */}
      <div className="col-span-12 bg-white rounded-[32px] p-6 flex flex-col sm:flex-row items-center gap-6 border-2 border-slate-50 shadow-sm">
        <div className="flex -space-x-3 overflow-hidden p-1">
          {[1,2,3,4].map(i => (
            <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-slate-200 border border-slate-100 flex items-center justify-center overflow-hidden">
              <User className="w-6 h-6 text-slate-400 mt-2" />
            </div>
          ))}
          <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-slate-800 text-white text-[10px] flex items-center justify-center font-bold">+ {Math.floor(Math.random() * 100) + 50}</div>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{lang === 'en' ? 'Parent Community' : 'ಪೋಷಕರ ಸಮುದಾಯ'}</p>
          <p className="text-lg font-black text-slate-900 uppercase">
            {lang === 'en' ? 'Growing trust together' : 'ವಿಶ್ವಾಸದೊಂದಿಗೆ ಅಡಿ ಇಡೋಣ'}
          </p>
        </div>
        <div className="sm:ml-auto bg-green-50 px-5 py-2.5 rounded-2xl flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600 font-bold text-xs uppercase tracking-tight tracking-wider">{lang === 'en' ? 'LIVE Updates' : 'ಲೈವ್ ಅಪ್ಡೇಟ್ಗಳು'}</span>
        </div>
      </div>
    </div>
  </div>
);

const MealsTab = ({ meals, isAdminOrHeadmaster, t, lang, setActiveTab, setIsModalOpen, handleDelete }: any) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const isMealPostedToday = meals.some((m: any) => m.date === todayStr);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border-2 border-slate-100">
        <button onClick={() => setActiveTab('home')} className="p-2 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
          <X className="w-6 h-6 text-slate-500" />
        </button>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t.dailyMeal}</h2>
      </div>

      {isAdminOrHeadmaster && (
        <Card className="bg-[#FFFAED] border-4 border-[#FFE8A3] flex flex-col items-center justify-center py-12 gap-4">
          <div className="bg-orange-500 p-4 rounded-full text-white shadow-lg shadow-orange-100">
            <Camera className="w-8 h-8" />
          </div>
          {isMealPostedToday ? (
            <p className="text-[#7A5C00] font-black text-center text-lg">{t.mealPosted}</p>
          ) : (
            <div className="text-center">
              <p className="text-[#7A5C00] font-black mb-4">{t.onlyOneMealDay}</p>
              <Button onClick={() => setIsModalOpen(true)} className="px-10">
                {t.uploadMeal}
              </Button>
            </div>
          )}
        </Card>
      )}

      <div className="grid gap-6">
        {meals.map((meal: any) => (
          <Card key={meal.id} className="p-0 sm:flex-row gap-0">
            <div className="sm:w-64 h-64 overflow-hidden">
              <img 
                src={meal.imageUrl} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
                onError={handleImageError}
              />
            </div>
            <div className="p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-black bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full uppercase tracking-widest italic">
                  {meal.date}
                </span>
                {isAdminOrHeadmaster && (
                  <button 
                    onClick={() => handleDelete('dailyMeals', meal.id)}
                    className="text-red-400 hover:text-red-600 p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">{meal.description}</h3>
              <p className="text-slate-500 text-sm font-medium">Daily nutritional intake recorded by {lang === 'en' ? 'School Authority' : 'ಶಾಲಾ ಮಂಡಳಿ'}.</p>
            </div>
          </Card>
        ))}
        {meals.length === 0 && <div className="py-20 text-center text-slate-400 italic font-medium">{t.noPostsYet}</div>}
      </div>
    </div>
  );
};

const FacilityTab = ({ facilities, isAdminOrHeadmaster, t, lang, setActiveTab, setIsModalOpen, handleDelete }: any) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border-2 border-slate-100">
      <button onClick={() => setActiveTab('home')} className="p-2 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
        <X className="w-6 h-6 text-slate-500" />
      </button>
      <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t.facilityTour}</h2>
    </div>
    <p className="text-slate-500 font-medium px-2 leading-relaxed">{t.facilityDescription}</p>

    {isAdminOrHeadmaster && (
      <Button onClick={() => setIsModalOpen(true)} className="w-full py-5 rounded-[30px] border-4 border-dashed border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all flex flex-col gap-2 h-auto" variant="outline">
        <div className="bg-slate-100 p-3 rounded-2xl">
          <Plus className="w-6 h-6 text-slate-400" />
        </div>
        <span className="font-black text-sm uppercase tracking-widest">{t.addFacility}</span>
      </Button>
    )}

    <div className="grid gap-6">
      <AnimatePresence>
        {facilities.map((fac: any) => (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            key={fac.id}
          >
            <Card 
              className="p-0 bg-[#EAF7ED] border-[#C8EBCF] mb-6"
              style={{ display: 'block' }}
            >
            <div className="h-72 overflow-hidden">
              <img 
                src={fac.imageUrl} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                referrerPolicy="no-referrer" 
                onError={handleImageError}
              />
            </div>
            <div className="p-8 bg-white border-t border-[#C8EBCF]">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-black text-slate-900">{fac.title}</h3>
                <div className="flex items-center gap-2">
                  {fac.videoUrl && (
                    <button 
                      onClick={() => window.open(fac.videoUrl, '_blank')}
                      className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-green-200 transition-colors"
                    >
                      <Eye className="w-3 h-3" /> {lang === 'en' ? 'Watch Tour' : 'ವಿಡಿಯೋ ನೋಡಿ'}
                    </button>
                  )}
                  {isAdminOrHeadmaster && (
                    <button 
                      onClick={() => handleDelete('facilityTour', fac.id)}
                      className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{fac.description}</p>
            </div>
          </Card>
        </motion.div>
      ))}
      </AnimatePresence>
      {facilities.length === 0 && <div className="py-20 text-center text-slate-400 italic font-medium">{t.noPostsYet}</div>}
    </div>
  </div>
);

const StarsTab = ({ stars, isAdminOrHeadmaster, t, lang, setActiveTab, setIsModalOpen, handleDelete }: any) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border-2 border-slate-100">
      <button onClick={() => setActiveTab('home')} className="p-2 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
        <X className="w-6 h-6 text-slate-500" />
      </button>
      <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t.studentStars}</h2>
    </div>

    {isAdminOrHeadmaster && (
      <Button onClick={() => setIsModalOpen(true)} className="w-full py-5 rounded-[30px] border-4 border-dashed border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all flex flex-col gap-2 h-auto" variant="outline">
        <div className="bg-slate-100 p-3 rounded-2xl">
          <Plus className="w-6 h-6 text-slate-400" />
        </div>
        <span className="font-black text-sm uppercase tracking-widest">{t.addStar}</span>
      </Button>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {stars.map((star: any, idx: number) => (
        <Card key={star.id} className={cn("p-6 border-none", idx % 2 === 0 ? "bg-[#F2F8FF]" : "bg-[#FDF2FF]")}>
          <div className="flex gap-5">
            <div className="relative">
              <img 
                src={star.imageUrl} 
                className="w-24 h-24 rounded-3xl object-cover ring-[6px] ring-white shadow-sm" 
                referrerPolicy="no-referrer" 
                onError={handleImageError}
              />
              <div className={cn("absolute -top-3 -right-3 text-white p-2 rounded-xl text-[10px] font-black", idx % 2 === 0 ? "bg-blue-500" : "bg-purple-500")}>
                #{idx + 1}
              </div>
              {isAdminOrHeadmaster && (
                <button 
                  onClick={() => handleDelete('studentStars', star.id)}
                  className="absolute -bottom-2 -left-2 p-2 bg-white text-red-500 rounded-full shadow-md hover:bg-red-50 transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1 py-1">
              <h3 className="font-black text-lg text-slate-900 mb-1">{star.name}</h3>
              <p className={cn("font-bold text-[10px] uppercase tracking-[0.2em] mb-2", idx % 2 === 0 ? "text-blue-600" : "text-purple-600")}>
                {t.studentAchievement}
              </p>
              <p className="text-slate-600 text-xs font-medium leading-relaxed italic">"{star.achievement}"</p>
            </div>
          </div>
        </Card>
      ))}
      {stars.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 italic font-medium">{t.noPostsYet}</div>}
    </div>
  </div>
);

const FeedbackTab = ({ feedbackList, user, isAdminOrHeadmaster, t, lang, setActiveTab, handleDelete }: any) => {
  const [msg, setMsg] = useState('');
  const [anon, setAnon] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!msg.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        message: msg,
        isAnonymous: anon,
        userId: anon ? null : user?.uid,
        createdAt: serverTimestamp()
      });
      setMsg('');
      alert(lang === 'en' ? 'Thank you for your feedback!' : 'ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಗೆ ಧನ್ಯವಾದಗಳು!');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border-2 border-slate-100">
        <button onClick={() => setActiveTab('home')} className="p-2 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
          <X className="w-6 h-6 text-slate-500" />
        </button>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">{t.feedback}</h2>
      </div>

      <Card className="space-y-6 p-8 border-none shadow-xl bg-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{lang === 'en' ? 'Quick Note' : 'ಶೀಘ್ರ ಪ್ರತಿಕ್ರಿಯೆ'}</h3>
        </div>
        <textarea 
          placeholder={t.feedbackPlaceholder}
          value={msg}
          onChange={e => setMsg(e.target.value)}
          className="w-full h-32 p-6 rounded-[32px] bg-slate-50 border-2 border-transparent focus:border-slate-200 focus:bg-white transition-all text-slate-900 font-bold placeholder-slate-300 outline-none resize-none"
        />
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-slate-50 p-4 rounded-[40px] px-8">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={anon} 
              onChange={e => setAnon(e.target.checked)}
              className="w-5 h-5 rounded-lg border-2 border-slate-300 text-slate-900 focus:ring-transparent transition-all" 
            />
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
              {lang === 'en' ? 'Post Anonymously' : 'ಅನಾಮಧೇಯವಾಗಿ ಕಳುಹಿಸಿ'}
            </span>
          </label>
          <Button 
            disabled={loading || !msg.trim()}
            onClick={submit}
            className="w-full sm:w-auto h-14 px-10 rounded-full"
          >
            {loading ? (lang === 'en' ? 'Sending...' : 'ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...') : <><Send className="w-5 h-5" /> {t.send}</>}
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 px-2 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-orange-500" />
          {lang === 'en' ? 'Community Voices' : 'ಸಮುದಾಯದ ಧ್ವನಿ'}
        </h3>
        {feedbackList.map((fb: any) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={fb.id}
          >
            <Card className="p-7 relative border-none shadow-sm bg-slate-50/50">
              {isAdminOrHeadmaster && (
                <button 
                  onClick={() => handleDelete('feedback', fb.id)}
                  className="absolute top-6 right-6 p-2 bg-white text-red-500 rounded-full shadow-sm hover:bg-red-50 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest italic mb-1">
                    {fb.isAnonymous ? (lang === 'en' ? 'Anonymous Parent' : 'ಅನಾಮಧೇಯ ಪೋಷಕರು') : (lang === 'en' ? 'Verified Member' : 'ಪರಿಶೀಲಿಸಿದ ಸದಸ್ಯರು')}
                  </p>
                  <p className="text-slate-800 font-bold leading-relaxed">{fb.message}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
        {feedbackList.length === 0 && <div className="py-20 text-center text-slate-400 italic font-medium">{t.noPostsYet}</div>}
      </div>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('lang') as Language) || 'kn');
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'meals' | 'facility' | 'stars' | 'feedback'>('home');
  const [meals, setMeals] = useState<DailyMeal[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [stars, setStars] = useState<StudentStar[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', imageUrl: '', videoUrl: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const pRef = doc(db, 'users', u.uid);
        const p = await getDoc(pRef);
        
        // Grant Headmaster access to the requester
        const isOfficialAdmin = u.email === 'jayanthmr67140@gmail.com';
        const targetRole: Role = isOfficialAdmin ? 'headmaster' : 'parent';

        if (p.exists()) {
          const existingProfile = p.data() as UserProfile;
          if (isOfficialAdmin && existingProfile.role !== 'headmaster') {
             await setDoc(pRef, { ...existingProfile, role: 'headmaster' }, { merge: true });
             setUserProfile({ ...existingProfile, role: 'headmaster' });
          } else {
             setUserProfile(existingProfile);
          }
        } else {
          const newProfile: UserProfile = { 
            uid: u.uid, 
            email: u.email || '',
            role: targetRole,
            createdAt: serverTimestamp() as any
          };
          await setDoc(pRef, newProfile);
          setUserProfile(newProfile);
        }

        // Auto-seed if admin and data is completely empty
        if (isOfficialAdmin) {
           const mealsCheck = await getDoc(doc(db, 'dailyMeals', '2026-05-01'));
           const facilityCheck = await getDoc(doc(db, 'facilityTour', 'f1'));
           const starsCheck = await getDoc(doc(db, 'studentStars', 's1'));
           const feedbackCheck = await getDoc(doc(db, 'feedback', 'seed1'));

           if (!mealsCheck.exists()) {
             console.log("Seeding initial meal data...");
             const mealData = [
                { id: '2026-04-28', date: '2026-04-28', description: 'Rice + Mixed Vegetable Sambar (Sose-Sambar)', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800' },
                { id: '2026-04-29', date: '2026-04-29', description: 'Healthy Vegetable Pulav + Raita', imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800' },
                { id: '2026-04-30', date: '2026-04-30', description: 'Rice + Leafy Green Dal + Boiled Egg', imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=800' },
                { id: '2026-05-01', date: '2026-05-01', description: 'Millet Pongal + Coconut Chutney', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800' },
                { id: '2026-05-02', date: '2026-05-02', description: 'Rice + Sambar + Fresh Curd', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=800' },
                { id: '2026-05-03', date: '2026-05-03', description: 'Vegetable Upma (Khara Bath) with Coconut Chutney', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800' },
              ];
              for (const meal of mealData) {
                try {
                  await setDoc(doc(db, 'dailyMeals', meal.id), { ...meal, createdAt: serverTimestamp() });
                } catch (e) {
                  console.error("Error seeding meal:", meal.id, e);
                }
              }
           }

           if (!facilityCheck.exists()) {
             console.log("Seeding initial facility data...");
             const facilityData = [
              { id: 'f1', title: 'Smart Classroom', description: 'Modern learning with interactive digital boards and multimedia and high-speed internet.', imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800', videoUrl: 'https://www.youtube.com/watch?v=demo', order: 1 },
              { id: 'f2', title: 'Science Laboratory', description: 'Well-equipped lab for hands-on experiments in Physics, Chemistry, and Biology.', imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800', order: 2 },
              { id: 'f3', title: 'School Library', description: 'Over 2000+ books ranging from literature to science for all student grades.', imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800', order: 3 },
              { id: 'f4', title: 'Playground & Sports', description: 'Large open field for Kho-Kho, Kabaddi, and Athletics with standard sports equipment.', imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800', order: 4 },
              { id: 'f5', title: 'Eco-Friendly Campus', description: 'Lush green surroundings with rain water harvesting and herbal garden maintained by students.', imageUrl: 'https://images.unsplash.com/photo-1592332298123-9c8614a4e1bc?q=80&w=800', order: 5 },
            ];
            for (const fac of facilityData) {
              try {
                await setDoc(doc(db, 'facilityTour', fac.id), fac);
              } catch (e) {
                console.error("Error seeding facility:", fac.id, e);
              }
            }
           }

           if (!starsCheck.exists()) {
             console.log("Seeding initial star data...");
             const starData = [
              { id: 's1', name: 'Deepika R.', achievement: 'Secured 100% in Mathematics District Level Olympiad.', imageUrl: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=400', date: '2026-04-25' },
              { id: 's2', name: 'Karthik G.', achievement: 'Zonal level Kho-Kho Gold Medalist.', imageUrl: 'https://images.unsplash.com/photo-1503910368127-b4428c7efbf1?q=80&w=400', date: '2026-04-20' },
              { id: 's3', name: 'Sneha L.', achievement: 'Winner of State level Kannada Debate competition.', imageUrl: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=400', date: '2026-04-22' },
              { id: 's4', name: 'Manjunath', achievement: 'Young Scientist Award for model on water conservation.', imageUrl: 'https://images.unsplash.com/photo-1503910368127-b4428c7efbf1?q=80&w=400', date: '2026-04-24' },
            ];
            for (const star of starData) {
              try {
                await setDoc(doc(db, 'studentStars', star.id), { ...star, createdAt: serverTimestamp() });
              } catch (e) {
                console.error("Error seeding star:", star.id, e);
              }
            }
           }

           if (!feedbackCheck.exists()) {
             console.log("Seeding initial feedback data...");
             const feedbackData = [
               { id: 'seed1', message: 'The new smart classrooms are amazing! My daughter loves the interactive learning.', isAnonymous: false },
               { id: 'seed2', message: 'Kindly ensure more frequent sports competitions for higher secondary students.', isAnonymous: true },
               { id: 'seed3', message: 'Meal quality has improved significantly. Thank you to the school staff.', isAnonymous: false },
               { id: 'seed4', message: 'The school library has a wonderful collection. It has helped my son improve his reading habits.', isAnonymous: false },
               { id: 'seed5', message: 'Very proud of our school for maintaining such a green and clean campus.', isAnonymous: true },
             ];
             for (const fb of feedbackData) {
               try {
                 await setDoc(doc(db, 'feedback', fb.id), {
                   ...fb,
                   userId: fb.isAnonymous ? null : u.uid,
                   createdAt: serverTimestamp()
                 });
               } catch (e) {
                 console.error("Error seeding feedback:", fb.id, e);
               }
             }
           }
        }
      } else {
        setUserProfile(null);
      }
    });
    return unsub;
  }, []);

  // Listeners
  useEffect(() => {
    const unsubMeals = onSnapshot(query(collection(db, 'dailyMeals'), orderBy('date', 'desc')), (snap) => {
      setMeals(snap.docs.map(d => ({ id: d.id, ...d.data() } as DailyMeal)));
    }, err => handleFirestoreError(err, OperationType.LIST, 'dailyMeals'));

    const unsubFac = onSnapshot(query(collection(db, 'facilityTour'), orderBy('order', 'asc')), (snap) => {
      setFacilities(snap.docs.map(d => ({ id: d.id, ...d.data() } as Facility)));
    }, err => handleFirestoreError(err, OperationType.LIST, 'facilityTour'));

    const unsubStars = onSnapshot(query(collection(db, 'studentStars'), orderBy('date', 'desc')), (snap) => {
      setStars(snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentStar)));
    }, err => handleFirestoreError(err, OperationType.LIST, 'studentStars'));

    const unsubFeedback = onSnapshot(query(collection(db, 'feedback'), orderBy('createdAt', 'desc')), (snap) => {
      setFeedbackList(snap.docs.map(d => ({ id: d.id, ...d.data() } as FeedbackEntry)));
    }, err => handleFirestoreError(err, OperationType.LIST, 'feedback'));

    return () => {
      unsubMeals();
      unsubFac();
      unsubStars();
      unsubFeedback();
    };
  }, []);

  const seedData = async () => {
    const mealData = [
      { id: '2026-04-28', date: '2026-04-28', description: 'Rice + Mixed Vegetable Sambar (Sose-Sambar)', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800' },
      { id: '2026-04-29', date: '2026-04-29', description: 'Healthy Vegetable Pulav + Raita', imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800' },
      { id: '2026-04-30', date: '2026-04-30', description: 'Rice + Leafy Green Dal + Boiled Egg', imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=800' },
      { id: '2026-05-01', date: '2026-05-01', description: 'Millet Pongal + Coconut Chutney', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800' },
      { id: '2026-05-02', date: '2026-05-02', description: 'Rice + Sambar + Fresh Curd', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=800' },
      { id: '2026-05-03', date: '2026-05-03', description: 'Vegetable Upma (Khara Bath) with Coconut Chutney', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800' },
    ];

    const facilityData = [
      { id: 'f1', title: 'Smart Classroom', description: 'Modern learning with interactive digital boards and multimedia and high-speed internet.', imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800', videoUrl: 'https://www.youtube.com/watch?v=demo', order: 1 },
      { id: 'f2', title: 'Science Laboratory', description: 'Well-equipped lab for hands-on experiments in Physics, Chemistry, and Biology.', imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800', order: 2 },
      { id: 'f3', title: 'School Library', description: 'Over 2000+ books ranging from literature to science for all student grades.', imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800', order: 3 },
      { id: 'f4', title: 'Playground & Sports', description: 'Large open field for Kho-Kho, Kabaddi, and Athletics with standard sports equipment.', imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800', order: 4 },
      { id: 'f5', title: 'Eco-Friendly Campus', description: 'Lush green surroundings with rain water harvesting and herbal garden maintained by students.', imageUrl: 'https://images.unsplash.com/photo-1592332298123-9c8614a4e1bc?q=80&w=800', order: 5 },
    ];

    const starData = [
      { id: 's1', name: 'Deepika R.', achievement: 'Secured 100% in Mathematics District Level Olympiad.', imageUrl: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=400', date: '2026-04-25' },
      { id: 's2', name: 'Karthik G.', achievement: 'Zonal level Kho-Kho Gold Medalist.', imageUrl: 'https://images.unsplash.com/photo-1503910368127-b4428c7efbf1?q=80&w=400', date: '2026-04-20' },
      { id: 's3', name: 'Sneha L.', achievement: 'Winner of State level Kannada Debate competition.', imageUrl: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=400', date: '2026-04-22' },
      { id: 's4', name: 'Manjunath', achievement: 'Young Scientist Award for model on water conservation.', imageUrl: 'https://images.unsplash.com/photo-1503910368127-b4428c7efbf1?q=80&w=400', date: '2026-04-24' },
    ];

    const feedbackData = [
      { id: 'seed1', message: 'The new smart classrooms are amazing! My daughter loves the interactive learning.', isAnonymous: false, createdAt: serverTimestamp() },
      { id: 'seed2', message: 'Kindly ensure more frequent sports competitions for higher secondary students.', isAnonymous: true, createdAt: serverTimestamp() },
      { id: 'seed3', message: 'Meal quality has improved significantly. Thank you to the school staff.', isAnonymous: false, createdAt: serverTimestamp() },
      { id: 'seed4', message: 'The school library has a wonderful collection. It has helped my son improve his reading habits.', isAnonymous: false, createdAt: serverTimestamp() },
      { id: 'seed5', message: 'Very proud of our school for maintaining such a green and clean campus.', isAnonymous: true, createdAt: serverTimestamp() },
    ];

    try {
      for (const meal of mealData) {
        await setDoc(doc(db, 'dailyMeals', meal.id), { ...meal, createdAt: serverTimestamp() });
      }
      for (const fac of facilityData) {
        await setDoc(doc(db, 'facilityTour', fac.id), fac);
      }
      for (const star of starData) {
        await setDoc(doc(db, 'studentStars', star.id), { ...star, createdAt: serverTimestamp() });
      }
      for (const fb of feedbackData) {
        await setDoc(doc(db, 'feedback', fb.id), {
          ...fb,
          userId: fb.isAnonymous ? null : auth.currentUser?.uid,
          createdAt: serverTimestamp()
        });
      }
      alert('Demo data seeded successfully!');
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Error seeding data. Check console.');
    }
  };

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  const toggleLang = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLang(l => l === 'en' ? 'kn' : 'en');
  };

  const isAdminOrHeadmaster = userProfile?.role === 'admin' || userProfile?.role === 'headmaster';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit for Firestore base64
      alert(lang === 'en' ? 'Image too large. Please select a file smaller than 1MB.' : 'ಚಿತ್ರವು ತುಂಬಾ ದೊಡ್ಡದಾಗಿದೆ. ದಯವಿಟ್ಟು 1MB ಗಿಂತ ಚಿಕ್ಕದಾದ ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.imageUrl) return;
    setIsSubmitting(true);
    try {
      if (activeTab === 'meals') {
        const date = new Date().toISOString().split('T')[0];
        await setDoc(doc(db, 'dailyMeals', date), {
          id: date,
          date,
          description: formData.title,
          imageUrl: formData.imageUrl,
          createdAt: serverTimestamp()
        });
      } else if (activeTab === 'facility') {
        const id = 'f' + Date.now();
        await setDoc(doc(db, 'facilityTour', id), {
          id,
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl,
          videoUrl: formData.videoUrl || null,
          order: facilities.length + 1
        });
      } else if (activeTab === 'stars') {
        const id = 's' + Date.now();
        await setDoc(doc(db, 'studentStars', id), {
          id,
          name: formData.title,
          achievement: formData.description,
          imageUrl: formData.imageUrl,
          date: new Date().toISOString().split('T')[0],
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      setFormData({ title: '', description: '', imageUrl: '', videoUrl: '' });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, activeTab);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!confirm(lang === 'en' ? 'Are you sure you want to delete this?' : 'ಇದನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?')) return;
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, collectionName, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, collectionName);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
      {/* Top Navigation */}
      <div className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-xl z-50 border-b border-slate-100 px-4 h-20 sm:h-24 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-6">
          <button onClick={() => setActiveTab('home')} className="flex items-center gap-2 group">
            <div className="bg-orange-500 p-2 rounded-xl group-hover:rotate-6 transition-transform">
              <School className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-none uppercase">Pride</span>
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{lang === 'en' ? 'School' : 'ಶಾಲೆ'}</span>
            </div>
          </button>

          <nav className="hidden md:flex bg-slate-100 p-1.5 rounded-2xl gap-1">
            <button 
              onClick={() => setActiveTab('home')} 
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'home' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Home className="w-3.5 h-3.5" />
              {t.home}
            </button>
            <button 
              onClick={() => setActiveTab('meals')} 
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'meals' ? "bg-orange-500 text-white shadow-lg shadow-orange-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Utensils className="w-3.5 h-3.5" />
              {t.meals}
            </button>
            <button 
              onClick={() => setActiveTab('facility')} 
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'facility' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Building2 className="w-3.5 h-3.5" />
              {t.facility}
            </button>
            <button 
              onClick={() => setActiveTab('stars')} 
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'stars' ? "bg-violet-600 text-white shadow-lg shadow-violet-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Star className="w-3.5 h-3.5" />
              {t.stars}
            </button>
            <button 
              onClick={() => setActiveTab('feedback')} 
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'feedback' ? "bg-rose-500 text-white shadow-lg shadow-rose-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {t.feedback}
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={toggleLang}
            className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl hover:bg-slate-100 transition-colors shadow-sm"
          >
            <Globe className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{lang === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>
          
          {user ? (
            <div className="flex items-center gap-2 bg-white p-1 pr-3 rounded-2xl border border-slate-100 shadow-sm">
              <div className="bg-slate-100 p-2 rounded-xl">
                 <User className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex flex-col items-end mr-1">
                <span className="text-[8px] font-black text-orange-600 uppercase tracking-widest leading-none mb-1">{userProfile?.role}</span>
                <span className="text-[11px] font-bold text-slate-900 truncate max-w-[80px] leading-none">{user.displayName?.split(' ')[0] || 'User'}</span>
              </div>
              <button onClick={logout} className="p-1 text-slate-300 hover:text-red-500 transition-colors ml-1">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button onClick={login} variant="outline" className="h-10 py-0 px-4 text-xs">
              <User className="w-4 h-4" /> {t.login}
            </Button>
          )}

          {isAdminOrHeadmaster && (
            <button 
              onClick={seedData} 
              className="p-2.5 bg-slate-900 rounded-xl text-white shadow-lg hover:bg-slate-800 transition-colors"
              title="Seed Demo Data"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-32 sm:py-40">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'home' && <HomeTab meals={meals} stars={stars} facilities={facilities} t={t} lang={lang} setActiveTab={setActiveTab} />}
            {activeTab === 'meals' && <MealsTab meals={meals} isAdminOrHeadmaster={isAdminOrHeadmaster} t={t} lang={lang} setActiveTab={setActiveTab} setIsModalOpen={setIsModalOpen} handleDelete={handleDelete} />}
            {activeTab === 'facility' && <FacilityTab facilities={facilities} isAdminOrHeadmaster={isAdminOrHeadmaster} t={t} lang={lang} setActiveTab={setActiveTab} setIsModalOpen={setIsModalOpen} handleDelete={handleDelete} />}
            {activeTab === 'stars' && <StarsTab stars={stars} isAdminOrHeadmaster={isAdminOrHeadmaster} t={t} lang={lang} setActiveTab={setActiveTab} setIsModalOpen={setIsModalOpen} handleDelete={handleDelete} />}
            {activeTab === 'feedback' && <FeedbackTab feedbackList={feedbackList} user={user} isAdminOrHeadmaster={isAdminOrHeadmaster} t={t} lang={lang} setActiveTab={setActiveTab} handleDelete={handleDelete} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white rounded-[48px] w-full max-w-md p-8 sm:p-10 shadow-2xl relative border-4 border-slate-100 overflow-y-auto max-h-[90vh]"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                <X className="w-6 h-6 text-slate-500" />
              </button>
              
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-8 pr-12">
                {activeTab === 'meals' ? t.uploadMeal : activeTab === 'stars' ? t.addStar : t.addFacility}
              </h3>
              
              <div className="space-y-6">
                <input 
                  type="file" 
                  id="imageUpload" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
                <div 
                  className="h-48 sm:h-56 bg-slate-50 rounded-[32px] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-3 group hover:border-orange-200 transition-colors cursor-pointer relative overflow-hidden"
                  onClick={() => document.getElementById('imageUpload')?.click()}
                >
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} className="w-full h-full object-cover" onError={handleImageError} />
                  ) : (
                    <>
                      <div className="bg-white p-4 rounded-3xl shadow-sm group-hover:scale-110 transition-transform">
                        <Camera className="w-10 h-10 text-slate-300" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed text-center px-6">
                        {lang === 'en' ? 'Click to Upload Image' : 'ಚಿತ್ರವನ್ನು ಅಪ್ ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ'}
                      </p>
                    </>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{lang === 'en' ? 'Title / Name' : 'ಶೀರ್ಷಿಕೆ / ಹೆಸರು'}</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder={activeTab === 'meals' ? "Vegetable Pulav + Egg..." : activeTab === 'stars' ? "Full Name" : "Eg: Smart Classroom"} 
                    className="w-full p-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all text-slate-900 font-bold placeholder-slate-300 outline-none"
                  />
                </div>

                {(activeTab === 'stars' || activeTab === 'facility') && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{lang === 'en' ? 'Achievements / Details' : 'ಸಾಧನೆಗಳು / ವಿವರಗಳು'}</label>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                      placeholder={activeTab === 'stars' ? "Eg: District level medalist..." : "Provide more details..."}
                      className="w-full h-28 p-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all text-slate-900 font-bold placeholder-slate-300 outline-none resize-none"
                    />
                  </div>
                )}
                
                <Button 
                  onClick={handleCreate}
                  disabled={isSubmitting || !formData.title || !formData.imageUrl} 
                  className="w-full py-5 rounded-3xl mt-4 text-lg"
                >
                  {isSubmitting ? (lang === 'en' ? 'Publishing...' : 'ಪ್ರಕಟಿಸಲಾಗುತ್ತಿದೆ...') : (lang === 'en' ? 'Publish Update' : 'ನವೀಕರಣವನ್ನು ಪ್ರಕಟಿಸಿ')}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
