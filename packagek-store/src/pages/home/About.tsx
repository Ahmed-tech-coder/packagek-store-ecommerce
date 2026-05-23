'use client';

import { motion } from 'framer-motion';
import { Users, Target, Heart, Star } from 'lucide-react';

export default function About() {
    const features = [
        {
            icon: Target,
            title: 'رؤيتنا',
            text: 'عايزين نكون منصة تعليمية رقمية تخلي الطلاب يوصلوا للمعرفة بسهولة ومن غير وجع دماغ، وتكون تجربة ممتعة كمان.',
            color: 'from-blue-500 to-indigo-500',
        },
        {
            icon: Users,
            title: 'فريقنا',
            text: 'مجموعة من المدرسين والمطورين اللي بيحبوا التعليم الرقمي وعايزين يبنوا مستقبل الطلاب بطريقة سهلة وممتعة.',
            color: 'from-emerald-500 to-green-600',
        },
        {
            icon: Star,
            title: 'قيمنا',
            text: 'الاحترافية والبساطة والابتكار في كل تفصيلة صغيرة، لأن التفاصيل الصغيرة هي اللي بتفرق جامد.',
            color: 'from-amber-500 to-yellow-500',
        },
        {
            icon: Heart,
            title: 'مهمتنا',
            text: 'نقدّم تجربة تعلم مختلفة تحببك في المذاكرة وتخلي الوصول للمعلومة أسهل وأمتع.',
            color: 'from-pink-500 to-rose-500',
        },
    ];

    return (
        <section className="min-h-screen py-20 container mx-auto px-6 mt-40 lg:mt-24">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="max-w-3xl mx-auto text-center mb-20"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-20 h-20 rounded-full mx-auto mb-8 bg-gradient-to-br from-primary to-[hsl(var(--accent-gradient-to))] flex items-center justify-center shadow-lg"
                >
                    <Users className="h-10 w-10 text-white" />
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-[hsl(var(--accent-gradient-to))] bg-clip-text text-transparent">
                    إحنا مين؟
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    في <span className="text-primary font-semibold">باكچيك ستور</span>، إحنا مش مجرد مكتبة إلكترونية. 
                    إحنا مشروع تعليمي بيحاول يسهّل على الطلاب يوصلوا للكتب والمذكرات من غير وجع دماغ، 
                    وبنشتغل على كل تفصيلة صغيرة علشان تجربتك تبقى سهلة وممتعة.
                </p>
            </motion.div>

            {/* Stats Section */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center mb-20"
            >
                {[
                    { label: 'طلاب مبسوطين', value: '25K+' },
                    { label: 'كتب ومذكرات', value: '1.2K+' },
                    { label: 'مدرسين ومطورين', value: '40+' },
                    { label: 'سنين خبرة', value: '5+' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="p-6 bg-card border rounded-2xl shadow-card hover:shadow-card-lg transition-all"
                    >
                        <h3 className="text-3xl font-bold text-primary mb-1">{stat.value}</h3>
                        <p className="text-muted-foreground text-sm">{stat.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Features */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
                }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
            >
                {features.map((feature, i) => (
                    <motion.div
                        key={i}
                        variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                        whileHover={{ y: -8, scale: 1.03 }}
                        transition={{ duration: 0.3 }}
                        className="bg-card border rounded-2xl p-8 text-center shadow-card hover:shadow-card-lg transition-all"
                    >
                        <div
                            className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-md`}
                        >
                            <feature.icon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.text}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Closing Message */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-center mt-24"
            >
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    إحنا مؤمنين إن التعليم مش بس كتب، لكنه رحلة فيها شغف وحب المعرفة. 
                   <br /> ومع  <span className="text-primary font-semibold ">باكچيك ستور</span>، الرحلة دي هتكون أسهل وأمتع.
                </p>
            </motion.div>
        </section>
    );
}
