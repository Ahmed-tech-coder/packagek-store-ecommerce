import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const BASE_API = import.meta.env.VITE_BASE_API || 'https://api.packadgek.com';

export default function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    confirmPhone: '',
    academicYear: '',
    password: '',
    confirmPassword: '',
  });

  const academicYears = [
    { label: 'الأول الثانوي', value: 'first_secondary' },
    { label: 'الثاني الثانوي', value: 'second_secondary' },
    { label: 'الثالث الثانوي', value: 'third_secondary' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phone !== formData.confirmPhone) {
      toast.error('رقم الهاتف غير متطابق');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('كلمة المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append('first_name', formData.firstName);
      data.append('last_name', formData.lastName);
      data.append('phone_number', formData.phone);
      data.append('password', formData.password);
      data.append('confirm_password', formData.confirmPassword);
      data.append('academic_year', formData.academicYear);

      const response = await fetch(`${BASE_API}/user/register`, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result?.message || 'حدث خطأ أثناء إنشاء الحساب');
        return;
      }

      toast.success('تم إنشاء الحساب بنجاح!');
      navigate('/login');
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 mt-40 lg:mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="hero-gradient p-3 rounded-xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Packjack Store</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
            <CardDescription>املأ البيانات التالية لإنشاء حسابك</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* قسم الأسماء المعدل */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم الأول *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="مثال: أحمد مجدي ربيع"
                    required
                    className="focus-visible:ring-red-400" 
                  />

                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[11px] font-medium text-red-500 flex items-center gap-1 mt-1"
                  >
                    <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                    يرجى كتابة الاسم ثلاثياً كما هو في البطاقة/الشهادة
                  </motion.p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">اسم العائلة *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="اسم العائلة"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="01xxxxxxxxx"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPhone">تأكيد رقم الهاتف *</Label>
                  <Input
                    id="confirmPhone"
                    name="confirmPhone"
                    type="tel"
                    value={formData.confirmPhone}
                    onChange={handleChange}
                    placeholder="01xxxxxxxxx"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYear">العام الدراسي *</Label>
                <Select
                  value={formData.academicYear}
                  onValueChange={(value) =>
                    setFormData({ ...formData, academicYear: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العام الدراسي" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Password Fields with Eye icons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <Label htmlFor="password">كلمة المرور *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full hero-gradient"
                size="lg"
                disabled={loading}
              >
                {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  لديك حساب بالفعل؟{' '}
                  <Link
                    to="/login"
                    className="text-primary hover:underline font-semibold"
                  >
                    تسجيل الدخول
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
