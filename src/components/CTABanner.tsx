import { Button } from "@/components/ui/button";

const CTABanner = () => {
  return (
    <section className="bg-primary py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
          Ready to Launch Your English Journey?
        </h2>
        <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
          Join hundreds of successful students who have transformed their English skills and achieved their dreams.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            variant="secondary"
            className="font-semibold"
          >
            Start Free Trial
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
          >
            Schedule Consultation
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
