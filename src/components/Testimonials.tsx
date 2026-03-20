import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { getFeedbacks } from "@/api/feedback";
import { Feedback } from "@/types/feedback";

const Testimonials = () => {
  const { t } = useLanguage();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeedbacks()
      .then((res) => {
        // Filter only approved feedbacks and take first 6
        const approvedFeedbacks = res.data
          .filter((fb) => fb.is_approved)
          .slice(0, 6);
        setFeedbacks(approvedFeedbacks);
      })
      .catch(() => setFeedbacks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{t.testimonials.title}</h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-14">{t.testimonials.subtitle}</p>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : feedbacks.length === 0 ? (
          <p className="text-muted-foreground">No feedbacks yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="bg-card border border-border rounded-xl p-6 text-start hover:shadow-lg transition-shadow"
              >
                <p className="text-sm text-muted-foreground mb-4 italic">
                  "{fb.comment ?? "No comment"}"
                </p>
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