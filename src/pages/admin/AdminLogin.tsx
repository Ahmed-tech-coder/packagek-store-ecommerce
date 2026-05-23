import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const BASE_API = import.meta.env.VITE_BASE_API || 'https://api.packadgek.com';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const [formData, setFormData] = useState({
    phone_number: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone_number || !formData.password) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append('phone_number', formData.phone_number);
      data.append('password', formData.password);

      const response = await fetch(`${BASE_API}/admin/login`, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (!response.ok || result.status === 'error') {
        toast.error(result?.message || 'فشل تسجيل الدخول، تحقق من البيانات');
        return;
      }

      adminLogin(result);


      toast.success('تم تسجيل الدخول بنجاح!');
      navigate('/admin');
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="hero-gradient p-3 rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">لوحة تحكم الإدارة</h1>
          <p className="text-muted-foreground text-sm">
            Packjack Store Admin Panel
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">تسجيل دخول المسؤول</CardTitle>
            <CardDescription>
              أدخل بيانات الدخول للوصول إلى لوحة التحكم
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* رقم الهاتف */}
              <div className="space-y-2">
                <Label htmlFor="phone_number">رقم الهاتف</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="01xxxxxxxxx"
                  required
                />
              </div>

              {/* كلمة المرور */}
              <div className="space-y-2 relative">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full hero-gradient"
                size="lg"
                disabled={loading}
              >
                {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => navigate('/')}>
            العودة للموقع
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
