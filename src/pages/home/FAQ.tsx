'use client';

import { motion } from 'framer-motion';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

export default function FAQ() {
    const faqs = [
        {
            q: 'إزاي أشتري كتاب من الموقع؟',
            a: 'سهل جدًا، تختار الكتاب اللي عاجبك، تضيفه للسلة، وتكمل الدفع. بعد شوية هيوصل لك تأكيد الطلب وكل التفاصيل عندك على طول.',
        },
        {
            q: 'الكتب رقمية ولا ورقية؟',
            a: 'عندنا الاتنين، فيه كتب PDF تقدر تقراها على الكمبيوتر أو الموبايل، وفيه كتب ورقية نوصلها لحد عندك.',
        },
        {
            q: 'الشحن متاح لكل المحافظات؟',
            a: 'أيوه، نوصل لأي محافظة في مصر وبأقل تكلفة وفي أسرع وقت ممكن.',
        },
        {
            q: 'هل في خصومات للطلاب أو المدرسين؟',
            a: 'أكيد، عندنا عروض وخصومات على طول للطلاب والمدرسين المسجلين معانا.',
        },
        {
            q: 'إزاي أتواصل مع خدمة العملاء؟',
            a: 'تقدر تبعتلنا من صفحة "تواصل معنا" أو على الإيميل support@backjeekstore.com، وهنتواصل معاك بسرعة.',
        },
    ];

    return (
        <section className="min-h-screen py-20 container mx-auto px-6 mt-40 lg:mt-24">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="text-center mb-16"
            >
                <div className="flex items-center justify-center mb-4">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="p-4 rounded-full bg-primary/10 text-primary"
                    >
                        <HelpCircle className="h-10 w-10" />
                    </motion.div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-[hsl(var(--accent-gradient-to))] bg-clip-text text-transparent">
                    الأسئلة اللي بنسمعها على طول
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    جمعنالك أهم الأسئلة علشان نوفر عليك وقتك ونخلي تجربتك سهلة وبسيطة
                </p>
            </motion.div>

            {/* FAQ Accordion */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.15 },
                    },
                }}
                className="max-w-3xl mx-auto space-y-4"
            >
                {faqs.map((faq, i) => (
                    <motion.div
                        key={i}
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                        }}
                    >
                        <Accordion type="single" collapsible>
                            <AccordionItem
                                value={`faq-${i}`}
                                className="border rounded-xl bg-card shadow-card transition-all hover:shadow-card-lg hover:-translate-y-1"
                            >
                                <AccordionTrigger className="text-lg font-medium px-6 py-5 hover:bg-muted/50 rounded-t-xl transition-colors">
                                    {faq.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground px-6 pb-5 leading-relaxed">
                                    {faq.a}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
