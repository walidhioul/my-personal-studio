import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import PopularCourses from "@/components/PopularCourses";
import Testimonials from "@/components/Testimonials";
import CTABanner from "@/components/CTABanner";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <WhyChooseSection />
      <PopularCourses />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  );
};

export default Index;
