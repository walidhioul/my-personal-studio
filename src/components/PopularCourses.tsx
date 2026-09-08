import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useHomePageData } from "@/hooks/useHomePageData";
import { resolveAsset } from "@/config/api";

const colors = ["bg-course-pink", "bg-course-green", "bg-course-purple"];

const PopularCourses = () => {
  const { t, lang } = useLanguage();
  const { data, isLoading, isError } = useHomePageData();

  const courses = (data?.best_selling_courses ?? []).slice(0, 3);

  return (
    <section className="py-20 bg-muted/40" id="courses">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{t.courses.title}</h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-14">{t.courses.subtitle}</p>

        {isLoading ? (
          <p className="text-muted-foreground">{lang === "en" ? "Loading..." : "جار التحميل..."}</p>
        ) : isError || courses.length === 0 ? (
          <p className="text-muted-foreground">
            {lang === "en" ? "No courses available yet." : "لا توجد دورات متاحة حتى الآن."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((c, i) => (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                className="bg-card border border-border rounded-xl overflow-hidden text-start hover:shadow-lg transition-shadow"
              >
                <div className={`h-36 ${colors[i % colors.length]} rounded-t-xl overflow-hidden`}>
                  {(c.thumbnail_url || c.thumbnail || c.picture) && (
                    <img
                      src={resolveAsset(c.thumbnail_url || c.thumbnail || c.picture)}
                      alt={c.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground line-clamp-1">{c.title}</h3>
                    <span className="text-xs font-bold text-primary">{c.level}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{c.description}</p>
                  <div className="flex items-center justify-between">
                    <div className={`h-2 w-24 rounded-full ${colors[i % colors.length]} opacity-80`} />
                    <span className="font-bold text-foreground text-sm">
                      {Number(c.price) === 0 ? (lang === "en" ? "Free" : "مجاني") : `$${c.price}`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Button variant="outline" className="mt-10" asChild>
          <Link to="/courses">{t.courses.viewAll}</Link>
        </Button>
      </div>
    </section>
  );
};

export default PopularCourses;
