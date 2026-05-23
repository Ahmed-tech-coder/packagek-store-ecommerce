'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.error('من فضلك املأ كل البيانات المطلوبة ✍️');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('تم إرسال الرسالة بنجاح 🎉', {
        description: 'فريق الدعم هيرد عليك في أقرب وقت ممكن.',
      });
      setForm({ name: '', email: '', message: '' });
    }, 1200);
  };

  const info = [
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      text: 'support@backjeekstore.com',
      color: 'text-primary',
    },
    {
      icon: Phone,
      title: 'رقم الهاتف',
      text: '+20 100 000 0000',
      color: 'text-green-500',
    },
    {
      icon: MapPin,
      title: 'العنوان',
      text: 'القاهرة - مصر',
      color: 'text-red-500',
    },
    {
      icon: Clock,
      title: 'ساعات العمل',
      text: 'كل يوم من 9 صباحًا لـ 9 مساءً',
      color: 'text-yellow-500',
    },
  ];

  return (
    <section className="min-h-screen py-20 container mx-auto px-6 mt-40 lg:mt-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-6"
        >
          <Send className="h-10 w-10 text-primary" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-[hsl(var(--accent-gradient-to))] bg-clip-text text-transparent">
          تواصل معنا
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          بنرحب بأي استفسار أو اقتراح. فريقنا موجود دايمًا علشان يسمعك ويساعدك
        </p>
      </motion.div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto items-start">
        {/* Info Cards */}
        <motion.div
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 },
            },
          }}
        >
          {info.map((item, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ x: 8 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-4 p-6 bg-card border rounded-2xl shadow-card hover:shadow-card-lg transition-all"
            >
              <div className={`p-3 rounded-full bg-muted/40 ${item.color}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">{item.title}</h4>
                <p className="text-muted-foreground">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="space-y-5 bg-card/80 backdrop-blur-xl border p-8 rounded-2xl shadow-card-lg"
        >
          <motion.div whileFocus={{ scale: 1.02 }}>
            <Input
              placeholder="الاسم الكامل"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="py-6 text-lg"
            />
          </motion.div>
          <motion.div whileFocus={{ scale: 1.02 }}>
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="py-6 text-lg"
            />
          </motion.div>
          <motion.div whileFocus={{ scale: 1.02 }}>
            <Textarea

              placeholder="اكتب رسالتك هنا..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={6}
              required
              className="text-lg resize-none"
            />
          </motion.div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 text-lg font-semibold hero-gradient shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="border-2 border-white border-t-transparent rounded-full w-6 h-6 mx-auto"
              />
            ) : (
              <>
                إرسال الرسالة
                <Send className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </motion.form>
      </div>

      {/* Footer Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center mt-16 text-muted-foreground"
      >
        📬 لو عندك استفسار عاجل، ابعتلنا مباشرة على{' '}
        <span className="text-primary font-medium">support@packjeekstore.com</span>
      </motion.div>
    </section>
  );
}
