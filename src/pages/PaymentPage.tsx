import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  CreditCard,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const PaymentPage = () => {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const location = useLocation();

  const isRtl = lang === "ar";

  // Course information can be passed from the previous page
  const course = location.state?.course;

  const whatsappNumber = "213551300060";

  const whatsappMessage = course
    ? `Hello, I want to enroll in the course "${course.title}".`
    : "Hello, I want to enroll in a course.";

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <div
      className="min-h-screen bg-background"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className="h-14 bg-card border-b border-border flex items-center px-4">
        <Link
          to={id ? `/courses/${id}` : "/courses"}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}

          <span>
            {lang === "en" ? "Back to Course" : "العودة إلى الدورة"}
          </span>
        </Link>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-card border border-border rounded-xl overflow-hidden">

          {/* Header section */}
          <div className="p-6 border-b border-border text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CreditCard
                size={26}
                className="text-primary"
              />
            </div>

            <h1 className="text-2xl font-bold text-foreground">
              {lang === "en"
                ? "Enroll in this Course"
                : "التسجيل في هذه الدورة"}
            </h1>

            <p className="text-sm text-muted-foreground mt-2">
              {lang === "en"
                ? "Follow the steps below to complete your enrollment."
                : "اتبع الخطوات التالية لإتمام التسجيل."}
            </p>

            {course?.title && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm font-medium">
                <BookOpen size={16} />
                {course.title}
              </div>
            )}
          </div>

          {/* Steps */}
          <div className="p-6 space-y-6">

            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                1
              </div>

              <div>
                <h2 className="font-semibold text-foreground">
                  {lang === "en"
                    ? "Contact us on WhatsApp"
                    : "تواصل معنا عبر واتساب"}
                </h2>

                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {lang === "en"
                    ? "Send us a WhatsApp message using the button below to request enrollment."
                    : "أرسل لنا رسالة عبر واتساب باستخدام الزر أدناه لطلب التسجيل."}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                2
              </div>

              <div>
                <h2 className="font-semibold text-foreground">
                  {lang === "en"
                    ? "Complete the payment"
                    : "إتمام الدفع"}
                </h2>

                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {lang === "en"
                    ? "Our team will provide you with the payment instructions and help you complete your enrollment."
                    : "سيقدم لك فريقنا معلومات الدفع ويساعدك على إتمام عملية التسجيل."}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                3
              </div>

              <div>
                <h2 className="font-semibold text-foreground">
                  {lang === "en"
                    ? "Get access to the course"
                    : "الحصول على الوصول إلى الدورة"}
                </h2>

                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {lang === "en"
                    ? "Once your enrollment is confirmed, you will get access to all course lessons and resources."
                    : "بعد تأكيد تسجيلك، ستحصل على إمكانية الوصول إلى جميع دروس وموارد الدورة."}
                </p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="border border-border rounded-lg p-5 bg-muted/30">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle
                  size={22}
                  className="text-green-500"
                />

                <div>
                  <p className="font-semibold text-foreground">
                    {lang === "en"
                      ? "Contact us on WhatsApp"
                      : "تواصل معنا عبر واتساب"}
                  </p>

                  <p
                    dir="ltr"
                    className="text-sm text-muted-foreground mt-0.5"
                  >
                    0551 30 00 60
                  </p>
                </div>
              </div>

              <Button
                asChild
                className="w-full gap-2"
                size="lg"
              >
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={18} />

                  {lang === "en"
                    ? "Contact us on WhatsApp"
                    : "تواصل معنا عبر واتساب"}
                </a>
              </Button>
            </div>

            {/* Note */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2
                size={15}
                className="text-primary shrink-0 mt-0.5"
              />

              <p>
                {lang === "en"
                  ? "Your course access will be activated after your enrollment is confirmed."
                  : "سيتم تفعيل الوصول إلى الدورة بعد تأكيد تسجيلك."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentPage;