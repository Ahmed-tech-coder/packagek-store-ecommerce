import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Package, MapPin, Eye, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const BASE_API = import.meta.env.VITE_BASE_API;

export default function Dashboard() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState<any>(null);
  const [deliveryData, setDeliveryData] = useState<any>(null);
  const [governments, setGovernments] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [orders, setOrders] = useState<any>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const convertAcademicToArabic = (year: any) => {
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

  const translatePaymentStatus = (status: string) => {
    switch (status) {
      case 'complete':
        return 'تم الدفع';
      case 'unComplete':
        return 'لم يتم الدفع';
      case 'failed':
        return 'فشل الدفع';
      case 'cancelled':
        return 'تم الإلغاء';
      default:
        return 'غير معروف';
    }
  };


  const [formData, setFormData] = useState({
    governorate: '',
    center: '',
    zone: '',
    address: '',
    alternatePhone: '',
  });

  useEffect(() => {
    if (formData.center) {
      const fetchZones = async () => {
        try {
          const res = await fetch(`${BASE_API}/user/zones?city_code=${formData.center}`);
          const data = await res.json();

          if (data.status === 'success') {
            setZones(data.zones);
          } else {
            toast.error('فشل تحميل المناطق');
          }
        } catch (err) {
          console.error(err);
          toast.error('خطأ أثناء تحميل المناطق');
        }
      };

      fetchZones();
    } else {
      setZones([]);
      setFormData(prev => ({ ...prev, zone: '' }));
    }
  }, [formData.center]);

  useEffect(() => {
    if (zones.length > 0 && deliveryData) {
      const zoneMatch = zones.find(
        (zone) => zone.name_ar === deliveryData.zone
      );
      if (zoneMatch) {
        setFormData(prev => ({
          ...prev,
          zone: zoneMatch.zone_code
        }));
      }
    }
  }, [zones, deliveryData]);



  // Fetch user data
  useEffect(() => {
    if (!loading && user) {
      const fetchUserData = async () => {
        try {
          const res = await fetch(
            `${BASE_API}/user/account/getUserData?user_token=${user.user_token}`
          );
          const data = await res.json();

          if (data.status === 'success') {
            setUserData(data.user_data);
            setDeliveryData(data.delivery_data);
            setFormData({
              governorate: '',
              center: '',
              address:
                data.delivery_data.location !== 'لا يوجد'
                  ? data.delivery_data.location
                  : '',
              alternatePhone:
                data.delivery_data.alternative_phone_number !== 'لا يوجد'
                  ? data.delivery_data.alternative_phone_number
                  : '',
            });
          } else if (data.reason === 'unauthorized') {
            logout();
            toast.error('انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى');
          } else {
            toast.error('فشل تحميل بيانات المستخدم');
          }
        } catch (error) {
          console.error(error);
          toast.error('حدث خطأ أثناء جلب البيانات');
        } finally {
          setLoadingData(false);
        }
      };

      fetchUserData();
    }
  }, [user, loading, logout]);

  // Fetch governments
  useEffect(() => {
    const fetchGovernments = async () => {
      try {
        const res = await fetch(`${BASE_API}/user/governments`);
        const data = await res.json();
        if (data.status === 'success') {
          setGovernments(data.governments);
        } else {
          toast.error('فشل تحميل المحافظات');
        }
      } catch (err) {
        console.error(err);
        toast.error('خطأ أثناء تحميل المحافظات');
      }
    };
    fetchGovernments();
  }, []);

  // Fetch cities based on governorate
  useEffect(() => {
    if (formData.governorate) {
      const fetchCities = async () => {
        try {
          const res = await fetch(
            `${BASE_API}/user/cities?gov_code=${formData.governorate}`
          );
          const data = await res.json();
          if (data.status === 'success') {
            setCities(data.cities);
          } else {
            toast.error('فشل تحميل المدن');
          }
        } catch (err) {
          console.error(err);
          toast.error('خطأ أثناء تحميل المدن');
        }
      };
      fetchCities();
    } else {
      setCities([]);
      setFormData((prev) => ({ ...prev, center: '' }));
    }
  }, [formData.governorate]);

  useEffect(() => {
    if (governments.length > 0 && deliveryData) {
      const govMatch = governments.find(
        (gov) => gov.name_ar === deliveryData.government
      );
      if (govMatch) {
        setFormData((prev) => ({
          ...prev,
          governorate: govMatch.government_code,
        }));
      }
    }
  }, [governments, deliveryData]);

  useEffect(() => {
    if (cities.length > 0 && deliveryData) {
      const cityMatch = cities.find(
        (city) => city.name_ar === deliveryData.city
      );
      if (cityMatch) {
        setFormData((prev) => ({ ...prev, center: cityMatch.city_code }));
      }
    }
  }, [cities, deliveryData]);

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.user_token) return;

      setLoadingOrders(true);
      try {
        const res = await fetch(`${BASE_API}/user/orders/getOrders?user_token=${user.user_token}`);
        const data = await res.json();

        if (data.status === 'success') {
          setOrders(data.orders);
        } else if (data.reason === 'token_expired') {
          logout();
          toast.error('انتهت صلاحية تسجيل الدخول، يرجى التسجيل مرة أخرى');
        } else {
          toast.error('فشل تحميل الطلبات');
        }
      } catch (error) {
        console.error(error);
        toast.error('حدث خطأ أثناء تحميل الطلبات');
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveDeliveryInfo = async () => {
    const formBody = new FormData();
    formBody.append('user_token', user.user_token);
    formBody.append('government_code', formData.governorate);
    formBody.append('city_code', formData.center);
    formBody.append('zone_code', formData.zone);
    formBody.append('location', formData.address);
    formBody.append('alternative_phone_number', formData.alternatePhone);

    try {
      const res = await fetch(`${BASE_API}/user/account/updateDeliveryData`, {
        method: 'POST',
        body: formBody,
      });
      const data = await res.json();

      if (data.status === 'success') {
        toast.success('تم حفظ بيانات التوصيل بنجاح');
        setDeliveryData(data.new_data);
      } else {
        toast.error('فشل حفظ البيانات');
      }
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('تم تسجيل الخروج');
    navigate('/');
  };

  if (loading || loadingData)
    return <div className="text-center mt-32">جاري تحميل بياناتك...</div>;
  if (!isAuthenticated || !user || !userData) return null;

  return (
    <div className="min-h-screen py-8 mt-40 lg:mt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                منوّر يا {userData.first_name}!
              </h1>
              <p className="text-muted-foreground text-lg">هنا كل الحركات بتاعتك في الموقع</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          </div>
        </motion.div>

        <Tabs defaultValue="profile" className="space-y-6" dir="rtl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile"><User className="h-4 w-4 ml-2" />الملف الشخصي</TabsTrigger>
            <TabsTrigger value="orders"><Package className="h-4 w-4 ml-2" />الطلبات</TabsTrigger>
            <TabsTrigger value="delivery"><MapPin className="h-4 w-4 ml-2" />العنوان</TabsTrigger>
          </TabsList>
          {/* بيانات المستخدم */}
          <TabsContent value="profile" dir="rtl">
            <Card>
              <CardHeader>
                <CardTitle>بياناتك</CardTitle>
                <CardDescription>
                  دي البيانات اللي سجلت بيها وبيانات التوصيل الحالية.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الاسم الأول</Label>
                    <Input value={userData.first_name} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>اسم العائلة</Label>
                    <Input value={userData.last_name} disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input value={userData.phone_number} disabled />
                </div>
                <div className="space-y-2">
                  <Label>السنة الدراسية</Label>
                  <Input value={convertAcademicToArabic(userData.academic_year)} disabled />
                </div>
                {/* --- إضافة: بيانات التوصيل --- */}
                <Separator className="my-6" />
                <h4 className="text-lg font-medium mb-4">
                  بيانات التوصيل المسجلة
                </h4>
                {deliveryData ? (<>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>المحافظة</Label>
                      <Input value={deliveryData.government !== 'لا يوجد' ? deliveryData.government : 'لم يتم التسجيل'} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>المدينة</Label>
                      <Input value={deliveryData.city !== 'لا يوجد' ? deliveryData.city : 'لم يتم التسجيل'} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label>المنطقة</Label>
                      <Input
                        value={
                          deliveryData.zone !== 'لا يوجد'
                            ? deliveryData.zone
                            : 'لم يتم التسجيل'
                        }
                        disabled
                      />
                    </div>

                  </div>
                  <div className="space-y-2"> <Label>العنوان</Label> <Input value={deliveryData.location !== 'لا يوجد' ? deliveryData.location : 'لم يتم التسجيل'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم بديل</Label>
                    <Input value={deliveryData.alternative_phone_number !== 'لا يوجد' ? deliveryData.alternative_phone_number : 'لم يتم التسجيل'} disabled />
                  </div>
                </>) : (<p className="text-muted-foreground"> لم تقم بإدخال بيانات توصيل بعد. </p>)}
                {/* ------------------------- */}
              </CardContent>
            </Card>
          </TabsContent>
          {/* الطلبات */}
          <TabsContent value="orders" dir="rtl">
            <Card>
              <CardHeader>
                <CardTitle>طلباتك</CardTitle>
                <CardDescription>دي كل الطلبات اللي عملتها على الموقع.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingOrders ? (
                  <div className="text-center py-12">جاري تحميل الطلبات...</div>
                ) : orders && orders.length > 0 ? (
                  orders.map((order: any, index: number) => (
                    <motion.div
                      key={order.order_code || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 bg-card"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-semibold">
                            رقم الطلب: <span className="text-primary">{order.order_code}</span>
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            التاريخ: {new Date(order.created_at).toLocaleString('ar-EG')}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={order.payment_status === 'complete' ? 'default' : 'destructive'}
                          >
                            {translatePaymentStatus(order.payment_status)}
                          </Badge>
                          <Badge variant="outline">
                            {order.delivery_status ? order.delivery_status : 'لم يتم التنفيذ'}
                          </Badge>
                          <Badge variant="secondary">
                            إجمالي: {order.total_amount} ج.م
                          </Badge>

                          {order.invoice_url && (
                            <Button
                              variant="outline"
                              className="mt-2 md:mt-0"
                              onClick={() => window.open(order.invoice_url, '_blank')}
                            >
                              <Eye className="h-4 w-4 ml-2" />
                              عرض الفاتورة
                            </Button>
                          )}

                        </div>

                      </div>
                      <Separator className="mb-4" />
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between border rounded-lg p-3 hover:bg-accent/40 transition">
                          <div className="flex items-center gap-4">
                            <img src={item.book_image} alt={item.book_title} className="w-16 h-20 object-cover rounded-md" />
                            <div>
                              <h4 className="font-medium">{item.book_title}</h4>
                              <p className="text-sm text-muted-foreground">{item.book_description}</p>
                              <p className="text-sm mt-1">
                                الكمية: <strong>{item.quantity}</strong> × {item.price_per_item} ج.م
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              المجموع: {item.item_total} ج.م
                            </p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-xl font-semibold">مفيش طلبات حتى الآن</h3>
                    <p className="mt-1 text-muted-foreground">ابدأ التسوق واعمل أول طلب ليك 🎉</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* العنوان */}
          <TabsContent value="delivery" dir="rtl">
            <Card>
              <CardHeader>
                <CardTitle>عنوان التوصيل</CardTitle>
                <CardDescription>العنوان اللي بنوصل عليه طلباتك.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>المحافظة</Label>
                    <Select
                      value={formData.governorate}
                      onValueChange={(val) =>
                        setFormData({ ...formData, governorate: val, center: '' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المحافظة" />
                      </SelectTrigger>
                      <SelectContent>
                        {governments.map((gov) => (
                          <SelectItem key={gov.government_code} value={gov.government_code}>
                            {gov.name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>المدينة / المركز</Label>
                    <Select
                      value={formData.center}
                      onValueChange={(val) => setFormData({ ...formData, center: val })}
                      disabled={!formData.governorate || cities.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المدينة" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.city_code} value={city.city_code}>
                            {city.name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>المنطقة</Label>
                    <Select
                      value={formData.zone}
                      onValueChange={(val) => setFormData({ ...formData, zone: val })}
                      disabled={!formData.center || zones.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنطقة" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((zone) => (
                          <SelectItem key={zone.zone_code} value={zone.zone_code}>
                            {zone.name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                </div>

                <div className="space-y-2">
                  <Label>العنوان بالتفصيل</Label>
                  <Input name="address" value={formData.address} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>رقم بديل</Label>
                  <Input name="alternatePhone" value={formData.alternatePhone} onChange={handleChange} />
                </div>

                <div className="flex justify-between items-center mt-6">
                  <p className="text-sm text-muted-foreground">تقدر تعدل العنوان في أي وقت.</p>
                  <Button onClick={handleSaveDeliveryInfo}>حفظ التغييرات</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
