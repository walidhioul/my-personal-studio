import { useLanguage } from "@/i18n/LanguageContext";
import { useHomePageData } from "@/hooks/useHomePageData";

const Testimonials = () => {
  const { t, lang } = useLanguage();
  const { data, isLoading, isError } = useHomePageData();

  const feedbacks = (data?.featured_feedbacks ?? [])
    .filter((fb) => fb.comment && fb.comment.trim().length > 0)
    .slice(0, 6);


  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{t.testimonials.title}</h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-14">{t.testimonials.subtitle}</p>

        {isLoading ? (
          <p className="text-muted-foreground">{lang === "en" ? "Loading..." : "جار التحميل..."}</p>
        ) : isError || feedbacks.length === 0 ? (
          <p className="text-muted-foreground">
            {lang === "en" ? "No feedbacks yet." : "لا توجد تقييمات بعد."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="bg-card border border-border rounded-xl p-6 text-start hover:shadow-lg transition-shadow"
              >
                {fb.comment && (
                  <p className="text-sm text-muted-foreground mb-4 italic">"{fb.comment}"</p>
                )}
                {fb.rating > 0 && (
                  <div className="text-xs text-muted-foreground">⭐ {fb.rating}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
