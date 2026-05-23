import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

const BASE_API = import.meta.env.VITE_BASE_API;

interface Government {
    government_code: string;
    name_ar: string;
}

interface City {
    city_code: string;
    name_ar: string;
}

interface Zone {
    zone_code: string;
    name_ar: string;
}

interface DeliveryData {
    government: string;
    government_code: string;
    city: string;
    city_code: string;
    zone: string;
    zone_code: string;
    location: string;
    alternative_phone_number: string;
}

interface UserData {
    user_code: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    academic_year: string;
    delivery_data?: DeliveryData;
}

export default function UserDetails() {
    const { user_code } = useParams();
    const { admin } = useAuth();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [governments, setGovernments] = useState<Government[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);

    const [selectedGov, setSelectedGov] = useState<string>('');
    const [selectedZone, setSelectedZone] = useState<string>('');

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
    });

    const { register, handleSubmit, reset, watch } = useForm();

    const selectedCity = watch("city_code");

    // Fetch User Data
    useEffect(() => {
        const fetchUserData = async () => {
            if (!admin?.admin_token) return;

            try {
                const res = await fetch(
                    `${BASE_API}/admin/users/getUserData?admin_token=${admin.admin_token}&user_code=${user_code}`
                );
                const data = await res.json();

                if (data.status === 'success') {
                    const userData = {
                        ...data.user_data,
                        delivery_data: data.delivery_data,
                    };

                    setUser(userData);

                    reset({
                        first_name: userData.first_name,
                        last_name: userData.last_name,
                        phone_number: userData.phone_number,
                        academic_year: userData.academic_year,
                        location: userData.delivery_data?.location,
                        alternative_phone_number: userData.delivery_data?.alternative_phone_number,
                        city_code: userData.delivery_data?.city_code,
                        current_password: userData.password,
                    });

                    if (userData.delivery_data?.government_code) {
                        setSelectedGov(userData.delivery_data.government_code);
                    }

                    if (userData.delivery_data?.zone_code) {
                        setSelectedZone(userData.delivery_data.zone_code);
                    }
                } else {
                    toast.error("خطأ أثناء تحميل بيانات المستخدم");
                }
            } catch (e) {
                console.error(e);
                toast.error("فشل الاتصال بالسيرفر");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [admin, user_code, reset]);

    // Fetch Governments
    useEffect(() => {
        const fetchGovernments = async () => {
            try {
                const res = await fetch(`${BASE_API}/user/governments`);
                const data = await res.json();

                if (data.status === "success") {
                    setGovernments(data.governments);
                }
            } catch (e) {
                toast.error("فشل تحميل المحافظات");
            }
        };
        fetchGovernments();
    }, []);

    // Fetch Cities
    useEffect(() => {
        if (!selectedGov) return;

        const fetchCities = async () => {
            try {
                const res = await fetch(`${BASE_API}/user/cities?gov_code=${selectedGov}`);
                const data = await res.json();

                if (data.status === "success") {
                    setCities(data.cities);
                }
            } catch (e) {
                toast.error("فشل تحميل المدن");
            }
        };

        fetchCities();
    }, [selectedGov]);

    // Fetch Zones
    useEffect(() => {
        if (!selectedCity) return;

        const fetchZones = async () => {
            try {
                const res = await fetch(`${BASE_API}/user/zones?city_code=${selectedCity}`);
                const data = await res.json();

                if (data.status === "success") {
                    setZones(data.zones);

                    // لو لسه محملين بيانات قديمة
                    if (user?.delivery_data?.zone_code) {
                        setSelectedZone(user.delivery_data.zone_code);
                    }
                }
            } catch (e) {
                toast.error("فشل تحميل المناطق");
            }
        };

        fetchZones();
    }, [selectedCity]);

    // Submit Update
    const onSubmit = async (data: any) => {
        if (!admin?.admin_token || !user) return;

        const formData = new FormData();
        formData.append("admin_token", admin.admin_token);
        formData.append("user_code", user.user_code);

        formData.append("first_name", data.first_name);
        formData.append("last_name", data.last_name);
        formData.append("phone_number", data.phone_number);
        formData.append("academic_year", data.academic_year);

        if (data.current_password && data.new_password) {
            formData.append("current_password", data.current_password);
            formData.append("new_password", data.new_password);
        }

        if (selectedGov) formData.append("government_code", selectedGov);
        if (data.city_code) formData.append("city_code", data.city_code);
        if (selectedZone) formData.append("zone_code", selectedZone);

        if (data.location) formData.append("location", data.location);
        if (data.alternative_phone_number)
            formData.append("alternative_phone_number", data.alternative_phone_number);

        setSaving(true);

        try {
            const res = await fetch(`${BASE_API}/admin/users/updateUser`, {
                method: "POST",
                body: formData,
            });

            const result = await res.json();

            if (result.status === "success") {
                toast.success("تم التحديث بنجاح");
            } else {
                toast.error(result.message || "فشل التحديث");
            }
        } catch (e) {
            toast.error("خطأ أثناء التحديث");
        } finally {
            setSaving(false);
        }
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            className="max-w-4xl mx-auto space-y-8 py-10 px-4"
            initial="hidden"
            animate="show"
            variants={fadeIn}
        >
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">تفاصيل المستخدم</h1>

                <Link to="/admin/users" className="flex items-center gap-2 text-primary">
                    <ArrowLeft size={18} />
                    رجوع
                </Link>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((x) => (
                        <Skeleton key={x} className="h-24 w-full rounded-xl" />
                    ))}
                </div>
            ) : user ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* بيانات شخصية */}
                    <Card className="shadow-md border rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg">البيانات الشخصية</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label>الاسم الأول</Label>
                                <Input {...register("first_name")} />
                            </div>
                            <div>
                                <Label>الاسم الأخير</Label>
                                <Input {...register("last_name")} />
                            </div>
                            <div>
                                <Label>رقم الهاتف</Label>
                                <Input {...register("phone_number")} />
                            </div>
                            <div>
                                <Label>السنة الدراسية</Label>
                                <select
                                    {...register("academic_year")}
                                    className="w-full border rounded-md h-10 px-2 bg-background"
                                >
                                    <option value="first_secondary">أولى ثانوي</option>
                                    <option value="second_secondary">تانية ثانوي</option>
                                    <option value="third_secondary">ثالثة ثانوي</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* بيانات التوصيل */}
                    <Card className="shadow-md border rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg">بيانات التوصيل</CardTitle>
                        </CardHeader>

                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label>المحافظة</Label>
                                <select
                                    className="w-full border rounded-md h-10 px-2 bg-background"
                                    value={selectedGov}
                                    onChange={(e) => {
                                        setSelectedGov(e.target.value);
                                        setCities([]);
                                    }}
                                >
                                    <option value="">اختر المحافظة</option>
                                    {governments.map((g) => (
                                        <option key={g.government_code} value={g.government_code}>
                                            {g.name_ar}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label>المدينة</Label>
                                <select
                                    {...register("city_code")}
                                    className="w-full border rounded-md h-10 px-2 bg-background"
                                    disabled={!cities.length}
                                    value={selectedCity}
                                >
                                    <option value="">اختر المدينة</option>
                                    {cities.map((c) => (
                                        <option key={c.city_code} value={c.city_code}>
                                            {c.name_ar}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label>المنطقة</Label>
                                <select
                                    className="w-full border rounded-md h-10 px-2 bg-background"
                                    value={selectedZone}
                                    onChange={(e) => setSelectedZone(e.target.value)}
                                    disabled={!zones.length}
                                >
                                    <option value="">اختر المنطقة</option>
                                    {zones.map((z) => (
                                        <option key={z.zone_code} value={z.zone_code}>
                                            {z.name_ar}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label>العنوان</Label>
                                <Input {...register("location")} />
                            </div>

                            <div>
                                <Label>رقم الهاتف البديل</Label>
                                <Input {...register("alternative_phone_number")} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* تغيير كلمة المرور */}
                    <Card className="shadow-md border rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg">تغيير كلمة المرور</CardTitle>
                        </CardHeader>

                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="relative">
                                <Label>كلمة المرور الحالية</Label>
                                <Input
                                    type={showPasswords.current ? "text" : "password"}
                                    {...register("current_password")}
                                    readOnly
                                />
                                <button
                                    type="button"
                                    className="absolute left-3 top-8 text-muted-foreground"
                                    onClick={() =>
                                        setShowPasswords((prev) => ({
                                            ...prev,
                                            current: !prev.current,
                                        }))
                                    }
                                >
                                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="relative">
                                <Label>كلمة المرور الجديدة</Label>
                                <Input
                                    type={showPasswords.new ? "text" : "password"}
                                    {...register("new_password")}
                                />
                                <button
                                    type="button"
                                    className="absolute left-3 top-8 text-muted-foreground"
                                    onClick={() =>
                                        setShowPasswords((prev) => ({
                                            ...prev,
                                            new: !prev.new,
                                        }))
                                    }
                                >
                                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button disabled={saving} type="submit" className="px-6">
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    جاري الحفظ...
                                </>
                            ) : (
                                "تحديث البيانات"
                            )}
                        </Button>
                    </div>
                </form>
            ) : (
                <p className="text-center text-muted-foreground">
                    لم يتم العثور على المستخدم
                </p>
            )}
        </motion.div>
    );
}
