import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { BookCard } from '@/components/BookCard';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useStore } from '@/store/useStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Button } from '@/components/ui/button';

import { BookX } from "lucide-react";


const BASE_API = import.meta.env.VITE_BASE_API;



const funnyMessages = {
  grade: {
    'الصف الأول الثانوي': ['أولى ثانوي... أهلاً بيك في بداية المشوار!'],
    'الصف الثاني الثانوي': ['سنة تانية... دي البروفة النهائية لتالتة!'],
    'الصف الثالث الثانوي': ['تالتة ثانوي بنفسها! شد حيلك!'],
  },
  subject: {
    'فيزياء': ['الفيزياء... المادة اللي بتوريك الدنيا ماشية إزاي ⚡'],
    'كيمياء': ['الكيمياء... كلها شوية عناصر ومعادلات 🧪'],
    default: ['اختيار ممتاز! ركز فيها وهتبقى سهلة 👌'],
  },
  category: {
    'كتب خارجية': ['الكتب الخارجية دايمًا مصدر قوي للفهم 💪'],
    'مذكرات مدرسين': ['مذكرات المدرسين فيها الزبدة 👌'],
  },
};

const getRandomMessage = (messages: string[]) =>
  messages[Math.floor(Math.random() * messages.length)];

export default function Books() {
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useStore();

  const [books, setBooks] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterGrade, setFilterGrade] = useState('all');
  const [filterTeacher, setFilterTeacher] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const gradeFromURL = params.get('grade');
    if (gradeFromURL) {
      setFilterGrade(gradeFromURL);
      toast.info(`تم عرض كتب ${gradeFromURL} `);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [booksRes, filtersRes] = await Promise.all([
          fetch(`${BASE_API}/user/books/getBooks`),
          fetch(`${BASE_API}/user/filter-options`),
        ]);

        const booksData = await booksRes.json();
        const filtersData = await filtersRes.json();

        if (booksData.status === 'success') {
          const transformed = booksData.books.map((b: any) => ({
            id: b.book_code,
            title: b.book_title,
            description: b.book_description,
            image: b.book_image,
            price: parseFloat(b.book_price),
            oldPrice:
              b.is_discount === 'yes' ? parseFloat(b.price_before_discount) : null,
            discount: b.is_discount === 'yes' ? parseInt(b.book_discount) : null,
            rating: parseInt(b.rating_stars),
            outOfStock: b.is_stock === 'no',
            category: b.categorie?.categorie_name,
            teacher: b.teacher?.teacher_name,
            subject: b.subject?.subject_name,
            grade:
              b.academic_year === 'first_secondary'
                ? 'الصف الأول الثانوي'
                : b.academic_year === 'second_secondary'
                  ? 'الصف الثاني الثانوي'
                  : 'الصف الثالث الثانوي',
          }));
          setBooks(transformed);
        }

        if (filtersData.status === 'success') {
          setSubjects(filtersData.subjects);
          setTeachers(filtersData.teachers);
          setCategories(filtersData.categories);
        }
      } catch (err) {
        console.error(err);
        toast.error('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const colors = [
      { r: 72, g: 149, b: 239 },
      { r: 155, g: 89, b: 182 },
      { r: 52, g: 231, b: 228 },
      { r: 255, g: 99, b: 132 },
    ];

    const aurora = Array.from({ length: 4 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 300 + Math.random() * 200,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
    }));

    const background =
      theme === 'dark'
        ? { from: '#0f172a', to: '#1e293b' }
        : { from: '#f9fafb', to: '#e8edf2' };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, background.from);
      gradient.addColorStop(1, background.to);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      aurora.forEach((a) => {
        const g = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.radius);
        g.addColorStop(0, `rgba(${a.color.r}, ${a.color.g}, ${a.color.b}, 0.4)`);
        g.addColorStop(1, 'transparent');
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        ctx.fill();

        a.x += a.speedX;
        a.y += a.speedY;

        if (a.x < -a.radius) a.x = width + a.radius;
        if (a.x > width + a.radius) a.x = -a.radius;
        if (a.y < -a.radius) a.y = height + a.radius;
        if (a.y > height + a.radius) a.y = -a.radius;
      });
      requestAnimationFrame(draw);
    };
    draw();
  }, [theme]);

  const handleFilterChange = (type: string, value: string) => {
    let message = '';
    switch (type) {
      case 'grade':
        setFilterGrade(value);
        if (funnyMessages.grade[value])
          message = getRandomMessage(funnyMessages.grade[value]);
        break;
      case 'teacher':
        setFilterTeacher(value);
        if (value !== 'all') message = `اختيار موفق! كتب ${value} تحت أمرك.`;
        break;
      case 'subject':
        setFilterSubject(value);
        if (funnyMessages.subject[value])
          message = getRandomMessage(funnyMessages.subject[value]);
        else if (value !== 'all')
          message = getRandomMessage(funnyMessages.subject.default);
        break;
      case 'category':
        setFilterCategory(value);
        if (funnyMessages.category[value])
          message = getRandomMessage(funnyMessages.category[value]);
        break;
    }
    if (message) toast.info(message);
  };

  let filtered = books;
  if (filterGrade !== 'all')
    filtered = filtered.filter((b) => b.grade === filterGrade);
  if (filterTeacher !== 'all')
    filtered = filtered.filter((b) => b.teacher === filterTeacher);
  if (filterSubject !== 'all')
    filtered = filtered.filter((b) => b.subject === filterSubject);
  if (filterCategory !== 'all')
    filtered = filtered.filter((b) => b.category === filterCategory);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen py-8 mt-40 lg:mt-24 relative">
      <canvas ref={canvasRef} className="fixed inset-0 z-0 w-full h-full pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3">📚 جميع الكتب</h1>
          <p className="text-muted-foreground text-lg">
            تصفح مجموعتنا الكاملة من الكتب والمذكرات لكل الصفوف
          </p>
        </div>

        {/* الفلاتر */}
        <div className="flex flex-wrap gap-4 mb-10 justify-center">
          <Select value={filterGrade} onValueChange={(v) => handleFilterChange('grade', v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="الصف الدراسي" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الصفوف</SelectItem>
              <SelectItem value="الصف الأول الثانوي">الصف الأول الثانوي</SelectItem>
              <SelectItem value="الصف الثاني الثانوي">الصف الثاني الثانوي</SelectItem>
              <SelectItem value="الصف الثالث الثانوي">الصف الثالث الثانوي</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterTeacher} onValueChange={(v) => handleFilterChange('teacher', v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر المدرس" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المدرسين</SelectItem>
              {teachers.map((t) => (
                <SelectItem key={t.teacher_code} value={t.teacher_name}>
                  {t.teacher_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterSubject} onValueChange={(v) => handleFilterChange('subject', v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر المادة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المواد</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.subject_code} value={s.subject_name}>
                  {s.subject_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={(v) => handleFilterChange('category', v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفئات</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.categorie_code} value={c.categorie_name}>
                  {c.categorie_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/*  عرض الكتب */}
        {loading ? (
          <div className="text-center text-lg py-20">⏳ جاري تحميل الكتب...</div>
        ) : filtered.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filtered.map((book) => (
              <motion.div key={book.id} variants={item}>
                <BookCard book={book} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-5">
            <div className="bg-muted rounded-full p-6 shadow-md">
              <BookX className="w-14 h-14 text-muted-foreground" />
            </div>

            <h2 className="text-2xl font-semibold mt-4">مفيش كتب متطابقة </h2>
            <p className="text-muted-foreground max-w-md">
              جرب تغيّر الفلاتر أو ابحث في فئة تانية — ممكن تلاقي اللي بتدور عليه
            </p>

            <Button
              className="mt-4 px-6 py-2 hero-gradient text-white font-medium rounded-xl shadow-md hover:opacity-90 transition-all duration-300 flex items-center gap-2"
              onClick={() => {
                setFilterGrade('all');
                setFilterTeacher('all');
                setFilterSubject('all');
                setFilterCategory('all');
                toast.success('تمت إعادة تعيين الفلاتر ');
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v6h6M20 20v-6h-6M4 14a8 8 0 0116 0 8 8 0 01-16 0z"
                />
              </svg>
              إعادة تعيين الفلاتر
            </Button>

          </div>

        )}
      </div>
    </div>
  );
}
