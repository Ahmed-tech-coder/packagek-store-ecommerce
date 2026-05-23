import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const BASE_API = import.meta.env.VITE_BASE_API;

interface Order {
  order_code: string;
  total_amount: string;
  total_items_quantity: number;
  delivery_status: string | null;
  created_at: string;
  updated_at: string;
  user: {
    user_code: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    delivery_data: {
      government_name: string;
      city_name: string;
      zone_name: string;
      location: string;
      alternative_phone_number: string;
    }
  };
  payment: {
    payment_code: string;
    payment_status: string;
    payment_amount: string;
    invoice_url: string;
    created_at: string;
    updated_at: string;
  };
}

export default function OrdersManagement() {
  const { admin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!admin?.admin_token) return;

      try {
        const res = await fetch(`${BASE_API}/admin/orders/getOrders?admin_token=${admin.admin_token}`);
        const data = await res.json();

        if (data.status === 'success') {
          setOrders(data.orders);
        } else {
          toast.error('حدث خطأ أثناء تحميل الطلبات');
        }
      } catch (err) {
        console.error('Fetch orders error:', err);
        toast.error('فشل الاتصال بالسيرفر');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [admin]);

  const filteredOrders = orders.filter(
    (o) =>
      o.order_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.user.phone_number.includes(searchQuery)
  );

  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  const getPaymentStatus = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-500 text-white">مكتمل</Badge>;
      case 'unComplete':
        return <Badge className="bg-yellow-500 text-white">غير مكتمل</Badge>;
      default:
        return <Badge variant="secondary">غير معروف</Badge>;
    }
  };

  const getDeliveryStatus = (status: string | null) => {
    if (!status) return <Badge variant="outline">لم يتم التوصيل بعد</Badge>;
    if (status === 'delivered') return <Badge className="bg-green-500 text-white">تم التوصيل</Badge>;
    if (status === 'in_progress') return <Badge className="bg-blue-500 text-white">قيد التوصيل</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-primary">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        جاري تحميل الطلبات...
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">إدارة الطلبات</h1>
            <p className="text-muted-foreground">إجمالي الطلبات: {orders.length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن طلب أو عميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        {/* Orders Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>قائمة الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                لا توجد نتائج مطابقة للبحث
              </p>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>كود الطلب</TableHead>
                        <TableHead>العميل</TableHead>
                        <TableHead>الهاتف</TableHead>
                        <TableHead>المبلغ الإجمالي</TableHead>
                        <TableHead>حالة الدفع</TableHead>
                    
                        <TableHead>المحافظة</TableHead>
                        <TableHead>المدينة</TableHead>
                        <TableHead> المنطقة</TableHead>
                        <TableHead> العنوان</TableHead>

                        <TableHead>تاريخ الإنشاء</TableHead>
                        <TableHead className="text-center">الإيصال</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((o) => (
                        <TableRow key={o.order_code} className="hover:bg-muted/40 transition">
                          <TableCell>{o.order_code}</TableCell>
                          <TableCell>{o.user.first_name} {o.user.last_name}</TableCell>
                          <TableCell>{o.user.phone_number}</TableCell>
                          <TableCell>{o.total_amount} ج.م</TableCell>
                          <TableCell>{getPaymentStatus(o.payment.payment_status)}</TableCell>
                          <TableCell>{o.user.delivery_data.government_name}</TableCell>
                          <TableCell>{o.user.delivery_data.city_name}</TableCell>
                          <TableCell>{o.user.delivery_data.location}</TableCell>
                          <TableCell>{o.user.delivery_data.location}</TableCell>
                          <TableCell>{new Date(o.created_at).toLocaleString('ar-EG')}</TableCell>
                          <TableCell className="text-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link to={o.payment.invoice_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 text-primary" />
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent>عرض الفاتورة</TooltipContent>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="block md:hidden space-y-4">
                  {filteredOrders.map((o) => (
                    <motion.div
                      key={o.order_code}
                      variants={fadeIn}
                      initial="hidden"
                      animate="show"
                    >
                      <Card className="p-4 border rounded-xl bg-muted/10 hover:shadow-md transition">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-lg">{o.order_code}</h3>
                          {getPaymentStatus(o.payment.payment_status)}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>👤 <strong>العميل:</strong> {o.user.first_name} {o.user.last_name}</p>
                          <p>📞 <strong>الهاتف:</strong> {o.user.phone_number}</p>
                          <p>💰 <strong>المبلغ:</strong> {o.total_amount} ج.م</p>
                          <p>🚚 <strong>التوصيل:</strong> {getDeliveryStatus(o.delivery_status)}</p>
                          <p>🏛️ <strong>المحافظة:</strong> {o.user.delivery_data.government_name}</p>
                          <p>🌆 <strong>المدينة:</strong> {o.user.delivery_data.city_name}</p>
                          <p>📍 <strong>المنطقة:</strong> {o.user.delivery_data.zone_name}</p>
                          <p>📌 <strong>العنوان:</strong> {o.user.delivery_data.location}</p>
                          <p>🕒 <strong>التاريخ:</strong> {new Date(o.created_at).toLocaleString('ar-EG')}</p>
                        </div>
                        <div className="flex justify-end mt-3">
                          <Link to={o.payment.invoice_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <ExternalLink className="h-4 w-4" />
                              عرض الفاتورة
                            </Button>
                          </Link>
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
    </TooltipProvider>
  );
}
