import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useHomePageData } from "@/hooks/useHomePageData";
import { resolveAsset } from "@/config/api";

const PopularCourses = () => {
  const { t, lang } = useLanguage();
  const { data, isLoading, isError } = useHomePageData();

  const courses = (data?.best_selling_courses ?? []).slice(0, 3);

  return (
    <section className="py-20 bg-muted/40" id="courses">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          {t.courses.title}
        </h2>

        <p className="text-muted-foreground max-w-lg mx-auto mb-14">
          {t.courses.subtitle}
        </p>

        {isLoading ? (
          <p className="text-muted-foreground">
            {lang === "en" ? "Loading..." : "جار التحميل..."}
          </p>
        ) : isError || courses.length === 0 ? (
          <p className="text-muted-foreground">
            {lang === "en"
              ? "No courses available yet."
              : "لا توجد دورات متاحة حتى الآن."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((c) => (
              <div
                key={c.id}
                className="bg-card border border-border rounded-xl overflow-hidden text-start hover:shadow-lg transition-shadow group"
              >
                {/* Thumbnail */}
                <div className="w-full aspect-video overflow-hidden bg-muted">
                  {(c.thumbnail_url || c.picture_url) && (
                    <img
                      src={resolveAsset(c.thumbnail_url || c.picture_url)}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/placeholder.svg";
                      }}
                    />
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5">
                  {/* Level */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary">
                      {c.level}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-foreground mb-4 line-clamp-1">
                    {c.title}
                  </h3>

                  {/* Students + Price */}
                  <div className="flex items-center justify-between mb-4">
                    
                    <span className="font-bold text-foreground">
                      {Number(c.price) === 0
                        ? lang === "en"
                          ? "Free"
                          : "مجاني"
                        : `${c.price} DA`}
                    </span>
                  </div>

                  {/* View Details */}
                  <Button className="w-full" size="sm" asChild>
                    <Link to={`/courses/${c.id}`}>
                      {lang === "en"
                        ? "View Details"
                        : "عرض التفاصيل"}
                    </Link>
                  </Button>
                </div>
              </div>
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