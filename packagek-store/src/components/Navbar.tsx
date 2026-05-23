import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Moon,
  Sun,
  BookOpen,
  ShoppingCart,
  Menu,
  X,
  User,
  LogIn,
  Home,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/store/useStore';

const BASE_API = import.meta.env.VITE_BASE_API;

export function Navbar() {
  const { theme, toggleTheme, setTheme } = useStore();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const handleNavigate = (path: string) => {
    closeMobileMenu();
    setTimeout(() => navigate(path), 300); // يسيب الإنيميشن يقفل قبل الـ navigate
  };

  const fetchCartCount = async () => {
    if (!user?.user_token) return;
    try {
      const res = await fetch(
        `${BASE_API}/user/cart/getCart?user_token=${user.user_token}`
      );
      const data = await res.json();
      if (data.status === 'success' && data.cart) {
        setCartCount(data.cart.total_items);
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [user?.user_token]);

  useEffect(() => {
    if (!user?.user_token) return;
    const interval = setInterval(fetchCartCount, 60000);
    return () => clearInterval(interval);
  }, [user?.user_token]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme as 'light' | 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
      setIsScrolled(scrollTop > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // إصلاح overflow
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => {
        document.body.style.overflow = "";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.nav
        animate={{
          width: isScrolled ? '90%' : '100%',
          borderRadius: isScrolled ? '1rem' : '0rem',
          top: isScrolled ? '1rem' : '0rem',
        }}
        transition={{ duration: 0.3 }}
        className="fixed left-1/2 -translate-x-1/2 z-[1000] glass-effect border-b backdrop-blur-md"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="hero-gradient p-2 rounded-lg transition-transform group-hover:scale-105">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl hidden sm:block">
                Packjack Store
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-6 flex-1 max-w-3xl mx-8">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                الرئيسية
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                إحنا مين؟
              </Link>
              <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                الأسئلة الشائعة
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">

              {/* Theme Toggle */}
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                <AnimatePresence mode="wait">
                  {theme === 'light' ? (
                    <motion.div
                      key="moon"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sun"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/cart')}
                className="relative rounded-full"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -left-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Button>

              {/* Auth */}
              {isAuthenticated ? (
                <Button variant="ghost" asChild className="hidden md:flex">
                  <Link to="/dashboard">حسابي</Link>
                </Button>
              ) : (
                <Button variant="ghost" asChild className="hidden md:flex">
                  <Link to="/login">تسجيل الدخول</Link>
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

            </div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-0 left-0 h-[3px] bg-primary"
          style={{ width: `${scrollProgress}%` }}
        />
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-black/50 z-[9999] lg:hidden"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 240, damping: 26 }}
              className="fixed top-0 right-0 w-72 h-full bg-background/95 backdrop-blur-md z-[10000] shadow-2xl rounded-l-3xl overflow-y-auto p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">القائمة</h2>
                <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="flex-1 flex flex-col gap-3">
                <button
                  onClick={() => handleNavigate('/')}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/20 transition-colors"
                >
                  <Home className="h-5 w-5 text-primary" /> الرئيسية
                </button>

                <button
                  onClick={() => handleNavigate('/about')}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/20 transition-colors"
                >
                  <BookOpen className="h-5 w-5 text-primary" /> إحنا مين؟
                </button>

                <button
                  onClick={() => handleNavigate('/faq')}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/20 transition-colors"
                >
                  <FileText className="h-5 w-5 text-primary" /> الأسئلة الشائعة
                </button>

                {isAuthenticated ? (
                  <button
                    onClick={() => handleNavigate('/dashboard')}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/20 transition-colors"
                  >
                    <User className="h-5 w-5 text-primary" /> حسابي
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavigate('/login')}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/20 transition-colors"
                  >
                    <LogIn className="h-5 w-5 text-primary" /> تسجيل الدخول
                  </button>
                )}
              </div>

              <div className="mt-auto">
                <Button variant="outline" className="w-full" onClick={toggleTheme}>
                  {theme === 'light' ? (
                    <Moon className="h-5 w-5 mr-2" />
                  ) : (
                    <Sun className="h-5 w-5 mr-2" />
                  )}
                  تبديل الوضع
                </Button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
