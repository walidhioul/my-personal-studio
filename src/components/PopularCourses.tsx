import { Button } from "@/components/ui/button";

const courses = [
  {
    title: "English Foundations",
    desc: "Perfect for complete beginners. Learn basic vocabulary, grammar, and conversational skills.",
    color: "bg-course-pink",
  },
  {
    title: "Conversation Master",
    desc: "Build confidence in speaking and understand complex conversations and texts.",
    color: "bg-course-green",
  },
  {
    title: "Fluency Mastery",
    desc: "Achieve near-native fluency with advanced grammar, vocabulary, and cultural nuances.",
    color: "bg-course-purple",
  },
];

const PopularCourses = () => {
  return (
    <section className="py-20 bg-muted/40" id="courses">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Popular Courses
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-14">
          Start your English journey with our most loved courses
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((c) => (
            <div
              key={c.title}
              className="bg-card border border-border rounded-xl overflow-hidden text-left hover:shadow-lg transition-shadow"
            >
              <div className={`h-36 ${c.color} rounded-t-xl`} />
              <div className="p-6">
                <h3 className="font-semibold text-foreground mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{c.desc}</p>
                <div className={`h-2 rounded-full ${c.color} opacity-80`} />
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="mt-10">
          View All Courses
        </Button>
      </div>
    </section>
  );
};

export default PopularCourses;
