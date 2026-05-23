import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Loader2, Edit, UserPlus, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const BASE_API = import.meta.env.VITE_BASE_API;

interface Admin {
  admin_name: string;
  admin_code: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
}

export default function AdminsManagement() {
  const { admin } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    admin_name: '',
    phone_number: '',
    password: '',
  });

  // NEW: toggle for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const fetchAdmins = async () => {
    if (!admin?.admin_token) return;
    try {
      const res = await fetch(
        `${BASE_API}/admin/admins/getAdmins?admin_token=${admin.admin_token}`
      );
      const data = await res.json();

      if (data.status === 'success') {
        setAdmins(data.admins);
      } else {
        toast.error('فشل تحميل المسؤولين');
      }
    } catch (error) {
      console.error(error);
      toast.error('خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [admin]);

  const handleDelete = async (adminCode: string) => {
    if (!admin?.admin_token) return toast.error('بيانات المسؤول غير متوفرة');

    try {
      const form = new FormData();
      form.append('admin_token', admin.admin_token);
      form.append('admin_code', adminCode);

      const res = await fetch(`${BASE_API}/admin/admins/deleteAdmin`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();

      if (data.status === 'success') {
        toast.success('تم حذف المسؤول بنجاح');
        setAdmins((prev) => prev.filter((a) => a.admin_code !== adminCode));
      } else {
        toast.error('فشل حذف المسؤول');
      }
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleSave = async () => {
    if (!admin?.admin_token) return toast.error('بيانات المسؤول غير متوفرة');
    if (!formData.admin_name || !formData.phone_number)
      return toast.error('الرجاء إدخال جميع الحقول المطلوبة');

    const form = new FormData();
    form.append('admin_token', admin.admin_token);
    form.append('admin_name', formData.admin_name);
    form.append('phone_number', formData.phone_number);
    if (formData.password) form.append('password', formData.password);

    try {
      const endpoint = editingAdmin
        ? `${BASE_API}/admin/admins/updateAdmin`
        : `${BASE_API}/admin/admins/addAdmin`;

      if (editingAdmin) form.append('admin_code', editingAdmin.admin_code);

      const res = await fetch(endpoint, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();

      if (data.status === 'success') {
        toast.success(
          editingAdmin
            ? 'تم تحديث بيانات المسؤول'
            : 'تم إضافة مسؤول جديد بنجاح'
        );
        setIsDialogOpen(false);
        setEditingAdmin(null);
        setFormData({ admin_name: '', phone_number: '', password: '' });
        setShowPassword(false); // reset visibility on success/close
        fetchAdmins();
      } else {
        toast.error('فشل حفظ البيانات');
      }
    } catch (error) {
      console.error(error);
      toast.error('خطأ أثناء الحفظ');
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.admin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.phone_number.includes(searchQuery)
  );

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-primary">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        جاري تحميل المسؤولين...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            إدارة المسؤولين
          </h1>
          <p className="text-muted-foreground">
            إجمالي المسؤولين: {admins.length}
          </p>
        </div>

        {/* Dialog Add/Edit */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="hero-gradient gap-2">
              <UserPlus className="h-4 w-4" />
              إضافة مسؤول
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAdmin ? 'تعديل بيانات المسؤول' : 'إضافة مسؤول جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingAdmin
                  ? 'قم بتحديث بيانات المسؤول أدناه'
                  : 'املأ البيانات لإضافة مسؤول جديد'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label >اسم المسؤول *</Label>
                <Input
                  className='mt-2'
                  value={formData.admin_name}
                  onChange={(e) =>
                    setFormData({ ...formData, admin_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>رقم الهاتف *</Label>
                <Input
                  className='mt-2'
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>كلمة المرور {editingAdmin ? '(اختياري)' : '*'}</Label>

                {/* Password input with eye toggle */}
                <div className="relative">
                  <Input

                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    // give some right padding so the icon doesn't overlap (RTL may place icon differently)
                    className="pr-10 mt-2"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-[red]" />
                    ) : (
                      <Eye className="h-4 w-4 text-[red]" />
                    )}
                  </button>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                حفظ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث عن مسؤول..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>قائمة المسؤولين</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAdmins.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              لا توجد نتائج مطابقة
            </p>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2">الكود</th>
                      <th className="p-2">الاسم</th>
                      <th className="p-2">الهاتف</th>
                      <th className="p-2">تاريخ الإضافة</th>
                      <th className="p-2 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.map((a) => (
                      <tr
                        key={a.admin_code}
                        className="border-b hover:bg-muted/40 transition"
                      >
                        <td className="p-2">{a.admin_code}</td>
                        <td className="p-2">{a.admin_name}</td>
                        <td className="p-2">{a.phone_number}</td>
                        <td className="p-2">
                          {new Date(a.created_at).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingAdmin(a);
                                setFormData({
                                  admin_name: a.admin_name,
                                  phone_number: a.phone_number,
                                  password: '',
                                });
                                setShowPassword(false); // reset visibility when opening edit
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <ConfirmDeleteDialog
                              onConfirm={() => handleDelete(a.admin_code)}
                              title={`حذف ${a.admin_name}`}
                              description={`هل أنت متأكد من حذف المسؤول "${a.admin_name}"؟`}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="block md:hidden space-y-4">
                {filteredAdmins.map((a) => (
                  <motion.div
                    key={a.admin_code}
                    variants={fadeIn}
                    initial="hidden"
                    animate="show"
                  >
                    <Card className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-lg">{a.admin_name}</h3>
                        <Badge variant="outline">مسؤول</Badge>
                      </div>
                      <p>📱 {a.phone_number}</p>
                      <p>🧾 {a.admin_code}</p>
                      <p>
                        📅{' '}
                        {new Date(a.created_at).toLocaleDateString('ar-EG')}
                      </p>
                      <div className="flex justify-end mt-3 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingAdmin(a);
                            setFormData({
                              admin_name: a.admin_name,
                              phone_number: a.phone_number,
                              password: '',
                            });
                            setShowPassword(false);
                            setIsDialogOpen(true);
                          }}
                        >
                          تعديل
                        </Button>
                        <ConfirmDeleteDialog
                          onConfirm={() => handleDelete(a.admin_code)}
                          title={`حذف ${a.admin_name}`}
                          description={`هل أنت متأكد من حذف المسؤول "${a.admin_name}"؟`}
                        />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
