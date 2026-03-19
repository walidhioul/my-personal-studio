import { Button } from "@/components/ui/button";
import { Play, Monitor } from "lucide-react";
import heroFigure from "@/assets/hero-figure.png";
import { useLanguage } from "@/i18n/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
            {t.hero.titleLine1}
            <br />
            {t.hero.titleLine2}{" "}
            <span className="text-primary">{t.hero.titleHighlight}</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg">{t.hero.description}</p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="gap-2"><Play size={16} /> {t.hero.cta}</Button>
            <Button variant="outline" size="lg" className="gap-2"><Monitor size={16} /> {t.hero.demo}</Button>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <img src={heroFigure} alt="Student character" className="w-full max-w-sm object-contain" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
