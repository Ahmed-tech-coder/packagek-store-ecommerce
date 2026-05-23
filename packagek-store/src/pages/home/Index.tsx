import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/BookCard';
import { BookOpen, GraduationCap, FileText, Star, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { toast } from 'sonner';


export interface Book {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  oldPrice: number | null;
  discount: number | null;
  rating: number;
  subject: string;
  outOfStock: string;
  category?: string;
  teacher?: string;
}

const BASE_API = import.meta.env.VITE_BASE_API;


export default function Index() {

  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  // ===== Three.js Background =====
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ===== Three.js Interactive Background =====
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 5;

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: '#00bcd4',
      transparent: true,
      opacity: 0.9,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      particlesMesh.rotation.y = elapsedTime * 0.1;
      particlesMesh.rotation.x = elapsedTime * 0.05;

      particlesMesh.rotation.y += mouseX * 0.05;
      particlesMesh.rotation.x += mouseY * 0.05;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);


  useEffect(() => {
    const fetchBooks = async () => {
      setLoadingBooks(true);
      try {
        const res = await fetch(`${BASE_API}/user/books/getBooks`);
        const data = await res.json();

        if (data.status === 'success' && Array.isArray(data.books)) {
          const transformedBooks: Book[] = data.books.map((book: any) => ({
            id: book.book_code,
            title: book.book_title,
            description: book.book_description,
            image: book.book_image,
            price: parseFloat(book.book_price),
            oldPrice: book.is_discount === 'yes' ? parseFloat(book.price_before_discount) : null,
            discount: book.is_discount === 'yes' ? parseInt(book.book_discount) : null,
            rating: parseInt(book.rating_stars),
            subject: book.subject?.subject_name || 'غير محدد',
            outOfStock: book.is_stock === 'no',
            category: book.categorie?.categorie_name,
            teacher: book.teacher?.teacher_name,
          }));

          setFeaturedBooks(transformedBooks.slice(0, 4));
        } else {
          toast.error('فشل تحميل الكتب');
        }
      } catch (error) {
        console.error('Error fetching books:', error);
        toast.error('حدث خطأ أثناء جلب الكتب');
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, []);


  // فئات المرحلة الثانوية
  const categories = [
    // ... (بيانات الفئات تبقى كما هي) ...
    {
      name: 'الصف الأول الثانوي',
      description: 'كل كتب ومذكرات الصف الأول الثانوي',
      icon: GraduationCap,
      path: '/category/اول-ثانوي',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'الصف الثاني الثانوي',
      description: 'كل كتب ومذكرات الصف الثاني الثانوي',
      icon: BookOpen,
      path: '/category/ثاني-ثانوي',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      name: 'الصف الثالث الثانوي',
      description: 'كل كتب ومذكرات الصف الثالث الثانوي',
      icon: FileText,
      path: '/category/ثالث-ثانوي',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  // Anims
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="relative min-h-screen mt-40 lg:mt-24 overflow-hidden">
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />

      {/* === Hero Section === */}
      <section className="relative hero-gradient text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              مكتبتك الإلكترونية الشاملة
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              أفضل الكتب والمذكرات لكل صف في الثانوية العامة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 text-lg px-8"
                asChild
              >
                <Link to="/books">
                  ابدأ التصفح
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* === تصفح حسب الفئة === */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">تصفح حسب الصف</h2>
            <p className="text-muted-foreground text-lg">
              اختر صفك وابدأ في التعلم من أفضل المصادر
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {categories.map((category) => (
              <motion.div key={category.name} variants={item}>
                <Link to={`/books?grade=${encodeURIComponent(category.name)}`}>
                  <div
                    className={`relative p-8 rounded-2xl bg-gradient-to-br ${category.gradient} text-white overflow-hidden group cursor-pointer transition-transform hover:scale-105`}
                  >
                    <category.icon className="h-12 w-12 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="text-white/90 mb-4">{category.description}</p>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      تصفح الآن
                      <ArrowLeft className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

          </motion.div>
        </div>
      </section>

      {/* === Featured Books === */}
      <section className="py-16 md:py-24 bg-muted/30 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            الكتب المميزة
          </motion.h2>
          <p className="text-muted-foreground text-lg mb-12">
            أحدث وأفضل الكتب المتوفرة لدينا
          </p>

          {/* --- تعديل: إضافة معالجة التحميل والبيانات --- */}
          {loadingBooks ? (
            <div className="text-center py-10">جاري تحميل الكتب...</div>
          ) : featuredBooks.length > 0 ? (
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {featuredBooks.map((book) => (
                <motion.div key={book.id} variants={item}>
                  <BookCard book={book} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              لا توجد كتب مميزة حاليًا.
            </div>
          )}
          {/* ----------------------------------------- */}

          <Button size="lg" variant="outline" asChild>
            <Link to="/books">
              عرض جميع الكتب
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* === Static Section === */}
      <section className="py-16 md:py-24 relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 max-w-3xl"
        >
          <Sparkles className="w-14 h-14 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">ليه تختار مكتبتنا؟</h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            لأننا مش مجرد موقع كتب — إحنا بوابتك للتفوق الحقيقي.
            <br />
            كل حاجة هنا معمولة بحب واهتمام بالتفاصيل، من الكتب، للمذكرات، لسهولة التصفح.
            هدفنا إنك تلاقي كل اللي محتاجه في مكان واحد، بسرعة وجودة وثقة.
          </p>
          <Button size="lg" asChild className="px-10 hero-gradient text-lg">
            <Link to="/about">اعرف أكتر عننا</Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}