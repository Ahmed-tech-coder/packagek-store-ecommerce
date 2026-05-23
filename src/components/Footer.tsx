import { Link } from 'react-router-dom';
import { BookOpen, MapPin, Facebook } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="hero-gradient p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-lg">Packjack Store</span>
            </div>
            <p className="text-sm text-muted-foreground">
              أفضل متجر لشراء الكتب المدرسية الإلكترونية لجميع المراحل الدراسية
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  من نحن
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">تواصل معنا</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>بنها – القليوبية</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Facebook className="h-4 w-4 text-blue-600" />
                <a
                  href="https://www.facebook.com/share/17LEey2RzW/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  صفحتنا على فيسبوك
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground space-y-2">
          <p>© {currentYear} Packjack Store. جميع الحقوق محفوظة.</p>
          <p>
            تم تطوير بواسطة{' '}
            <a
              href="https://wa.me/201016148495"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              أحمد رفعت
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
