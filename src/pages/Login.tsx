import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";
import { Globe, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const { t, lang, setLang } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Connect to your Laravel backend
    // Example: await fetch('https://your-api.com/api/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    console.log("Login submitted:", { email, password });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary-foreground blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary-foreground blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🌙</span>
          </div>
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">To The Moon With English</h2>
          <p className="text-primary-foreground/70 text-lg max-w-md">
            {lang === "en"
              ? "Your journey to English fluency starts here. Log in to continue learning."
              : "رحلتك نحو إتقان الإنجليزية تبدأ هنا. سجل دخولك لمتابعة التعلم."}
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="flex justify-between items-center p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">🌙</span>
            </div>
            <span className="font-bold text-foreground text-sm lg:hidden">To The Moon</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setLang(lang === "en" ? "ar" : "en")} className="gap-1.5">
            <Globe size={16} />
            {lang === "en" ? "العربية" : "English"}
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm space-y-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">{t.auth.loginTitle}</h1>
              <p className="text-muted-foreground mt-2 text-sm">{t.auth.loginSubtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t.auth.email}</label>
                <Input
                  type="email"
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">{t.auth.password}</label>
                  <a href="#" className="text-xs text-primary hover:underline">{t.auth.forgotPassword}</a>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t.auth.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t.auth.loggingIn : t.auth.loginButton}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {t.auth.noAccount}{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">
                {t.auth.registerLink}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
