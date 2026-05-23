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
import { Search, Loader2, Edit, BookPlus, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BASE_API = import.meta.env.VITE_BASE_API;

interface Book {
  book_code: string;
  book_title: string;
  book_description: string;
  book_image: string;
  book_original_price: string;
  book_sale_price: string;
  book_discount: string;
  free_shipping: 'yes' | 'no';
  quantity_available: string;
  rating_stars: string;
  categorie: { categorie_code: string; categorie_name: string };
  subject: { subject_code: string; subject_name: string };
  teacher?: { teacher_code: string | null; teacher_name: string | null };
  academic_year: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  categorie_code: string;
  categorie_name: string;
}

interface Subject {
  subject_code: string;
  subject_name: string;
}

interface Teacher {
  teacher_code: string;
  teacher_name: string;
}

export default function BooksManagement() {
  const { admin } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const getArabicAcademicYear = (year: string) => {
    switch (year) {
      case 'first_secondary':
        return 'الصف الأول الثانوي';
      case 'second_secondary':
        return 'الصف الثاني الثانوي';
      case 'third_secondary':
        return 'الصف الثالث الثانوي';
      default:
        return 'غير محدد';
    }
  };

  const [formData, setFormData] = useState({
    book_title: '',
    book_description: '',
    book_original_price: '',
    book_sale_price: '',
    book_discount: '',
    free_shipping: 'no',
    quantity_available: '',
    rating_stars: '',
    categorie_code: '',
    subject_code: '',
    teacher_code: '',
    academic_year: 'first_secondary',
    book_image: null as File | null,
  });

  const fetchBooks = async () => {
    if (!admin?.admin_token) return;
    try {
      const res = await fetch(
        `${BASE_API}/admin/books/getBooks?admin_token=${admin.admin_token}`
      );
      const data = await res.json();
      if (data.status === 'success') setBooks(data.books);
      else toast.error('فشل تحميل الكتب');
    } catch {
      toast.error('خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!admin?.admin_token) return;
    const res = await fetch(
      `${BASE_API}/admin/categories/getCategories?admin_token=${admin.admin_token}`
    );
    const data = await res.json();
    if (data.status === 'success') setCategories(data.categories);
  };

  const fetchSubjects = async () => {
    if (!admin?.admin_token) return;
    const res = await fetch(
      `${BASE_API}/admin/subjects/getSubjects?admin_token=${admin.admin_token}`
    );
    const data = await res.json();
    if (data.status === 'success') setSubjects(data.subjects);
  };

  const fetchTeachers = async (subject_code: string) => {
    if (!admin?.admin_token || !subject_code) return;
    const res = await fetch(
      `${BASE_API}/admin/subjects/getSubjectTeachers?admin_token=${admin.admin_token}&subject_code=${subject_code}`
    );
    const data = await res.json();
    if (data.status === 'success') setTeachers(data.teachers);
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
    fetchSubjects();
  }, [admin]);

  useEffect(() => {
    if (formData.subject_code) fetchTeachers(formData.subject_code);
  }, [formData.subject_code]);

  const handleDelete = async (book_code: string) => {
    if (!admin?.admin_token) return toast.error('بيانات المسؤول غير متوفرة');

    try {
      const form = new FormData();
      form.append('admin_token', admin.admin_token);
      form.append('book_code', book_code);

      const res = await fetch(`${BASE_API}/admin/books/deleteBook`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();

      if (data.status === 'success') {
        toast.success('تم حذف الكتاب بنجاح');
        setBooks((prev) => prev.filter((b) => b.book_code !== book_code));
      } else toast.error('فشل حذف الكتاب');
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleSave = async () => {
    if (!admin?.admin_token) return toast.error('بيانات المسؤول غير متوفرة');

    const {
      book_title,
      book_description,
      book_original_price,
      book_sale_price,
      book_discount,
      free_shipping,
      quantity_available,
      rating_stars,
      categorie_code,
      subject_code,
      academic_year,
    } = formData;

    if (
      !book_title ||
      !book_description ||
      !book_original_price ||
      !book_sale_price ||
      !categorie_code ||
      !subject_code
    )
      return toast.error('يرجى إدخال جميع الحقول المطلوبة');

    if (Number(book_sale_price) < Number(book_original_price))
      return toast.error('سعر البيع لا يمكن أن يكون أعلى من السعر الأصلي');

    if (!editingBook && !formData.book_image) {
      return toast.error('يرجى اختيار صورة للكتاب');
    }

    const form = new FormData();
    form.append('admin_token', admin.admin_token);
    form.append('book_title', book_title);
    form.append('book_description', book_description);
    form.append('book_original_price', book_original_price);
    form.append('book_sale_price', book_sale_price);
    form.append('book_discount', book_discount || '0');
    form.append('free_shipping', free_shipping);
    form.append('quantity_available', quantity_available);
    form.append('rating_stars', rating_stars);
    form.append('categorie_code', categorie_code);
    form.append('subject_code', subject_code);
    if (formData.teacher_code) form.append('teacher_code', formData.teacher_code);
    form.append('academic_year', academic_year);

    // إرسال الصورة فقط إذا تم اختيار ملف جديد
    if (formData.book_image) form.append('book_image', formData.book_image);

    try {
      const endpoint = editingBook
        ? `${BASE_API}/admin/books/updateBook`
        : `${BASE_API}/admin/books/addBook`;

      if (editingBook) form.append('book_code', editingBook.book_code);

      const res = await fetch(endpoint, { method: 'POST', body: form });
      const data = await res.json();

      if (data.status === 'success') {
        toast.success(editingBook ? 'تم تحديث الكتاب' : 'تم إضافة الكتاب بنجاح');
        setIsDialogOpen(false);
        setEditingBook(null);
        resetForm();
        fetchBooks();
      } else toast.error('فشل حفظ البيانات');
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  // 3. تحديث دالة ResetForm
  const resetForm = () => {
    setFormData({
      book_title: '',
      book_description: '',
      book_original_price: '',
      book_sale_price: '',
      book_discount: '',
      free_shipping: 'no',
      quantity_available: '',
      rating_stars: '',
      categorie_code: '',
      subject_code: '',
      teacher_code: '',
      academic_year: 'first_secondary',
      book_image: null,
    });
    setImagePreview(null); // إعادة تعيين المعاينة
  };

  const filteredBooks = books.filter(
    (b) =>
      b.book_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.book_code.includes(searchQuery)
  );

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-20 text-primary">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        جاري تحميل الكتب...
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">إدارة الكتب</h1>
          <p className="text-muted-foreground">إجمالي الكتب: {books.length}</p>
        </div>

        {/* 4. تحديث منطق إغلاق وحفظ الفورم */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingBook(null);
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="hero-gradient gap-2">
              <BookPlus className="h-4 w-4" />
              إضافة كتاب
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBook ? 'تعديل بيانات الكتاب' : 'إضافة كتاب جديد'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>عنوان الكتاب *</Label>
                <Input
                  className="mt-2"
                  value={formData.book_title}
                  onChange={(e) =>
                    setFormData({ ...formData, book_title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>الوصف *</Label>
                <Input
                  className="mt-2"
                  value={formData.book_description}
                  onChange={(e) =>
                    setFormData({ ...formData, book_description: e.target.value })
                  }
                />
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>السعر الأصلي *</Label>
                  <Input
                    type="number"
                    className="mt-2"
                    value={formData.book_original_price}
                    onChange={(e) =>
                      setFormData({ ...formData, book_original_price: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>سعر البيع *</Label>
                  <Input
                    type="number"
                    className="mt-2"
                    value={formData.book_sale_price}
                    onChange={(e) =>
                      setFormData({ ...formData, book_sale_price: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Discount & Quantity */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>نسبة الخصم (%)</Label>
                  <Input
                    type="number"
                    className="mt-2"
                    value={formData.book_discount}
                    onChange={(e) =>
                      setFormData({ ...formData, book_discount: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>الكمية المتاحة *</Label>
                  <Input
                    type="number"
                    className="mt-2"
                    value={formData.quantity_available}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity_available: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Free Shipping & Rating */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>الشحن المجاني</Label>
                  <Select
                    value={formData.free_shipping}
                    onValueChange={(v) => setFormData({ ...formData, free_shipping: v })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="اختر" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">نعم</SelectItem>
                      <SelectItem value="no">لا</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>تقييم النجوم (1–5)</Label>
                  <Input
                    type="number"
                    className="mt-2"
                    min={1}
                    max={5}
                    value={formData.rating_stars}
                    onChange={(e) =>
                      setFormData({ ...formData, rating_stars: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Category & Subject */}
              <div>
                <Label>الفئة *</Label>
                <Select
                  value={formData.categorie_code}
                  onValueChange={(v) => setFormData({ ...formData, categorie_code: v })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.categorie_code} value={c.categorie_code}>
                        {c.categorie_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>المادة *</Label>
                <Select
                  value={formData.subject_code}
                  onValueChange={(v) => setFormData({ ...formData, subject_code: v })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="اختر المادة" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.subject_code} value={s.subject_code}>
                        {s.subject_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Teacher (optional) */}
              <div>
                <Label>المدرس (اختياري)</Label>
                <Select
                  value={formData.teacher_code}
                  onValueChange={(v) => setFormData({ ...formData, teacher_code: v })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="اختر المدرس" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.teacher_code} value={t.teacher_code}>
                        {t.teacher_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Academic year */}
              <div>
                <Label>العام الدراسي</Label>
                <Select
                  value={formData.academic_year}
                  onValueChange={(v) => setFormData({ ...formData, academic_year: v })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first_secondary">أولى ثانوي</SelectItem>
                    <SelectItem value="second_secondary">ثانية ثانوي</SelectItem>
                    <SelectItem value="third_secondary">ثالثة ثانوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 5. واجهة رفع الصورة الجديدة */}
              <div>
                <Label>صورة الكتاب {editingBook ? '(اختياري)' : '*'}</Label>
                <Label
                  htmlFor="book-image-upload"
                  className="mt-2 flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="معاينة"
                      className="h-28 w-auto rounded-md object-cover"
                    />
                  ) : (
                    <UploadCloud className="h-10 w-10 text-muted-foreground" />
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formData.book_image
                      ? formData.book_image.name
                      : 'اضغط أو اسحب الصورة هنا'}
                  </p>
                  {editingBook && !formData.book_image && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      اترك الحقل فارغاً لاستخدام الصورة القديمة
                    </p>
                  )}
                </Label>
                <input
                  id="book-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData({ ...formData, book_image: file });
                    if (file) {
                      setImagePreview(URL.createObjectURL(file));
                    } else {
                      // If user cancels, revert to the original image preview
                      setImagePreview(editingBook ? editingBook.book_image : null);
                    }
                  }}
                />
              </div>

              <Button onClick={handleSave} className="w-full mt-4">
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
          placeholder="ابحث عن كتاب..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Books List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>قائمة الكتب</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBooks.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              لا توجد نتائج مطابقة
            </p>
          ) : (
            <>
              {/* 6. الجدول للشاشات الكبيرة */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b">

                      <th className="p-2">الصورة</th>
                      <th className="p-2">العنوان</th>
                      <th className="p-2">المادة</th>
                      <th className="p-2">الفئة</th>
                      <th className="p-2">الصف</th>
                      <th className="p-2">السعر</th>
                      <th className="p-2">المخزون</th>
                      <th className="p-2 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map((b) => (
                      <tr
                        key={b.book_code}
                        className="border-b hover:bg-muted/40 transition">
                        <td className="p-2">
                          <img
                            src={b.book_image}
                            alt={b.book_title}
                            className="h-16 w-12 rounded-md object-cover"
                          />
                        </td>
                        <td className="p-2">{b.book_title}</td>
                        <td className="p-2">{b.subject.subject_name}</td>
                        <td className="p-2">{b.categorie.categorie_name}</td>
                        <td className="p-2">{getArabicAcademicYear(b.academic_year)}</td>

                        <td className="p-2">{b.book_sale_price} ج.م</td>
                        <td className="p-2">{b.quantity_available}</td>
                        <td className="p-2 text-center flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {

                              setEditingBook(b);
                              setFormData({
                                ...formData,
                                book_title: b.book_title,
                                book_description: b.book_description,
                                book_original_price: b.book_original_price,
                                book_sale_price: b.book_sale_price,
                                book_discount: b.book_discount,
                                free_shipping: b.free_shipping,
                                quantity_available: b.quantity_available,
                                rating_stars: b.rating_stars,
                                categorie_code: b.categorie.categorie_code,
                                subject_code: b.subject.subject_code,
                                teacher_code: b.teacher?.teacher_code || '',
                                academic_year: b.academic_year,
                                book_image: null,
                              });
                              setImagePreview(b.book_image); // عرض الصورة الحالية
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <ConfirmDeleteDialog
                            title="تأكيد الحذف"
                            description="هل أنت متأكد أنك تريد حذف هذا الكتاب؟"
                            onConfirm={() => handleDelete(b.book_code)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 8. الكروت الجديدة للشاشات الصغيرة */}
              <div className="md:hidden space-y-4">
                {filteredBooks.map((b) => (
                  <motion.div
                    key={b.book_code}
                    variants={fadeIn}
                    initial="hidden"
                    animate="show"
                    layout
                  >
                    <Card className="overflow-hidden shadow-md border">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={b.book_image}
                            alt={b.book_title}
                            className="h-32 w-24 rounded-md object-cover border"
                          />
                          <div className="flex-1 space-y-1.5">
                            <h3 className="font-bold text-lg">{b.book_title}</h3>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-bold text-primary">
                                {b.book_sale_price} ج.م
                              </span>
                              {Number(b.book_discount) > 0 && (
                                <span className="text-sm text-muted-foreground line-through">
                                  {b.book_original_price} ج.م
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              المخزون: {b.quantity_available}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {b.teacher?.teacher_name
                                ? b.teacher.teacher_name
                                : 'لا يوجد مدرس'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                          <Badge variant="secondary">{b.subject.subject_name}</Badge>
                          <Badge variant="outline">{b.categorie.categorie_name}</Badge>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              // 9. تحديث زر التعديل في الكارت
                              setEditingBook(b);
                              setFormData({
                                ...formData,
                                book_title: b.book_title,
                                book_description: b.book_description,
                                book_original_price: b.book_original_price,
                                book_sale_price: b.book_sale_price,
                                book_discount: b.book_discount,
                                free_shipping: b.free_shipping,
                                quantity_available: b.quantity_available,
                                rating_stars: b.rating_stars,
                                categorie_code: b.categorie.categorie_code,
                                subject_code: b.subject.subject_code,
                                teacher_code: b.teacher?.teacher_code || '',
                                academic_year: b.academic_year,
                                book_image: null,
                              });
                              setImagePreview(b.book_image);
                              setIsDialogOpen(true);
                              s
                            }}
                          >
                            <Edit className="h-4 w-4 ml-2" />
                            تعديل
                          </Button>
                          <ConfirmDeleteDialog
                            title="تأكيد الحذف"
                            description="هل أنت متأكد أنك تريد حذف هذا الكتاب؟"
                            onConfirm={() => handleDelete(b.book_code)}
                          />
                        </div>
                      </CardContent>
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