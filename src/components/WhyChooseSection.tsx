import { BookOpen, Video, Award, UserCheck, Globe, Languages } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Structured Learning Path",
    desc: "Follow a clear progression from A1 to C2 levels with carefully designed curriculum and milestones.",
  },
  {
    icon: Video,
    title: "Live & Recorded Lessons",
    desc: "Access high-quality video lessons anytime and join interactive live sessions for real-time practice.",
  },
  {
    icon: Award,
    title: "Certified Progress",
    desc: "Earn recognized certificates as you complete each level and track your improvement journey.",
  },
  {
    icon: UserCheck,
    title: "Personal Attention",
    desc: "Get individual feedback, customized study plans, and direct access to your instructor.",
  },
  {
    icon: Globe,
    title: "Learn Anywhere",
    desc: "Access your courses on any device with our responsive platform and mobile-friendly design.",
  },
  {
    icon: Languages,
    title: "Bilingual Support",
    desc: "Learn with English-Arabic support, making complex concepts easier to understand.",
  },
];

const WhyChooseSection = () => {
  return (
    <section className="py-20" id="about">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Why Choose My English Academy?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-14">
          Experience personalized learning with proven methods that have helped hundreds of students achieve fluency
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card border border-border rounded-xl p-6 text-left hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                <f.icon className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
