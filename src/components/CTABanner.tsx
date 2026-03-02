import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const CTABanner = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-primary py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">{t.cta.title}</h2>
        <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">{t.cta.subtitle}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" variant="secondary" className="font-semibold">{t.cta.trial}</Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">{t.cta.consult}</Button>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
