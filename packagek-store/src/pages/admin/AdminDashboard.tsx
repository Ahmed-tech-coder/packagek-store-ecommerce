import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  ShoppingCart,
  Banknote,
  Percent,
  Layers,
  UserPlus,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const BASE_API = import.meta.env.VITE_BASE_API;

interface StatItem {
  name: string;
  short_name: string;
  value: number;
}

export default function AdminDashboard() {
  const { admin, logout } = useAuth();
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!admin?.admin_token) return;

      try {
        const res = await fetch(
          `${BASE_API}/admin/getStatistics?admin_token=${admin.admin_token}`
        );
        const data = await res.json();

        if (data.status === 'success') {
          setStats(data.statistics);
        }
        else if (data.reason === 'unauthorized') {
          logout();
          toast.error('انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى');
        } 
        else {
          console.error('Error fetching statistics:', data);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [admin]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-primary">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-lg">جاري تحميل البيانات...</span>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <p className="text-center py-10 text-muted-foreground text-lg">
        لا توجد بيانات متاحة حاليًا
      </p>
    );
  }

  const icons: Record<string, any> = {
    total_users: Users,
    total_teachers: UserPlus,
    total_subjects: BookOpen,
    total_categories: Layers,
    total_books: BookOpen,
    total_orders: ShoppingCart,
    total_paid_orders: CheckCircle,
    total_revenue: Banknote,
    pending_revenue: Percent,
    new_users_this_month: Users,
    users_with_purchases: ShoppingCart,
    books_with_discount: Percent,
  };

  const colors = [
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-yellow-500',
    'from-red-500 to-rose-500',
    'from-indigo-500 to-blue-400',
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8">
      {/* العنوان */}
      <div>
        <h1 className="text-3xl font-bold mb-1">لوحة التحكم</h1>
        <p className="text-muted-foreground">نظرة سريعة على نشاط النظام</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = icons[stat.short_name] || Users;
          const color = colors[index % colors.length];
          return (
            <motion.div key={index} variants={item}>
              <Card className="relative overflow-hidden group border-none shadow-md hover:shadow-xl transition-all duration-300">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity`}
                />
                <CardContent className="p-6 flex flex-col justify-between h-full relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-background/40 to-background/20 rounded-xl backdrop-blur-md">
                      <Icon className={`h-6 w-6 text-primary`} />
                    </div>
                    <span className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium text-right">
                    {stat.name}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
