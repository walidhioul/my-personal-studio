export const quizQuestions = [
  // A1 Level (Questions 1-5)
  {
    id: 1,
    level: "A1" as const,
    en: { question: "Hello, my name ____ Sarah.", options: ["am", "is", "are", "be"] },
    ar: { question: "مرحبًا، اسمي ____ سارة.", options: ["am", "is", "are", "be"] },
    correct: 1,
  },
  {
    id: 2,
    level: "A1" as const,
    en: { question: "The meeting starts ____ 9 o'clock.", options: ["in", "at", "on", "by"] },
    ar: { question: "يبدأ الاجتماع ____ الساعة 9.", options: ["in", "at", "on", "by"] },
    correct: 1,
  },
  {
    id: 3,
    level: "A1" as const,
    en: { question: "I ____ coffee every morning before work.", options: ["drink", "drinks", "drinking", "drank"] },
    ar: { question: "أنا ____ القهوة كل صباح قبل العمل.", options: ["drink", "drinks", "drinking", "drank"] },
    correct: 0,
  },
  {
    id: 4,
    level: "A1" as const,
    en: { question: "She ____ from London.", options: ["come", "comes", "coming", "came"] },
    ar: { question: "هي ____ من لندن.", options: ["come", "comes", "coming", "came"] },
    correct: 1,
  },
  {
    id: 5,
    level: "A1" as const,
    en: { question: "There ____ a book on the table.", options: ["is", "are", "am", "be"] },
    ar: { question: "____ كتاب على الطاولة.", options: ["is", "are", "am", "be"] },
    correct: 0,
  },
  // A2 Level (Questions 6-10)
  {
    id: 6,
    level: "A2" as const,
    en: { question: "I ____ to the gym yesterday.", options: ["go", "goes", "went", "going"] },
    ar: { question: "____ إلى صالة الألعاب أمس.", options: ["go", "goes", "went", "going"] },
    correct: 2,
  },
  {
    id: 7,
    level: "A2" as const,
    en: { question: "She is ____ than her sister.", options: ["tall", "taller", "tallest", "more tall"] },
    ar: { question: "هي ____ من أختها.", options: ["tall", "taller", "tallest", "more tall"] },
    correct: 1,
  },
  {
    id: 8,
    level: "A2" as const,
    en: { question: "We ____ dinner when the phone rang.", options: ["have", "had", "were having", "has"] },
    ar: { question: "كنا ____ العشاء عندما رن الهاتف.", options: ["have", "had", "were having", "has"] },
    correct: 2,
  },
  {
    id: 9,
    level: "A2" as const,
    en: { question: "I have ____ been to Paris.", options: ["ever", "never", "yet", "already"] },
    ar: { question: "لم ____ أذهب إلى باريس.", options: ["ever", "never", "yet", "already"] },
    correct: 1,
  },
  {
    id: 10,
    level: "A2" as const,
    en: { question: "You ____ wear a uniform at school.", options: ["must", "can", "should", "might"] },
    ar: { question: "____ ارتداء زي موحد في المدرسة.", options: ["must", "can", "should", "might"] },
    correct: 0,
  },
  // B1 Level (Questions 11-15)
  {
    id: 11,
    level: "B1" as const,
    en: { question: "If I ____ more money, I would travel the world.", options: ["have", "had", "has", "having"] },
    ar: { question: "لو ____ المزيد من المال، لسافرت حول العالم.", options: ["have", "had", "has", "having"] },
    correct: 1,
  },
  {
    id: 12,
    level: "B1" as const,
    en: { question: "The book ____ by millions of people.", options: ["has read", "has been read", "is reading", "reads"] },
    ar: { question: "الكتاب ____ من قبل ملايين الناس.", options: ["has read", "has been read", "is reading", "reads"] },
    correct: 1,
  },
  {
    id: 13,
    level: "B1" as const,
    en: { question: "I wish I ____ speak French fluently.", options: ["can", "could", "may", "will"] },
    ar: { question: "أتمنى لو ____ أتحدث الفرنسية بطلاقة.", options: ["can", "could", "may", "will"] },
    correct: 1,
  },
  {
    id: 14,
    level: "B1" as const,
    en: { question: "She suggested ____ to the new restaurant.", options: ["go", "to go", "going", "went"] },
    ar: { question: "اقترحت ____ إلى المطعم الجديد.", options: ["go", "to go", "going", "went"] },
    correct: 2,
  },
  {
    id: 15,
    level: "B1" as const,
    en: { question: "By next year, I ____ here for ten years.", options: ["will work", "will have worked", "am working", "worked"] },
    ar: { question: "بحلول العام المقبل، ____ هنا لمدة عشر سنوات.", options: ["will work", "will have worked", "am working", "worked"] },
    correct: 1,
  },
  // B2 Level (Questions 16-20)
  {
    id: 16,
    level: "B2" as const,
    en: { question: "Not only ____ the exam, but she also got the highest mark.", options: ["she passed", "did she pass", "she did pass", "passed she"] },
    ar: { question: "ليس فقط ____ الامتحان، بل حصلت أيضًا على أعلى درجة.", options: ["she passed", "did she pass", "she did pass", "passed she"] },
    correct: 1,
  },
  {
    id: 17,
    level: "B2" as const,
    en: { question: "He denied ____ the window.", options: ["break", "to break", "breaking", "broke"] },
    ar: { question: "أنكر ____ النافذة.", options: ["break", "to break", "breaking", "broke"] },
    correct: 2,
  },
  {
    id: 18,
    level: "B2" as const,
    en: { question: "The project, ____ was due last week, has been postponed.", options: ["that", "which", "who", "whom"] },
    ar: { question: "المشروع، ____ كان مستحقًا الأسبوع الماضي، تم تأجيله.", options: ["that", "which", "who", "whom"] },
    correct: 1,
  },
  {
    id: 19,
    level: "B2" as const,
    en: { question: "Had I known about the delay, I ____ later.", options: ["would come", "would have come", "will come", "came"] },
    ar: { question: "لو كنت أعرف عن التأخير، ____ لاحقًا.", options: ["would come", "would have come", "will come", "came"] },
    correct: 1,
  },
  {
    id: 20,
    level: "B2" as const,
    en: { question: "The more you practice, ____ you become.", options: ["better", "the better", "best", "the best"] },
    ar: { question: "كلما تدربت أكثر، ____ أصبحت.", options: ["better", "the better", "best", "the best"] },
    correct: 1,
  },
];

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export function calculateLevel(answers: Record<number, number>): { level: CEFRLevel; score: number; total: number } {
  let score = 0;
  const total = quizQuestions.length;

  quizQuestions.forEach((q) => {
    if (answers[q.id] === q.correct) score++;
  });

  let level: CEFRLevel;
  const pct = score / total;
  if (pct <= 0.25) level = "A1";
  else if (pct <= 0.4) level = "A2";
  else if (pct <= 0.6) level = "B1";
  else if (pct <= 0.75) level = "B2";
  else if (pct <= 0.9) level = "C1";
  else level = "C2";

  return { level, score, total };
}

export const levelColors: Record<CEFRLevel, string> = {
  A1: "bg-green-500",
  A2: "bg-blue-500",
  B1: "bg-yellow-500",
  B2: "bg-orange-500",
  C1: "bg-purple-500",
  C2: "bg-red-500",
};

export const levelTextColors: Record<CEFRLevel, string> = {
  A1: "text-green-600",
  A2: "text-blue-600",
  B1: "text-yellow-600",
  B2: "text-orange-600",
  C1: "text-purple-600",
  C2: "text-red-600",
};
