import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Home } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="hero-gradient p-4 rounded-2xl">
            <BookOpen className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="mb-4 text-6xl font-bold">404</h1>
        <p className="mb-8 text-2xl text-muted-foreground">عذراً! الصفحة غير موجودة</p>
        <Button size="lg" asChild className="hero-gradient gap-2">
          <Link to="/">
            <Home className="h-5 w-5" />
            العودة للرئيسية
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
