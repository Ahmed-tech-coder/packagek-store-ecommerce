import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Loader2, Users, MapPin, Phone, GraduationCap, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const BASE_API = import.meta.env.VITE_BASE_API;
const ITEMS_PER_PAGE = 10;

// ... (Interfaces تبقى كما هي)
interface DeliveryData {
  government: string;
  city: string;
  zone: string;
  location: string;
  alternative_phone_number: string;
}

interface User {
  user_code: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  academic_year: string;
  delivery_data?: DeliveryData;
}

export default function UsersManagement() {
  const { admin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!admin?.admin_token) return;
      try {
        const res = await fetch(`${BASE_API}/admin/users/getUsers?admin_token=${admin.admin_token}`);
        const data = await res.json();
        if (data.status === 'success') setUsers(data.users);
        else toast.error('خطأ في تحميل المستخدمين');
      } catch (error) {
        toast.error('فشل الاتصال');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [admin]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = searchQuery.toLowerCase();
      return (
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.phone_number.includes(query) ||
        user.user_code.includes(query)
      );
    });
  }, [users, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const handleDelete = async (userCode: string) => {
    if (!admin?.admin_token) return;
    try {
      const formData = new FormData();
      formData.append('admin_token', admin.admin_token);
      formData.append('user_code', userCode);
      const res = await fetch(`${BASE_API}/admin/users/deleteUser`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.status === 'success') {
        setUsers((prev) => prev.filter((u) => u.user_code !== userCode));
        toast.success('تم حذف المستخدم بنجاح');
      } else {
        toast.error('فشل الحذف');
      }
    } catch {
      toast.error('حدث خطأ غير متوقع');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">جاري تحضير قائمة المستخدمين...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-10 space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">إدارة المستخدمين</h1>
          <p className="text-muted-foreground mt-2">يمكنك إدارة وعرض بيانات الطلاب المشتركين في المنصة.</p>
        </div>
        <Card className="w-full md:w-auto min-w-[200px] border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-primary rounded-lg text-primary-foreground">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold">{filteredUsers.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Search Box */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="البحث برقم الهاتف..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pr-10 bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Main Content (Table for Desktop, Cards for Mobile) */}
      <div className="grid grid-cols-1 gap-4">
        
        {/* Desktop View Table */}
        <div className="hidden lg:block border rounded-xl overflow-hidden bg-card shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px] text-right">الكود</TableHead>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">العام الدراسي</TableHead>
                <TableHead className="text-right text-nowrap">رقم الهاتف</TableHead>
                <TableHead className="text-right">الموقع</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow key={user.user_code} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono text-xs font-bold">{user.user_code}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link 
                              to={`/admin/users/user-details/${user.user_code}`} 
                              className="font-semibold text-primary hover:underline block max-w-[150px] truncate"
                            >
                              {user.first_name} {user.last_name}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>{user.first_name} {user.last_name}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal bg-secondary/50">
                        {user.academic_year === 'first_secondary' ? 'أولى ثانوي' : user.academic_year === 'second_secondary' ? 'ثانية ثانوي' : 'ثالثة ثانوي'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                        <div className="flex flex-col">
                            <span>{user.phone_number}</span>
                            <span className="text-[10px] text-muted-foreground">{user.delivery_data?.alternative_phone_number || ''}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin size={14} className="shrink-0" />
                        <span className="max-w-[120px] truncate">
                          {user.delivery_data?.government ? `${user.delivery_data.government} - ${user.delivery_data.city}` : 'غير محدد'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <ConfirmDeleteDialog
                        onConfirm={() => handleDelete(user.user_code)}
                        title={`حذف المستخدم`}
                        description={`هل أنت متأكد من حذف ${user.first_name}؟ لا يمكن التراجع عن هذا الإجراء.`}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    لا توجد نتائج تطابق بحثك.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile & Tablet View Cards */}
        <div className="lg:hidden space-y-4">
          {paginatedUsers.map((user) => (
            <Card key={user.user_code} className="overflow-hidden border-r-4 border-r-primary">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <Link to={`/admin/users/user-details/${user.user_code}`} className="font-bold text-lg text-primary">
                    {user.first_name} {user.last_name}
                  </Link>
                  <ConfirmDeleteDialog
                    onConfirm={() => handleDelete(user.user_code)}
                    title="حذف"
                    description="حذف المستخدم؟"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-muted-foreground" />
                    <span>
                         {user.academic_year === 'first_secondary' ? '1 ثانوي' : user.academic_year === 'second_secondary' ? '2 ثانوي' : '3 ثانوي'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-muted-foreground" />
                    <span className="font-mono">{user.phone_number}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 border-t pt-2 mt-1">
                    <MapPin size={16} className="text-muted-foreground" />
                    <span className="truncate text-muted-foreground italic text-xs">
                      {user.delivery_data?.location || 'لم يتم تحديد العنوان'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Improved Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronRight className="h-4 w-4" />
            السابق
          </Button>
          
          <div className="flex items-center gap-1 mx-4">
            <span className="text-sm font-medium">
              صفحة {currentPage} من {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            التالي
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}