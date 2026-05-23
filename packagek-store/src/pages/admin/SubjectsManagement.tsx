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
import { Search, Loader2, Edit, FolderPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const BASE_API = import.meta.env.VITE_BASE_API;

interface Subject {
    subject_code: string;
    subject_name: string;
    created_at: string;
    updated_at: string;
}

interface Teacher {
    teacher_code: string;
    teacher_name: string;
}

export default function SubjectsManagement() {
    const { admin } = useAuth();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [formData, setFormData] = useState({ subject_name: '' });
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isTeachersDialogOpen, setIsTeachersDialogOpen] = useState(false);

    // === Fetch Subjects ===
    const fetchSubjects = async () => {
        if (!admin?.admin_token) return;
        try {
            const res = await fetch(`${BASE_API}/admin/subjects/getSubjects?admin_token=${admin.admin_token}`);
            const data = await res.json();

            if (data.status === 'success') {
                setSubjects(data.subjects);
            } else {
                toast.error('فشل تحميل المواد');
            }
        } catch (error) {
            console.error(error);
            toast.error('خطأ في الاتصال بالسيرفر');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, [admin]);

    // === Delete ===
    const handleDelete = async (subjectCode: string) => {
        if (!admin?.admin_token) return toast.error('بيانات المسؤول غير متوفرة');
        try {
            const form = new FormData();
            form.append('admin_token', admin.admin_token);
            form.append('subject_code', subjectCode);

            const res = await fetch(`${BASE_API}/admin/subjects/deleteSubject`, {
                method: 'POST',
                body: form,
            });
            const data = await res.json();

            if (data.status === 'success') {
                toast.success('تم حذف المادة بنجاح');
                setSubjects((prev) => prev.filter((s) => s.subject_code !== subjectCode));
            } else {
                toast.error('فشل حذف المادة');
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء الحذف');
        }
    };

    // === Add / Update ===
    const handleSave = async () => {
        if (!admin?.admin_token) return toast.error('بيانات المسؤول غير متوفرة');
        if (!formData.subject_name) return toast.error('الرجاء إدخال اسم المادة');

        const form = new FormData();
        form.append('admin_token', admin.admin_token);
        form.append('subject_name', formData.subject_name);

        try {
            const endpoint = editingSubject
                ? `${BASE_API}/admin/subjects/updateSubject`
                : `${BASE_API}/admin/subjects/addSubject`;

            if (editingSubject) form.append('subject_code', editingSubject.subject_code);

            const res = await fetch(endpoint, {
                method: 'POST',
                body: form,
            });
            const data = await res.json();

            if (data.status === 'success') {
                toast.success(editingSubject ? 'تم تحديث المادة' : 'تم إضافة مادة جديدة بنجاح');
                setIsDialogOpen(false);
                setEditingSubject(null);
                setFormData({ subject_name: '' });
                fetchSubjects();
            } else {
                toast.error('فشل حفظ البيانات');
            }
        } catch (error) {
            console.error(error);
            toast.error('خطأ أثناء الحفظ');
        }
    };

    // === Get Teachers for Subject ===
    const fetchSubjectTeachers = async (subject_code: string) => {
        if (!admin?.admin_token) return;
        try {
            const res = await fetch(
                `${BASE_API}/admin/subjects/getSubjectTeachers?admin_token=${admin.admin_token}&subject_code=${subject_code}`
            );
            const data = await res.json();

            if (data.status === 'success') {
                setTeachers(data.teachers || []);
                setIsTeachersDialogOpen(true);
            } else {
                toast.error('فشل تحميل المعلمين');
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء تحميل المعلمين');
        }
    };

    const filteredSubjects = subjects.filter((s) =>
        s.subject_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fadeIn = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 text-primary">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                جاري تحميل المواد...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">إدارة المواد</h1>
                    <p className="text-muted-foreground">إجمالي المواد: {subjects.length}</p>
                </div>

                {/* Dialog Add/Edit */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="hero-gradient gap-2">
                            <FolderPlus className="h-4 w-4" />
                            إضافة مادة
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingSubject ? 'تعديل المادة' : 'إضافة مادة جديدة'}</DialogTitle>
                            <DialogDescription>
                                {editingSubject ? 'قم بتحديث اسم المادة أدناه' : 'أدخل اسم المادة الجديدة'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label>اسم المادة *</Label>
                                <Input
                                    className="mt-2"
                                    value={formData.subject_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, subject_name: e.target.value })
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
                    placeholder="ابحث عن مادة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                />
            </div>

            {/* Table */}
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle>قائمة المواد</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredSubjects.length === 0 ? (
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
                                            <th className="p-2">اسم المادة</th>
                                            <th className="p-2">تاريخ الإضافة</th>
                                            <th className="p-2 text-center">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSubjects.map((s) => (
                                            <tr
                                                key={s.subject_code}
                                                className="border-b hover:bg-muted/40 transition"
                                            >
                                                <td className="p-2">{s.subject_code}</td>
                                                <td className="p-2">{s.subject_name}</td>
                                                <td className="p-2">
                                                    {new Date(s.created_at).toLocaleDateString('ar-EG')}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setEditingSubject(s);
                                                                setFormData({ subject_name: s.subject_name });
                                                                setIsDialogOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => fetchSubjectTeachers(s.subject_code)}
                                                        >
                                                            <Users className="h-4 w-4" />
                                                        </Button>

                                                        <ConfirmDeleteDialog
                                                            onConfirm={() => handleDelete(s.subject_code)}
                                                            title={`حذف ${s.subject_name}`}
                                                            description={`هل أنت متأكد من حذف المادة "${s.subject_name}"؟`}
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
                                {filteredSubjects.map((s) => (
                                    <motion.div
                                        key={s.subject_code}
                                        variants={fadeIn}
                                        initial="hidden"
                                        animate="show"
                                    >
                                        <Card className="p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-semibold text-lg">{s.subject_name}</h3>
                                                <Badge variant="outline">مادة</Badge>
                                            </div>
                                            <p>📘 {s.subject_code}</p>
                                            <p>📅 {new Date(s.created_at).toLocaleDateString('ar-EG')}</p>
                                            <div className="flex justify-end mt-3 gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingSubject(s);
                                                        setFormData({ subject_name: s.subject_name });
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    تعديل
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => fetchSubjectTeachers(s.subject_code)}
                                                >
                                                    المعلمون
                                                </Button>
                                                <ConfirmDeleteDialog
                                                    onConfirm={() => handleDelete(s.subject_code)}
                                                    title={`حذف ${s.subject_name}`}
                                                    description={`هل أنت متأكد من حذف المادة "${s.subject_name}"؟`}
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

            {/* Dialog: Subject Teachers */}
            <Dialog open={isTeachersDialogOpen} onOpenChange={setIsTeachersDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>قائمة المعلمين</DialogTitle>
                    </DialogHeader>

                    {teachers.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                            لا يوجد معلمون مرتبطون بهذه المادة
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {teachers.map((t) => (
                                <li
                                    key={t.teacher_code}
                                    className="p-2 border rounded-md flex justify-between items-center"
                                >
                                    <span>{t.teacher_name}</span>
                                    <Badge variant="secondary">مدرس</Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
