// import { useParams } from 'react-router-dom';
// import { BookCard } from '@/components/BookCard';
// import { books } from '@/data/books';
// import { motion } from 'framer-motion';

// export default function Category() {
//   const { level } = useParams<{ level: string }>();

//   // Mapping from URL slug to the grade name in data
//   const gradeMap: { [key: string]: string } = {
//     'اول-ثانوي': 'الصف الأول الثانوي',
//     'ثاني-ثانوي': 'الصف الثاني الثانوي',
//     'ثالث-انوي': 'الصف الثالث الثانوي',
//   };

//   const gradeName = level ? gradeMap[level] : 'المرحلة الثانوية';

//   const filteredBooks = books.filter((book) => book.grade === gradeName);

//   const container = {
//     hidden: { opacity: 0 },
//     show: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//       },
//     },
//   };

//   const item = {
//     hidden: { opacity: 0, y: 20 },
//     show: { opacity: 1, y: 0 },
//   };

//   return (
//     <div className="min-h-screen py-8 mt-40 lg:mt-24">
//       <div className="container mx-auto px-4">
//         <div className="mb-8 text-center">
//           <h1 className="text-3xl md:text-4xl font-bold mb-4">📚 كتب {gradeName}</h1>
//           <p className="text-muted-foreground text-lg">
//             تصفح جميع الكتب المتاحة لـ {gradeName}
//           </p>
//         </div>

//         {filteredBooks.length > 0 ? (
//           <motion.div
//             variants={container}
//             initial="hidden"
//             animate="show"
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
//           >
//             {filteredBooks.map((book) => (
//               <motion.div key={book.id} variants={item}>
//                 <BookCard book={book} />
//               </motion.div>
//             ))}
//           </motion.div>
//         ) : (
//           <div className="text-center py-16">
//             <p className="text-xl text-muted-foreground">لا توجد كتب متاحة حاليًا لهذا الصف</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }