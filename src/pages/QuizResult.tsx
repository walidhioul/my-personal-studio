import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { CEFRLevel, levelColors, levelTextColors } from "@/data/quizData";
import { Trophy, ArrowRight, RotateCcw, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const levelDescriptions = {
  en: {
    A1: "You're at the Beginner level. You can understand and use familiar everyday expressions and basic phrases.",
    A2: "You're at the Elementary level. You can communicate in simple, routine tasks and describe your background.",
    B1: "You're at the Intermediate level. You can deal with most situations likely to arise while travelling and write simple texts.",
    B2: "You're at the Upper Intermediate level. You can interact with a degree of fluency with native speakers.",
    C1: "You're at the Advanced level. You can express ideas fluently and use language flexibly for social and professional purposes.",
    C2: "You're at the Proficiency level. You can understand virtually everything heard or read with ease.",
  },
  ar: {
    A1: "أنت في مستوى المبتدئ. يمكنك فهم واستخدام التعبيرات اليومية المألوفة والعبارات الأساسية.",
    A2: "أنت في المستوى الأساسي. يمكنك التواصل في المهام البسيطة والروتينية ووصف خلفيتك.",
    B1: "أنت في المستوى المتوسط. يمكنك التعامل مع معظم المواقف أثناء السفر وكتابة نصوص بسيطة.",
    B2: "أنت في المستوى فوق المتوسط. يمكنك التفاعل بدرجة من الطلاقة مع المتحدثين الأصليين.",
    C1: "أنت في المستوى المتقدم. يمكنك التعبير عن الأفكار بطلاقة واستخدام اللغة بمرونة.",
    C2: "أنت في مستوى الإتقان. يمكنك فهم كل ما تسمعه أو تقرأه بسهولة.",
  },
};

const levelNames = {
  en: { A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper Intermediate", C1: "Advanced", C2: "Proficiency" },
  ar: { A1: "مبتدئ", A2: "أساسي", B1: "متوسط", B2: "فوق المتوسط", C1: "متقدم", C2: "إتقان" },
};

const QuizResult = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [result, setResult] = useState<{ level: CEFRLevel; score: number; total: number } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("quizResult");
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      navigate("/placement-test");
    }
  }, [navigate]);

  if (!result) return null;

  const pct = Math.round((result.score / result.total) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg text-center space-y-8">
          {/* Trophy */}
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="text-primary" size={36} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {lang === "en" ? "Your English Level" : "مستواك في الإنجليزية"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {lang === "en" ? `You scored ${result.score}/${result.total} (${pct}%)` : `حصلت على ${result.score}/${result.total} (${pct}%)`}
            </p>
          </div>

          {/* Level Badge */}
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className={`mx-auto w-24 h-24 rounded-2xl ${levelColors[result.level]} flex items-center justify-center mb-4`}>
              <span className="text-white text-3xl font-extrabold">{result.level}</span>
            </div>
            <h2 className={`text-xl font-bold mb-2 ${levelTextColors[result.level]}`}>
              {levelNames[lang][result.level]}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {levelDescriptions[lang][result.level]}
            </p>
          </div>

          {/* Score bar */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">{lang === "en" ? "Score" : "النتيجة"}</span>
              <span className="font-semibold text-foreground">{pct}%</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full">
              <div className={`h-3 rounded-full ${levelColors[result.level]} transition-all duration-500`} style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link to="/courses">
                <BookOpen size={18} />
                {lang === "en" ? "View My Courses" : "عرض دوراتي"}
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="gap-2" asChild>
              <Link to="/placement-test">
                <RotateCcw size={18} />
                {lang === "en" ? "Retake Test" : "إعادة الاختبار"}
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuizResult;
