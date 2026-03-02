import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { quizQuestions, calculateLevel, levelColors } from "@/data/quizData";
import { Clock, ListChecks, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PlacementTest = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const answered = Object.keys(answers).length;
  const total = quizQuestions.length;
  const progressPct = (answered / total) * 100;

  const handleSelect = (questionId: number, optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmit = () => {
    const result = calculateLevel(answers);
    localStorage.setItem("quizResult", JSON.stringify(result));
    navigate("/result");
  };

  const levels = ["A1", "A2", "B1", "B2"] as const;
  const levelLabels = {
    en: { A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper Int." },
    ar: { A1: "مبتدئ", A2: "أساسي", B1: "متوسط", B2: "فوق المتوسط" },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-xl">🎓</span>
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg">
                {lang === "en" ? "Cambridge Assessment" : "تقييم كامبريدج"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {lang === "en" ? "English Placement Test" : "اختبار تحديد المستوى"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Clock size={16} /> {lang === "en" ? "45 minutes" : "45 دقيقة"}</span>
            <span className="flex items-center gap-1.5"><ListChecks size={16} /> {total} {lang === "en" ? "Questions" : "سؤال"}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h3 className="font-semibold text-foreground mb-4">
                {lang === "en" ? "Test Progress" : "تقدم الاختبار"}
              </h3>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">{lang === "en" ? "Completed" : "مكتمل"}</span>
                <span className="text-primary font-medium">{answered}/{total}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full mb-6">
                <div className="h-2 bg-primary rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
              </div>

              <h4 className="font-medium text-foreground text-sm mb-3">
                {lang === "en" ? "CEFR Levels" : "مستويات CEFR"}
              </h4>
              <div className="space-y-2.5">
                {levels.map((lv) => (
                  <div key={lv} className="flex items-center gap-2.5 text-sm">
                    <div className={`w-3 h-3 rounded-full ${levelColors[lv]}`} />
                    <span className="text-foreground">{lv} - {levelLabels[lang][lv]}</span>
                  </div>
                ))}
              </div>

              {answered === total && (
                <Button className="w-full mt-6" onClick={handleSubmit}>
                  {lang === "en" ? "Submit Test" : "إرسال الاختبار"}
                </Button>
              )}
            </div>
          </aside>

          {/* Questions */}
          <div className="flex-1 max-w-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {lang === "en" ? "English Placement Test" : "اختبار تحديد المستوى"}
              </h2>
              <p className="text-muted-foreground">
                {lang === "en"
                  ? "This adaptive test will assess your English proficiency level. Choose the best answer for each question."
                  : "سيقيّم هذا الاختبار مستواك في اللغة الإنجليزية. اختر أفضل إجابة لكل سؤال."}
              </p>
            </div>

            <div className="space-y-8">
              {quizQuestions.map((q, idx) => {
                const qData = lang === "en" ? q.en : q.ar;
                const levelColor = levelColors[q.level];
                return (
                  <div key={q.id} className="border-t border-border pt-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-8 h-8 rounded-full ${levelColor} text-white flex items-center justify-center text-sm font-bold shrink-0`}>
                        {idx + 1}
                      </div>
                      <p className="text-foreground font-medium pt-1">{qData.question}</p>
                    </div>
                    <div className="space-y-3 ms-11">
                      {qData.options.map((opt, optIdx) => {
                        const isSelected = answers[q.id] === optIdx;
                        return (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:bg-muted/50"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected ? "border-primary" : "border-muted-foreground/40"
                            }`}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                            </div>
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              className="sr-only"
                              checked={isSelected}
                              onChange={() => handleSelect(q.id, optIdx)}
                            />
                            <span className="text-foreground text-sm">
                              {String.fromCharCode(65 + optIdx)}) {opt}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {answered === total && (
              <div className="mt-10 text-center">
                <Button size="lg" onClick={handleSubmit} className="gap-2">
                  <CheckCircle2 size={18} />
                  {lang === "en" ? "Submit & See My Level" : "إرسال ومعرفة مستواي"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PlacementTest;
