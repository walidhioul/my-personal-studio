import { BookOpen, Video, Award, UserCheck, Globe, Languages } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const icons = [BookOpen, Video, Award, UserCheck, Globe, Languages];

const WhyChooseSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20" id="about">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{t.why.title}</h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-14">{t.why.subtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.why.features.map((f, i) => {
            const Icon = icons[i];
            return (
              <div key={i} className="bg-card border border-border rounded-xl p-6 text-start hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
