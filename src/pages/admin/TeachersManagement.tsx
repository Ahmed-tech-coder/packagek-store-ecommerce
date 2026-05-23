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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BASE_API = import.meta.env.VITE_BASE_API;

interface Teacher {
    teacher_code: string;
    teacher_name: string;
    subject_code: string;
    subject_name: string;
    created_at: string;
}

interface Subject {
    subject_code: string;
    subject_name: string;
}

export default function TeachersManagement() {
    const { admin } = useAuth();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [formData, setFormData] = useState({ teacher_name: '', subject_code: '' });

    // === Fetch Teachers ===
    const fetchTeachers = async () => {
        if (!admin?.admin_token) return;
        try {
            const res = await fetch(`${BASE_API}/admin/teachers/getTeachers?admin_token=${admin.admin_token}`);
            const data = await res.json();

            if (data.status === 'success') {
                setTeachers(data.teachers);
            } else {
                toast.error('فشل تحميل قائمة المعلمين');
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء تحميل المعلمين');
        } finally {
            setLoading(false);
        }
    };

    // === Fetch Subjects (for selector) ===
    const fetchSubjects = async () => {
        if (!admin?.admin_token) return;
        try {
            const res = await fetch(`${BASE_API}/admin/subjects/getSubjects?admin_token=${admin.admin_token}`);
            const data = await res.json();

            if (data.status === 'success') {
                setSubjects(data.subjects);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTeachers();
        fetchSubjects();
    }, [admin]);

    // === Delete ===
    const handleDelete = async (teacherCode: string) => {
        if (!admin?.admin_token) return toast.error('بيانات المسؤول غير متوفرة');
        try {
            const form = new FormData();
            form.append('admin_token', admin.admin_token);
            form.append('teacher_code', teacherCode);

            const res = await fetch(`${BASE_API}/admin/teachers/deleteTeacher`, {
                method: 'POST',
                body: form,
            });
            const data = await res.json();

            if (data.status === 'success') {
                toast.success('تم حذف المعلم بنجاح');
                setTeachers((prev) => prev.filter((t) => t.teacher_code !== teacherCode));
            } else {
                toast.error('فشل حذف المعلم');
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء الحذف');
        }
    };

    // === Add / Update ===
    const handleSave = async () => {
        if (!admin?.admin_token) return toast.error('بيانات المسؤول غير متوفرة');
        if (!formData.teacher_name) return toast.error('الرجاء إدخال اسم المعلم');
        if (!formData.subject_code) return toast.error('الرجاء اختيار المادة');

        const form = new FormData();
        form.append('admin_token', admin.admin_token);
        form.append('teacher_name', formData.teacher_name);
        form.append('subject_code', formData.subject_code);

        try {
            const endpoint = editingTeacher
                ? `${BASE_API}/admin/teachers/updateTeacher`
                : `${BASE_API}/admin/teachers/addTeacher`;

            if (editingTeacher) form.append('teacher_code', editingTeacher.teacher_code);

            const res = await fetch(endpoint, {
                method: 'POST',
                body: form,
            });
            const data = await res.json();

            if (data.status === 'success') {
                toast.success(editingTeacher ? 'تم تحديث بيانات المعلم' : 'تم إضافة المعلم بنجاح');
                setIsDialogOpen(false);
                setEditingTeacher(null);
                setFormData({ teacher_name: '', subject_code: '' });
                fetchTeachers();
            } else {
                toast.error('فشل حفظ البيانات');
            }
        } catch (error) {
            console.error(error);
            toast.error('خطأ أثناء الحفظ');
        }
    };

    const filteredTeachers = teachers.filter((t) =>
        t.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fadeIn = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 text-primary">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                جاري تحميل المعلمين...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">إدارة المعلمين</h1>
                    <p className="text-muted-foreground">إجمالي المعلمين: {teachers.length}</p>
                </div>

                {/* Dialog Add/Edit */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="hero-gradient gap-2">
                            <FolderPlus className="h-4 w-4" />
                            إضافة معلم
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingTeacher ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد'}</DialogTitle>
                            <DialogDescription>
                                {editingTeacher
                                    ? 'قم بتحديث بيانات المعلم أدناه'
                                    : 'أدخل بيانات المعلم الجديدة'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label>اسم المعلم *</Label>
                                <Input
                                    className="mt-2"
                                    value={formData.teacher_name}
                                    onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label>المادة *</Label>
                                <Select
                                    value={formData.subject_code}
                                    onValueChange={(value) => setFormData({ ...formData, subject_code: value })}
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="اختر المادة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject.subject_code} value={subject.subject_code}>
                                                {subject.subject_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                    placeholder="ابحث عن معلم..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                />
            </div>

            {/* Table */}
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle>قائمة المعلمين</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredTeachers.length === 0 ? (
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
                                            <th className="p-2">اسم المعلم</th>
                                            <th className="p-2">المادة</th>
                                            <th className="p-2">تاريخ الإضافة</th>
                                            <th className="p-2 text-center">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTeachers.map((t) => (
                                            <tr
                                                key={t.teacher_code}
                                                className="border-b hover:bg-muted/40 transition"
                                            >
                                                <td className="p-2 font-mono text-xs">{t.teacher_code}</td>
                                                <td className="p-2">{t.teacher_name}</td>
                                                <td className="p-2">{t.subject_name}</td>
                                                <td className="p-2">
                                                    {new Date(t.created_at).toLocaleDateString('ar-EG')}
                                                </td>
                                                <td className="p-2 text-center flex justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setEditingTeacher(t);
                                                            setFormData({
                                                                teacher_name: t.teacher_name,
                                                                subject_code: t.subject_code,
                                                            });
                                                            setIsDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>

                                                    <ConfirmDeleteDialog
                                                        onConfirm={() => handleDelete(t.teacher_code)}
                                                        title={`حذف ${t.teacher_name}`}
                                                        description={`هل أنت متأكد من حذف المعلم "${t.teacher_name}"؟`}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="block md:hidden space-y-4">
                                {filteredTeachers.map((t) => (
                                    <motion.div key={t.teacher_code} variants={fadeIn} initial="hidden" animate="show">
                                        <Card className="p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-semibold text-lg">{t.teacher_name}</h3>
                                                <Badge variant="outline">{t.subject_name}</Badge>
                                            </div>
                                            <p>📘 {t.teacher_code}</p>
                                            <p>📅 {new Date(t.created_at).toLocaleDateString('ar-EG')}</p>
                                            <div className="flex justify-end mt-3 gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingTeacher(t);
                                                        setFormData({
                                                            teacher_name: t.teacher_name,
                                                            subject_code: t.subject_code,
                                                        });
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    تعديل
                                                </Button>
                                                <ConfirmDeleteDialog
                                                    onConfirm={() => handleDelete(t.teacher_code)}
                                                    title={`حذف ${t.teacher_name}`}
                                                    description={`هل أنت متأكد من حذف المعلم "${t.teacher_name}"؟`}
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
