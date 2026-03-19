import { useLanguage } from "@/i18n/LanguageContext";
import logo from "@/assets/logo.jpeg";

const Footer = () => {
  const { t } = useLanguage();

  const links = [t.nav.home, t.nav.courses, t.nav.aboutMe, t.nav.contact];

  return (
    <footer className="bg-foreground text-background/80 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={logo} alt="To The Moon With English" className="h-12 w-auto rounded-lg" />
            </div>
            <p className="text-sm text-background/60 max-w-xs">{t.footer.description}</p>
          </div>
          <div>
            <h4 className="font-semibold text-background mb-4">{t.footer.quickLinks}</h4>
            <ul className="space-y-2 text-sm">
              {links.map((l) => (
                <li key={l}><a href="#" className="hover:text-background transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-background mb-4">{t.footer.contactInfo}</h4>
            <ul className="space-y-2 text-sm">
              <li>info@tothemoonwithenglish.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/10 pt-6 text-center text-xs text-background/40">
          {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
