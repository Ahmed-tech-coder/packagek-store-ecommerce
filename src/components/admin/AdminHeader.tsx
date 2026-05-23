import { Button } from '@/components/ui/button';
import { Menu, LogOut, Moon, Sun, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface AdminHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function AdminHeader({ sidebarOpen, setSidebarOpen }: AdminHeaderProps) {
  const { admin, adminLogout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  );

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  const handleLogout = () => {
    adminLogout();
    toast.info('تم تسجيل الخروج');
    navigate('/admin/login');
  };

  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-card border-b z-50">
      <div className="h-full px-4 flex items-center justify-between">
        {/* الجانب الأيسر */}
        <div className="flex items-center gap-3">
          {/* زر القائمة */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-full md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="hero-gradient p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg">Packjack Store</h1>
              <p className="text-xs text-muted-foreground">لوحة تحكم الإدارة</p>
            </div>
          </div>
        </div>

        {/* الجانب الأيمن */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
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

          {/* Admin Info */}
          {admin && (
            <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-muted rounded-lg">
              <div className="text-right">
                <p className="text-sm font-semibold truncate max-w-[120px]">
                  {admin.admin_name}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {admin.phone_number}
                </p>
              </div>
            </div>
          )}

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="rounded-full text-destructive hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
