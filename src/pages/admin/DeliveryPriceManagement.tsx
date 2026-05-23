import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const BASE_API = import.meta.env.VITE_BASE_API;

interface Government {
    government_code: string;
    name_ar: string;
    delivery_price: string;
}

export default function DeliveryPriceManagement() {
    const { admin } = useAuth();
    const [governments, setGovernments] = useState<Government[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGov, setEditingGov] = useState<Government | null>(null);
    const [formData, setFormData] = useState({ delivery_price: '' });

    // === Fetch Governments ===
    const fetchGovernments = async () => {
        if (!admin?.admin_token) return;
        try {
            const res = await fetch(`${BASE_API}/admin/delivery-price/governments?admin_token=${admin.admin_token}`);
            const data = await res.json();

            if (data.status === 'success') {
                setGovernments(data.governments);
            } else {
                toast.error('فشل تحميل بيانات المحافظات');
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGovernments();
    }, [admin]);

    // === Update Delivery Price ===
    const handleSave = async () => {
        if (!admin?.admin_token) return toast.error('بيانات المسؤول غير متوفرة');
        if (!formData.delivery_price) return toast.error('الرجاء إدخال قيمة مصاريف الشحن');

        const form = new FormData();
        form.append('admin_token', admin.admin_token);
        form.append('government_code', editingGov!.government_code);
        form.append('delivery_price', formData.delivery_price);

        try {
            const res = await fetch(`${BASE_API}/admin/delivery-price/updateDeliveryPrice`, {
                method: 'POST',
                body: form,
            });
            const data = await res.json();

            if (data.status === 'success') {
                toast.success('تم تحديث مصاريف الشحن');
                setIsDialogOpen(false);
                setEditingGov(null);
                setFormData({ delivery_price: '' });
                fetchGovernments();
            } else {
                toast.error('فشل تحديث البيانات');
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء الحفظ');
        }
    };

    const fadeIn = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 text-primary">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                جاري تحميل البيانات...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">إدارة مصاريف الشحن</h1>
                    <p className="text-muted-foreground">إجمالي المحافظات: {governments.length}</p>
                </div>
            </div>

            {/* Table */}
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle>قائمة المحافظات</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2">كود المحافظة</th>
                                    <th className="p-2">اسم المحافظة</th>
                                    <th className="p-2">مصاريف الشحن</th>
                                    <th className="p-2 text-center">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {governments.map((g) => (
                                    <tr key={g.government_code} className="border-b hover:bg-muted/40 transition">
                                        <td className="p-2 font-mono text-xs">{g.government_code}</td>
                                        <td className="p-2">{g.name_ar}</td>
                                        <td className="p-2">{g.delivery_price}</td>
                                        <td className="p-2 text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setEditingGov(g);
                                                    setFormData({ delivery_price: g.delivery_price });
                                                    setIsDialogOpen(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="block md:hidden space-y-4">
                        {governments.map((g) => (
                            <motion.div key={g.government_code} variants={fadeIn} initial="hidden" animate="show">
                                <Card className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-lg">{g.name_ar}</h3>
                                        <span className="text-muted-foreground">مصاريف: {g.delivery_price}</span>
                                    </div>
                                    <div className="flex justify-end mt-3 gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setEditingGov(g);
                                                setFormData({ delivery_price: g.delivery_price });
                                                setIsDialogOpen(true);
                                            }}
                                        >
                                            تعديل
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Dialog Edit Delivery Price */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تعديل مصاريف الشحن</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>مصاريف الشحن *</Label>
                            <Input
                                className="mt-2"
                                value={formData.delivery_price}
                                onChange={(e) => setFormData({ delivery_price: e.target.value })}
                            />
                        </div>
                        <Button onClick={handleSave} className="w-full">
                            حفظ
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
