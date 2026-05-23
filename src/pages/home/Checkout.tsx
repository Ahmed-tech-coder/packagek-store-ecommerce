import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Checkout() {
  const { cart, cartTotal, clearCart, addOrder, isAuthenticated } = useStore();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    governorate: '',
    address: '',
  });

  const total = cartTotal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('سجّل دخولك الأول يا معلم');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      toast.error('يا عم السلة فاضية!');
      return;
    }

    // Create order
    const order = {
      id: Date.now().toString(),
      items: cart,
      total,
      paymentMethod,
      deliveryInfo: formData,
      date: new Date().toISOString(),
      status: 'pending',
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
    };

    addOrder(order);
    clearCart();

    toast.success('تمام يا باشا، طلبك اتسجل!', {
      description: 'هنكلمك قريب لتأكيد الطلب',
    });

    navigate('/dashboard');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center mt-40 lg:mt-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">يا عم السلة فاضية!</h1>
          <Button onClick={() => navigate('/books')}>روح خدلك كتب</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 mt-40 lg:mt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">خليها على الله وخلص طلبك</h1>
          <p className="text-muted-foreground text-lg">
            املأ بياناتك عشان نقدر نوصلك الكتب
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Info */}
              <Card>
                <CardHeader>
                  <CardTitle>معلومات التوصيل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">اسمك بالكامل *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="اكتب اسمك الكامل"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">موبايلك *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="01xxxxxxxxx"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="governorate">المحافظة بتاعتك *</Label>
                    <Input
                      id="governorate"
                      name="governorate"
                      value={formData.governorate}
                      onChange={handleChange}
                      required
                      placeholder="مثال: القاهرة"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">العنوان كامل *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="الشارع، الحي، رقم المبنى..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>هتدفع إزاي</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div>
                          <p className="font-semibold">هتدفع لما يوصللك</p>
                          <p className="text-sm text-muted-foreground">
                            ادفع نقداً عند الاستلام
                          </p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg cursor-pointer hover:bg-muted/50 opacity-50">
                      <RadioGroupItem value="visa" id="visa" disabled />
                      <Label htmlFor="visa" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div>
                          <p className="font-semibold">بطاقة الائتمان (قريباً)</p>
                          <p className="text-sm text-muted-foreground">
                            ادفع بأمان ببطاقة فيزا أو ماستركارد
                          </p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>تفاصيل الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-20 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold line-clamp-2">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            الكمية: {item.quantity}
                          </p>
                          <p className="text-sm font-bold text-primary">
                            {item.price * item.quantity} ج.م
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">المجموع</span>
                      <span>{total.toFixed(2)} ج.م</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">التوصيل</span>
                      <span className="text-green-600">على حسابنا</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>المجموع النهائي</span>
                    <span className="text-primary">{total.toFixed(2)} ج.م</span>
                  </div>

                  <Button type="submit" size="lg" className="w-full hero-gradient">
                    خلصنا وابعته
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    بإتمام الطلب، أنت موافق على{' '}
                    <a href="#" className="text-primary hover:underline">
                      الشروط
                    </a>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
