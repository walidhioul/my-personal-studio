import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/logo.jpeg";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, lang, setLang } = useLanguage();
  const { user } = useAuth();

  const navLinks = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.courses, href: "/courses" },
    { label: lang === "en" ? "Placement Test" : "اختبار المستوى", href: "/placement-test" },
    { label: t.nav.contact, href: "#contact" },
  ];

  const toggleLang = () => setLang(lang === "en" ? "ar" : "en");

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="To The Moon With English" className="h-10 w-auto rounded-lg" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={toggleLang} className="gap-1.5">
            <Globe size={16} />
            {lang === "en" ? "العربية" : "English"}
          </Button>
          {user ? (
            <Button size="sm" asChild>
              <Link to="/dashboard">{lang === "en" ? "Dashboard" : "لوحة التحكم"}</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link to="/login">{t.nav.login}</Link></Button>
              <Button size="sm" asChild><Link to="/register">{t.nav.startLearning}</Link></Button>
            </>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleLang} className="h-9 w-9">
            <Globe size={18} />
          </Button>
          <button className="text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4">
          <nav className="flex flex-col gap-3 pt-3">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.href} className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              {user ? (
                <Button size="sm" asChild><Link to="/dashboard">{lang === "en" ? "Dashboard" : "لوحة التحكم"}</Link></Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild><Link to="/login">{t.nav.login}</Link></Button>
                  <Button size="sm" asChild><Link to="/register">{t.nav.startLearning}</Link></Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
