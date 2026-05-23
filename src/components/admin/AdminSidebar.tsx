import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  Book,
  ShoppingCart,
  ChevronRight,
  Layers,
  BookOpen,
  GraduationCap,
  Truck,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = useCallback(
    (path: string) => {
      onClose(); // اقفل الأول

      // استنى الأنيميشن تقفل وبعدين اعمل نافيجيشن
      setTimeout(() => {
        navigate(path);
      }, 300); // نفس مدة exit animation
    },
    [navigate, onClose]
  );

  const menuItems = [
    { name: 'الرئيسية', path: '/admin', icon: LayoutDashboard },
    { name: 'الكتب', path: '/admin/books-management', icon: Book },
    { name: 'الطلبات', path: '/admin/orders', icon: ShoppingCart },
    { name: 'الفئات', path: '/admin/categories', icon: Layers },
    { name: 'المواد', path: '/admin/subjects', icon: BookOpen },
    { name: 'المدرسين', path: '/admin/teachers', icon: GraduationCap },
    { name: 'مصاريف الشحن', path: '/admin/delivery-price', icon: Truck },
    { name: 'المستخدمين', path: '/admin/users', icon: Users },
    { name: 'المسؤولين', path: '/admin/admins', icon: Shield },
  ];

  const isMobile = window.innerWidth < 768;

  return (
    <AnimatePresence>
      {(isOpen || !isMobile) && (
        <motion.aside
          initial={{ x: isMobile ? '100%' : 0 }}
          animate={{ x: 0 }}
          exit={{ x: isMobile ? '100%' : 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'fixed md:static h-screen space-y-8 right-0 top-16 bottom-0 bg-card border-l shadow-lg z-40 overflow-y-auto',
            'w-64 md:w-64'
          )}
        >
          {/* زر X في الموبايل */}
          {isMobile && (
            <div className="flex justify-end p-3">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={cn(
                    'flex w-full text-right items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium whitespace-nowrap">{item.name}</span>
                  {isActive && <ChevronRight className="h-4 w-4 mr-auto" />}
                </button>
              );
            })}
          </nav>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
