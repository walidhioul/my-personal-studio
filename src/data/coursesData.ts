import { CEFRLevel } from "./quizData";

export interface Course {
  id: string;
  level: CEFRLevel;
  title: { en: string; ar: string };
  desc: { en: string; ar: string };
  weeks: number;
  price: number;
  perLesson: number;
  rating: number;
  image: string;
}

export const allCourses: Course[] = [
  // A1
  { id: "a1-1", level: "A1", title: { en: "English Foundations", ar: "أساسيات الإنجليزية" }, desc: { en: "Master basic vocabulary, simple grammar, and essential phrases for everyday communication.", ar: "إتقان المفردات الأساسية والقواعد البسيطة والعبارات الأساسية للتواصل اليومي." }, weeks: 8, price: 240, perLesson: 30, rating: 4.9, image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop" },
  { id: "a1-2", level: "A1", title: { en: "Speaking Confidence", ar: "ثقة في التحدث" }, desc: { en: "Build confidence in speaking with practical conversation skills and pronunciation practice.", ar: "بناء الثقة في التحدث مع مهارات محادثة عملية وممارسة النطق." }, weeks: 6, price: 180, perLesson: 30, rating: 4.7, image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&h=250&fit=crop" },
  { id: "a1-3", level: "A1", title: { en: "Grammar Basics", ar: "أساسيات القواعد" }, desc: { en: "Learn fundamental grammar rules and sentence structures in a simple, easy-to-understand way.", ar: "تعلم قواعد النحو الأساسية وهياكل الجمل بطريقة بسيطة وسهلة الفهم." }, weeks: 10, price: 300, perLesson: 30, rating: 5.0, image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=250&fit=crop" },
  // A2
  { id: "a2-1", level: "A2", title: { en: "Everyday English", ar: "الإنجليزية اليومية" }, desc: { en: "Practice real-life situations like shopping, travel, and social interactions.", ar: "ممارسة المواقف الحياتية مثل التسوق والسفر والتفاعلات الاجتماعية." }, weeks: 8, price: 260, perLesson: 32, rating: 4.8, image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop" },
  { id: "a2-2", level: "A2", title: { en: "Reading & Writing", ar: "القراءة والكتابة" }, desc: { en: "Develop reading comprehension and basic writing skills for everyday tasks.", ar: "تطوير مهارات الفهم القرائي والكتابة الأساسية للمهام اليومية." }, weeks: 8, price: 240, perLesson: 30, rating: 4.6, image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop" },
  // B1
  { id: "b1-1", level: "B1", title: { en: "Business English", ar: "الإنجليزية للأعمال" }, desc: { en: "Professional communication skills for workplace success and career advancement.", ar: "مهارات التواصل المهني للنجاح في العمل والتقدم الوظيفي." }, weeks: 12, price: 420, perLesson: 35, rating: 4.8, image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop" },
  { id: "b1-2", level: "B1", title: { en: "Intermediate Grammar", ar: "القواعد المتوسطة" }, desc: { en: "Master complex grammar structures and improve your writing accuracy.", ar: "إتقان هياكل القواعد المعقدة وتحسين دقة الكتابة." }, weeks: 10, price: 350, perLesson: 35, rating: 4.7, image: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=250&fit=crop" },
  // B2
  { id: "b2-1", level: "B2", title: { en: "Advanced Conversation", ar: "محادثة متقدمة" }, desc: { en: "Develop fluency through complex discussions and advanced speaking techniques.", ar: "تطوير الطلاقة من خلال المناقشات المعقدة وتقنيات التحدث المتقدمة." }, weeks: 8, price: 320, perLesson: 40, rating: 4.6, image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=250&fit=crop" },
  { id: "b2-2", level: "B2", title: { en: "IELTS Preparation", ar: "التحضير لـ IELTS" }, desc: { en: "Comprehensive test preparation with proven strategies and practice tests.", ar: "تحضير شامل للاختبار مع استراتيجيات مثبتة واختبارات تدريبية." }, weeks: 16, price: 640, perLesson: 40, rating: 4.9, image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop" },
  // C1
  { id: "c1-1", level: "C1", title: { en: "Academic English", ar: "الإنجليزية الأكاديمية" }, desc: { en: "Master academic writing, research skills, and university-level communication.", ar: "إتقان الكتابة الأكاديمية ومهارات البحث والتواصل على مستوى الجامعة." }, weeks: 14, price: 630, perLesson: 45, rating: 5.0, image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=400&h=250&fit=crop" },
  // C2
  { id: "c2-1", level: "C2", title: { en: "Presentation Mastery", ar: "إتقان العرض التقديمي" }, desc: { en: "Perfect your public speaking and presentation skills for professional excellence.", ar: "إتقان مهارات التحدث أمام الجمهور والعرض التقديمي للتميز المهني." }, weeks: 10, price: 500, perLesson: 50, rating: 4.9, image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=250&fit=crop" },
];
