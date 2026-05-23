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
import { Search, Loader2, Edit, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const BASE_API = import.meta.env.VITE_BASE_API;

interface Category {
    categorie_code: string;
    categorie_name: string;
    created_at: string;
    updated_at: string;
}

export default function CategoriesManagement() {
    const { admin } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ categorie_name: '' });

    // === Fetch Categories ===
    const fetchCategories = async () => {
        if (!admin?.admin_token) return;
        try {
            const res = await fetch(
                `${BASE_API}/admin/categories/getCategories?admin_token=${admin.admin_token}`
            );
            const data = await res.json();

            if (data.status === 'success') {
                setCategories(data.categories);
            } else {
                toast.error('فشل تحميل الفئات');
            }
        } catch (error) {
            console.error(error);
            toast.error('خطأ في الاتصال بالسيرفر');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [admin]);

    // === Delete ===
    const handleDelete = async (categorieCode: string) => {
        if (!admin?.admin_token) return toast.error('بيانات المسؤول غير متوفرة');
        try {
            const form = new FormData();
            form.append('admin_token', admin.admin_token);
            form.append('categorie_code', categorieCode);

            const res = await fetch(`${BASE_API}/admin/categories/deleteCategorie`, {
                method: 'POST',
                body: form,
            });
            const data = await res.json();

            if (data.status === 'success') {
                toast.success('تم حذف الفئة بنجاح');
                setCategories((prev) =>
                    prev.filter((c) => c.categorie_code !== categorieCode)
                );
            } else {
                toast.error('فشل حذف الفئة');
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء الحذف');
        }
    };

    // === Add / Update ===
    const handleSave = async () => {
        if (!admin?.admin_token) return toast.error('بيانات المسؤول غير متوفرة');
        if (!formData.categorie_name)
            return toast.error('الرجاء إدخال اسم الفئة');

        const form = new FormData();
        form.append('admin_token', admin.admin_token);
        form.append('categorie_name', formData.categorie_name);

        try {
            const endpoint = editingCategory
                ? `${BASE_API}/admin/categories/updateCategorie`
                : `${BASE_API}/admin/categories/addCategorie`;

            if (editingCategory)
                form.append('categorie_code', editingCategory.categorie_code);

            const res = await fetch(endpoint, {
                method: 'POST',
                body: form,
            });
            const data = await res.json();

            if (data.status === 'success') {
                toast.success(
                    editingCategory ? 'تم تحديث الفئة' : 'تم إضافة فئة جديدة بنجاح'
                );
                setIsDialogOpen(false);
                setEditingCategory(null);
                setFormData({ categorie_name: '' });
                fetchCategories();
            } else {
                toast.error('فشل حفظ البيانات');
            }
        } catch (error) {
            console.error(error);
            toast.error('خطأ أثناء الحفظ');
        }
    };

    const filteredCategories = categories.filter((c) =>
        c.categorie_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fadeIn = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 text-primary">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                جاري تحميل الفئات...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                        إدارة الفئات
                    </h1>
                    <p className="text-muted-foreground">
                        إجمالي الفئات: {categories.length}
                    </p>
                </div>

                {/* Dialog Add/Edit */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="hero-gradient gap-2">
                            <FolderPlus className="h-4 w-4" />
                            إضافة فئة
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingCategory
                                    ? 'قم بتحديث اسم الفئة أدناه'
                                    : 'أدخل اسم الفئة الجديدة'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label>اسم الفئة *</Label>
                                <Input
                                    className="mt-2"
                                    value={formData.categorie_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, categorie_name: e.target.value })
                                    }
                                />
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
                    placeholder="ابحث عن فئة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                />
            </div>

            {/* Table */}
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle>قائمة الفئات</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredCategories.length === 0 ? (
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
                                            <th className="p-2">تاريخ الإضافة</th>
                                            <th className="p-2 text-center">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCategories.map((c) => (
                                            <tr
                                                key={c.categorie_code}
                                                className="border-b hover:bg-muted/40 transition"
                                            >
                                                <td className="p-2">{c.categorie_code}</td>
                                                <td className="p-2">{c.categorie_name}</td>
                                                <td className="p-2">
                                                    {new Date(c.created_at).toLocaleDateString('ar-EG')}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setEditingCategory(c);
                                                                setFormData({
                                                                    categorie_name: c.categorie_name,
                                                                });
                                                                setIsDialogOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <ConfirmDeleteDialog
                                                            onConfirm={() =>
                                                                handleDelete(c.categorie_code)
                                                            }
                                                            title={`حذف ${c.categorie_name}`}
                                                            description={`هل أنت متأكد من حذف الفئة "${c.categorie_name}"؟`}
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
                                {filteredCategories.map((c) => (
                                    <motion.div
                                        key={c.categorie_code}
                                        variants={fadeIn}
                                        initial="hidden"
                                        animate="show"
                                    >
                                        <Card className="p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-semibold text-lg">
                                                    {c.categorie_name}
                                                </h3>
                                                <Badge variant="outline">فئة</Badge>
                                            </div>
                                            <p>🧾 {c.categorie_code}</p>
                                            <p>
                                                📅 {new Date(c.created_at).toLocaleDateString('ar-EG')}
                                            </p>
                                            <div className="flex justify-end mt-3 gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingCategory(c);
                                                        setFormData({
                                                            categorie_name: c.categorie_name,
                                                        });
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    تعديل
                                                </Button>
                                                <ConfirmDeleteDialog
                                                    onConfirm={() =>
                                                        handleDelete(c.categorie_code)
                                                    }
                                                    title={`حذف ${c.categorie_name}`}
                                                    description={`هل أنت متأكد من حذف الفئة "${c.categorie_name}"؟`}
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
