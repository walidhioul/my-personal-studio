import { Button } from "@/components/ui/button";
import { Play, Monitor } from "lucide-react";
import heroImg from "@/assets/hero-student.png";

const HeroSection = () => {
  return (
    <section className="bg-accent/30 py-16 md:py-24">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        {/* Text */}
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
            Launch Your
            <br />
            English Journey{" "}
            <span className="text-primary">to Success</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg">
            Master English with personalized lessons, structured courses, and expert guidance. From A1 to C2, I'll help you reach fluency faster than ever.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="gap-2">
              <Play size={16} /> Start Your Journey
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Monitor size={16} /> Watch Demo
            </Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="flex-1 flex justify-center">
          <img
            src={heroImg}
            alt="Student learning English with books and laptop"
            className="w-full max-w-md object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
