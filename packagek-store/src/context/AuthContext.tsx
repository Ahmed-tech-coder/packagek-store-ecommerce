import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { toast } from 'sonner';

interface User {
  user_code: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  academic_year: string;
  user_token: string;
  refresh_token: string;
  token_expiry: string;
  refresh_token_expiry: string;
}

interface Admin {
  admin_code: string;
  admin_name: string;
  phone_number: string;
  admin_token: string;
}

interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  login: (userData: User) => void;
  adminLogin: (adminData: any) => void;
  logout: () => void;
  adminLogout: () => void;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const BASE_API = import.meta.env.VITE_BASE_API;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [admin, setAdmin] = useState<Admin | null>(() => {
    const savedAdmin = localStorage.getItem('admin');
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  // ==========  تجديد التوكن تلقائيًا ==========
  useEffect(() => {
    if (!user?.token_expiry || !user?.refresh_token) return;

    const checkAndRefreshToken = async () => {
      try {
        const expiryTime = new Date(user.token_expiry).getTime();
        const now = Date.now();
        const timeLeft = expiryTime - now;

        if (timeLeft <= 60_000) {
          const formData = new FormData();
          formData.append("refresh_token", user.refresh_token);

          const res = await fetch(`${BASE_API}/user/account/updateUserToken`, {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (data.status === "success") {
            const updatedUser = {
              ...user,
              user_token: data.new_token,
              refresh_token: data.refresh_token,
              token_expiry: data.token_expiry,
              refresh_token_expiry: data.refresh_token_expiry,
            };

            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));

            toast.success("تم تحديث صلاحية الجلسة ", {
              duration: 2000,
              position: "bottom-right",
            });

            console.log("تم تحديث التوكن تلقائيًا");
          } else {
            console.warn(" فشل تحديث التوكن:", data.message);
          }
        }
      } catch (err) {
        console.error("❌ خطأ أثناء تجديد التوكن:", err);
      }
    };


    checkAndRefreshToken();

    const interval = setInterval(checkAndRefreshToken, 30_000);
    return () => clearInterval(interval);
  }, [user?.token_expiry, user?.refresh_token]);

  // ==== User Auth ====
  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // ==== Admin Auth ====
  const adminLogin = (apiData: any) => {
    const formattedAdmin: Admin = {
      admin_code: apiData.admin_code,
      admin_name: apiData.admin_name,
      phone_number: apiData.phone_number,
      admin_token: apiData.admin_token,
    };

    setAdmin(formattedAdmin);
    localStorage.setItem('admin', JSON.stringify(formattedAdmin));
  };

  const adminLogout = () => {
    setAdmin(null);
    localStorage.removeItem('admin');
  };

  const isAuthenticated = !!user;
  const isAdminAuthenticated = !!admin;

  const value = useMemo(
    () => ({
      user,
      admin,
      login,
      adminLogin,
      logout,
      adminLogout,
      isAuthenticated,
      isAdminAuthenticated,
      loading,
    }),
    [user, admin, isAuthenticated, isAdminAuthenticated, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
