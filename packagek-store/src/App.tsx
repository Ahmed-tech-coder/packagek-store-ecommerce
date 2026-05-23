import { Suspense, lazy, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Layouts
import { Layout } from "./components/Layout";
import { AdminLayout } from "./components/admin/AdminLayout";

// Context
import { AuthProvider } from "@/context/AuthContext";

// Protected Route
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy loaded pages
const Index = lazy(() => import("./pages/home/Index"));
const Books = lazy(() => import("./pages/home/Books"));
const BookDetails = lazy(() => import("./pages/home/BookDetails"));
const Checkout = lazy(() => import("./pages/home/Checkout"));
const Dashboard = lazy(() => import("./pages/home/Dashboard"));
const NotFound = lazy(() => import("./pages/home/NotFound"));
const About = lazy(() => import("./pages/home/About"));
const Contact = lazy(() => import("./pages/home/Contact"));
const FAQ = lazy(() => import("./pages/home/FAQ"));
const Cart = lazy(() => import("./pages/home/Cart"));

// Auth
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));

// Admin
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const UsersManagement = lazy(() => import("./pages/admin/UsersManagement"));
const UserDetails = lazy(() => import("./pages/admin/UserDetails"));
const AdminsManagement = lazy(() => import("./pages/admin/AdminsManagement"));
const BooksManagement = lazy(() => import("./pages/admin/BooksManagement"));
const OrdersManagement = lazy(() => import("./pages/admin/OrdersManagement"));
const CategoriesManagement = lazy(() => import("./pages/admin/CategoriesManagement"));
const SubjectsManagement = lazy(() => import("./pages/admin/SubjectsManagement"));
const TeachersManagement = lazy(() => import("./pages/admin/TeachersManagement"));
const DeliveryPriceManagement = lazy(() => import("./pages/admin/DeliveryPriceManagement"));

// Query Client
const queryClient = new QueryClient();

// ScrollToTop Component
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" closeButton duration={3000} richColors />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <Suspense fallback={<div className="text-center py-20">جاري التحميل...</div>}>
            <Routes>
              {/* Public Routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/books" element={<Books />} />
                <Route path="/book/:id" element={<BookDetails />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/cart" element={<Cart />} />
                </Route>
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="users/user-details/:user_code" element={<UserDetails />} />
                <Route path="admins" element={<AdminsManagement />} />
                <Route path="books-management" element={<BooksManagement />} />
                <Route path="orders" element={<OrdersManagement />} />
                <Route path="categories" element={<CategoriesManagement />} />
                <Route path="subjects" element={<SubjectsManagement />} />
                <Route path="teachers" element={<TeachersManagement />} />
                <Route path="delivery-price" element={<DeliveryPriceManagement />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
