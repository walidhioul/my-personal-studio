import { useLanguage } from "@/i18n/LanguageContext";

const avatars = ["👩", "👨", "👩‍💼"];

const Testimonials = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{t.testimonials.title}</h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-14">{t.testimonials.subtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.testimonials.items.map((text, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 text-start hover:shadow-lg transition-shadow">
              <p className="text-sm text-muted-foreground mb-6 italic">"{text}"</p>
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-lg">{avatars[i]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
