import { useStore } from '@/store/useStore';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, BookOpen, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import type { Book } from '@/pages/home/Index';
import { useState } from 'react';

const BASE_API = import.meta.env.VITE_BASE_API;

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const { user } = useAuth();
  const { addToCart: localAddToCart } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const increase = () => setQuantity((q) => Math.min(q + 1, 10));
  const decrease = () => setQuantity((q) => Math.max(q - 1, 1));

  const handleAddToCart = async () => {
    if (!user?.user_token) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('user_token', user.user_token);
      formData.append('book_code', book.id);
      formData.append('quantity', quantity.toString());

      const res = await fetch(`${BASE_API}/user/cart/addToCart`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.status === 'success') {
        localAddToCart(book);
        toast.success('تمت الإضافة إلى السلة', {
          description: `${book.title} (${quantity}x)`,
        });
      } else {
        toast.error(data.message || 'حدث خطأ أثناء الإضافة إلى السلة');
      }
    } catch (error) {
      console.error(error);
      toast.error('تعذر الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group bg-white dark:bg-card rounded-2xl overflow-hidden border border-muted shadow-sm hover:shadow-md transition-all"
    >
      <div className="relative">
        <Link to={`/book/${book.id}`}>
          <div className="relative aspect-[3/4] bg-muted overflow-hidden">
            <img
              src={book.image}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {book.discount && (
              <Badge className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold shadow-md">
                خصم {book.discount}%
              </Badge>
            )}

            {book.subject && (
              <Badge className="absolute top-3 left-3 flex items-center gap-1 bg-primary text-white">
                <BookOpen className="h-3.5 w-3.5" />
                {book.subject}
              </Badge>
            )}
          </div>
        </Link>
      </div>

      <div className="p-4 space-y-3">
        <Link to={`/book/${book.id}`}>
          <div className="flex justify-between">
            <h3 className="font-semibold text-sm md:text-base line-clamp-2 leading-tight hover:text-primary transition-colors">
              {book.title}
            </h3>

            {book.category && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 mb-1">
                {book.category}
              </Badge>
            )}
          </div>

          <div className="flex justify-between text-xs text-muted-foreground mt-3 mb-2 font-semibold">
            {book.teacher && <span>👨‍🏫 {book.teacher}</span>}
          </div>
        </Link>

        {/* السعر */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-lg text-primary">{book.price} ج.م</p>
            {book.oldPrice && (
              <p className="text-xs text-muted-foreground line-through">
                {book.oldPrice} ج.م
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-4 w-4 fill-yellow-400" />
            <span className="text-xs">{book.rating}</span>
          </div>
        </div>

        {/* العداد  */}
        <div className="flex items-center justify-between border rounded-lg px-2 py-1 mt-2 w-fit mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={decrease}
            disabled={quantity === 1}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <span className="font-semibold mx-2 min-w-[20px] text-center">
            {quantity}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={increase}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={handleAddToCart}
          className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-sm"
          disabled={book.isOutOfStock || loading}

        >
          <ShoppingCart className="h-4 w-4" />
          {loading ? 'جاري الإضافة...' : book.isOutOfStock ? 'غير متوفر' : 'أضف إلى السلة'}
        </Button>

      </div>
    </motion.div>
  );
}
