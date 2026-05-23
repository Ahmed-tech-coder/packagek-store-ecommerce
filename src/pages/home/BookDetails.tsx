import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookCard } from "@/components/BookCard";
import { ShoppingCart, Plus, Minus, Truck, Shield, Package } from "lucide-react";

const BASE_API = import.meta.env.VITE_BASE_API;

export default function BookDetails() {
  const { id } = useParams(); // book_code from URL
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart: localAddToCart } = useStore();

  const [book, setBook] = useState<any | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [loadingAdd, setLoadingAdd] = useState(false);

  const fetchBookData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_API}/user/books/getBookData?book_code=${id}`);
      const data = await res.json();

      if (data.status === "success" && data.book) {
        setBook(data.book);
        fetchRelatedBooks(data.book.subject?.subject_code);
      } else {
        toast.error("الكتاب غير موجود");
        navigate("/books");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تحميل بيانات الكتاب");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBooks = async (subjectCode: string) => {
    try {
      const res = await fetch(`${BASE_API}/user/books/getBooks`);
      const data = await res.json();
      if (data.status === "success") {
        const filtered = data.books
          .filter(
            (b: any) =>
              b.subject?.subject_code === subjectCode && b.book_code !== id
          )
          .slice(0, 4);
        setRelatedBooks(filtered);
      }
    } catch (err) {
      console.error("Error fetching related books", err);
    }
  };

  useEffect(() => {
    if (id) fetchBookData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user?.user_token) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }

    setLoadingAdd(true);

    try {
      const formData = new FormData();
      formData.append("user_token", user.user_token);
      formData.append("book_code", book.book_code);
      formData.append("quantity", quantity.toString());

      const res = await fetch(`${BASE_API}/user/cart/addToCart`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.status === "success") {
        localAddToCart({
          id: book.book_code,
          title: book.book_title,
          price: parseFloat(book.book_price),
          image: book.book_image,
          description: book.book_description,
        });

        toast.success("تمت الإضافة إلى السلة", {
          description: `${book.book_title} (${quantity}x)`,
        });
      } else {
        toast.error(data.message || "حدث خطأ أثناء الإضافة إلى السلة");
      }
    } catch (error) {
      console.error(error);
      toast.error("تعذر الاتصال بالسيرفر");
    } finally {
      setLoadingAdd(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-muted-foreground">
        ⏳ جاري تحميل بيانات الكتاب...
      </div>
    );

  if (!book)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <p className="text-xl font-semibold mb-2">الكتاب غير موجود</p>
        <Button onClick={() => navigate("/books")}>العودة للكتب</Button>
      </div>
    );

  const features = [
    { icon: Package, text: "كتاب إلكتروني عالي الجودة" },
    { icon: Truck, text: "تحميل فوري بعد الدفع" },
    { icon: Shield, text: "ضمان استرجاع المال" },
  ];

  return (
    <div className="min-h-screen py-8 mt-40 lg:mt-24">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <span>/</span>
          <Link to="/books" className="hover:text-primary">الكتب</Link>
          <span>/</span>
          <span className="text-foreground">{book.book_title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* صورة الكتاب */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-[4/4] rounded-2xl overflow-hidden bg-muted shadow-card-lg sticky top-8">
              <img
                src={book.book_image}
                alt={book.book_title}
                className="w-full h-full object-contain"
              />
              {book.is_discount === "yes" && (
                <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground font-bold text-lg px-4 py-2">
                  خصم {book.book_discount}%
                </Badge>
              )}
            </div>
          </motion.div>

          {/* تفاصيل الكتاب */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {book.book_title}
              </h1>
              <p className="text-xl text-muted-foreground">
                {book.teacher?.teacher_name || "مدرس غير محدد"}
              </p>
            </div>

            <Separator />

            {/* السعر */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold text-primary">
                  {book.book_price} ج.م
                </span>
                {book.is_discount === "yes" && (
                  <span className="text-xl text-muted-foreground line-through">
                    {book.price_before_discount} ج.م
                  </span>
                )}
              </div>
              {book.is_discount === "yes" && (
                <p className="text-accent font-semibold">
                  وفر {book.price_before_discount - book.book_price} ج.م
                </p>
              )}
            </div>

            {/* 🔢 التحكم في الكمية + الإضافة للسلة */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                  disabled={quantity === 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>

                <span className="text-lg font-semibold w-8 text-center">{quantity}</span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.min(q + 1, 10))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full hero-gradient text-lg gap-2"
                disabled={book.is_stock === "no" || loadingAdd}
              >
                <ShoppingCart className="h-5 w-5" />
                {loadingAdd
                  ? "جاري الإضافة..."
                  : book.is_stock === "yes"
                  ? "أضف للسلة"
                  : "غير متوفر"}
              </Button>
            </div>

            <Separator />

            {/* الوصف */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">عن الكتاب</h3>
              <p className="text-muted-foreground leading-relaxed">
                {book.book_description}
              </p>
            </div>

            <Separator />

            {/* المميزات */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* كتب مشابهة */}
        {relatedBooks.length > 0 && (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-8">📘 كتب مشابهة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBooks.map((relatedBook) => (
                <BookCard
                  key={relatedBook.book_code}
                  book={{
                    id: relatedBook.book_code,
                    title: relatedBook.book_title,
                    image: relatedBook.book_image,
                    price: parseFloat(relatedBook.book_price),
                    oldPrice:
                      relatedBook.is_discount === "yes"
                        ? parseFloat(relatedBook.price_before_discount)
                        : null,
                    discount:
                      relatedBook.is_discount === "yes"
                        ? parseInt(relatedBook.book_discount)
                        : null,
                    rating: parseInt(relatedBook.rating_stars),
                    outOfStock: relatedBook.is_stock === "no",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
