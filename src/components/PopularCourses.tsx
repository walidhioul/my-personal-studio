import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const colors = ["bg-course-pink", "bg-course-green", "bg-course-purple"];

const PopularCourses = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-muted/40" id="courses">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{t.courses.title}</h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-14">{t.courses.subtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.courses.items.map((c, i) => (
            <div key={i} className="bg-card border border-border rounded-xl overflow-hidden text-start hover:shadow-lg transition-shadow">
              <div className={`h-36 ${colors[i]} rounded-t-xl`} />
              <div className="p-6">
                <h3 className="font-semibold text-foreground mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{c.desc}</p>
                <div className={`h-2 rounded-full ${colors[i]} opacity-80`} />
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="mt-10">{t.courses.viewAll}</Button>
      </div>
    </section>
  );
};

export default PopularCourses;
