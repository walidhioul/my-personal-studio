const testimonials = [
  {
    text: "The structured approach and personal attention helped me improve from A2 to B2 in just 6 months. The live sessions were incredibly valuable!",
    avatar: "👩",
  },
  {
    text: "Amazing teacher! The bilingual support made learning so much easier. I finally feel confident speaking English at work.",
    avatar: "👨",
  },
  {
    text: "The course materials are excellent and the platform is so easy to use. I love being able to learn at my own pace.",
    avatar: "👩‍💼",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Student Success Stories
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-14">
          See how our students transformed their English skills
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-6 text-left hover:shadow-lg transition-shadow"
            >
              <p className="text-sm text-muted-foreground mb-6 italic">
                "{t.text}"
              </p>
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-lg">
                {t.avatar}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
