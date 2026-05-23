import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const BASE_API = import.meta.env.VITE_BASE_API;

interface CartItem {
  book_code: string;
  book_title: string;
  book_image: string;
  book_price: number;
  price_before_discount?: string;
  book_discount?: string;
  is_discount?: string;
  quantity_in_cart: string;
  item_total_price: number;
  teacher?: { teacher_name?: string | null };
  subject?: { subject_name?: string };
  categorie?: { categorie_name?: string };
}

interface CartData {
  items: CartItem[];
  total_items: number;
  delivery_price: string | null;
  reason_delivery_price: string;
  total_price: number;
}

export default function Cart() {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const invoice_id = params.get("invoice_id");

    if (invoice_id) {
      checkPaymentStatus(invoice_id);
    }
  }, [location.search]);

  const checkPaymentStatus = async (invoice_id: string) => {
    if (!invoice_id || !user?.user_token) return;

    setCheckingPayment(true);
    try {
      const res = await fetch(`${BASE_API}/user/orders/checkPayment?invoice_id=${invoice_id}`);
      const data = await res.json();

      if (data.status === "success") {
        toast.success(data.message || "✅ تم الدفع بنجاح!");
        navigate("/cart", { replace: true });
      } else {
        toast.error(data.message || "❌ لم يتم التحقق من الدفع.");
        navigate("/cart", { replace: true });
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء التحقق من الدفع.");
      navigate("/cart", { replace: true });
    } finally {
      setCheckingPayment(false);
    }
  };



  // جلب السلة
  const fetchCart = async () => {
    if (!user?.user_token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_API}/user/cart/getCart?user_token=${user.user_token}`
      );
      const data = await res.json();
      if (data.status === "success" && data.cart) {
        setCart(data.cart);
      } else {
        toast.error(data.message || "فشل في جلب السلة");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء جلب السلة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user?.user_token]);

  // إنشاء الطلب والدفع
  const createOrder = async () => {
    if (!user?.user_token) return toast.error("يرجى تسجيل الدخول أولاً");
    setCreatingOrder(true);

    try {
      const formData = new FormData();
      formData.append("user_token", user.user_token);
      formData.append("redirect_url", `${window.location.origin}/cart`);

      const res = await fetch(`${BASE_API}/user/orders/createOrder`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.status === "success" && data.payment_url) {
        toast.success("جارٍ تحويلك إلى صفحة الدفع 💳...");
        window.location.href = data.payment_url;
      } else {
        toast.error(data.message || "فشل في إنشاء الطلب");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء إنشاء الطلب");
    } finally {
      setCreatingOrder(false);
    }
  };

  //  تحديث الكمية
  const updateQuantity = async (book_code: string, newQuantity: number) => {
    if (!user?.user_token || !cart) return;

    const item = cart.items.find((i) => i.book_code === book_code);
    if (!item) return;

    const oldQuantity = Number(item.quantity_in_cart);
    const difference = newQuantity - oldQuantity;

    if (difference === 0) return;

    try {
      setUpdating(true);

      const formData = new URLSearchParams();
      formData.append("user_token", user.user_token);
      formData.append("book_code", book_code);
      formData.append("quantity", difference.toString());

      const res = await fetch(`${BASE_API}/user/cart/addToCart`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const data = await res.json();

      if (data.status === "success") {
        toast.success("تم تحديث الكمية بنجاح");
        await fetchCart();
      } else {
        toast.error(data.message || "فشل في تحديث الكمية");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تحديث الكمية");
    } finally {
      setUpdating(false);
    }
  };

  //  حذف منتج
  const removeFromCart = async (book_code: string) => {
    if (!user?.user_token || !cart) return;

    const item = cart.items.find((i) => i.book_code === book_code);
    if (!item) return;

    const quantityToRemove = -Number(item.quantity_in_cart);

    try {
      setUpdating(true);
      const formData = new URLSearchParams();
      formData.append("user_token", user.user_token);
      formData.append("book_code", book_code);
      formData.append("quantity", quantityToRemove.toString());

      const res = await fetch(`${BASE_API}/user/cart/addToCart`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const data = await res.json();

      if (data.status === "success") {
        toast.success("تمت إزالة الكتاب من السلة");
        await fetchCart();
      } else {
        toast.error(data.message || "فشل في إزالة الكتاب");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء إزالة الكتاب");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 text-muted-foreground text-lg">
        جاري تحميل السلة...
      </div>
    );

  if (!cart || cart.items.length === 0)
    return (
      <div className="flex flex-col items-center justify-center text-center py-20">
        <p className="text-xl font-semibold mb-2">السلة فاضية </p>
        <p className="text-sm text-muted-foreground mb-4">
          ضيف كتبك المفضلة وابدأ التسوق
        </p>
        <Button asChild>
          <Link to="/books">شوف الكتب</Link>
        </Button>
      </div>
    );

  const delivery = cart.delivery_price ? Number(cart.delivery_price) : 0;
  const totalWithDelivery = cart.total_price + delivery;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          سلة التسوق
        </h1>
        <span className="text-muted-foreground">{cart.total_items} كتاب</span>
      </div>

      {updating && (
        <div className="text-center text-sm text-muted-foreground mb-4 animate-pulse">
          جاري تحديث السلة...
        </div>
      )}

      {checkingPayment && (
        <div className="text-center text-sm text-muted-foreground mb-4 animate-pulse">
          جاري التحقق من عملية الدفع...
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.book_code}
              className="bg-card border rounded-xl p-4 flex gap-4 items-center shadow-sm"
            >
              <img
                src={item.book_image}
                alt={item.book_title}
                className="w-24 h-32 object-cover rounded-md"
              />
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-base">{item.book_title}</h3>

                <div className="text-sm text-muted-foreground space-y-1">
                  {item.teacher?.teacher_name && <p>👨‍🏫 {item.teacher.teacher_name}</p>}
                  {item.subject?.subject_name && <p>📘 {item.subject.subject_name}</p>}
                  {item.categorie?.categorie_name && <p>🏷️ {item.categorie.categorie_name}</p>}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={updating}
                      onClick={() =>
                        Number(item.quantity_in_cart) > 1
                          ? updateQuantity(item.book_code, Number(item.quantity_in_cart) - 1)
                          : removeFromCart(item.book_code)
                      }
                    >
                      {Number(item.quantity_in_cart) === 1 ? (
                        <Trash2 className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">
                      {item.quantity_in_cart}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={updating}
                      onClick={() =>
                        updateQuantity(item.book_code, Number(item.quantity_in_cart) + 1)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="text-right">
                    {item.is_discount === "yes" ? (
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground line-through text-sm">
                            {item.price_before_discount} ج.م
                          </span>
                          <span className="text-green-600 text-sm flex items-center gap-1">
                            <Tag className="h-3 w-3" />-{item.book_discount}%
                          </span>
                        </div>
                        <p className="font-bold text-primary">{item.book_price} ج.م</p>
                      </div>
                    ) : (
                      <p className="font-bold text-primary">{item.book_price} ج.م</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/*  ملخص الطلب */}
        <div className="bg-muted/40 rounded-xl p-6 border space-y-4 h-fit shadow-sm">
          <h2 className="text-lg font-bold mb-4">ملخص الطلب</h2>

          <div className="flex justify-between text-base">
            <span>عدد الكتب</span>
            <span>{cart.total_items}</span>
          </div>

          <div className="flex justify-between text-base">
            <span>تكلفة التوصيل</span>
            <span>
              {cart.delivery_price === null
                ? "غير محددة ❌"
                : cart.delivery_price === "0"
                  ? "مجاني 🚚"
                  : `${cart.delivery_price} ج.م`}
            </span>
          </div>

          <div className="border-t pt-3 flex justify-between text-base font-semibold">
            <span>المجموع الكلي</span>
            <span className="text-primary">{totalWithDelivery.toFixed(2)} ج.م</span>
          </div>

          {cart.delivery_price === null && (
            <div className="mb-2 text-sm text-red-600 font-medium">
              ⚠️ يرجى إدخال بيانات التوصيل أولاً قبل إنشاء الطلب.
            </div>
          )}

          <Button
            className="w-full hero-gradient"
            size="lg"
            disabled={loading || updating || creatingOrder || cart.delivery_price === null}
            onClick={createOrder}
          >
            {creatingOrder ? "جارٍ إنشاء الطلب..." : "تابع للشراء"}
          </Button>
        </div>
      </div>
    </div>
  );
}
