import { useLanguage } from "@/i18n/LanguageContext";
import logo from "@/assets/logo.jpeg";

const Footer = () => {
  const { t } = useLanguage();

  const links = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.courses, href: "/courses" },
    { label: t.nav.aboutMe, href: "#about" },
    { label: t.nav.contact, href: "#contact" },
  ];

  return (
    <footer id="contact" className="bg-foreground text-background/80 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src={logo}
                alt="To The Moon With English"
                className="h-12 w-auto rounded-lg"
              />
            </div>

            <p className="text-sm text-background/60 max-w-xs">
              {t.footer.description}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">
              {t.footer.quickLinks}
            </h4>

            <ul className="space-y-2 text-sm">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="hover:text-background transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4">
              {t.footer.contactInfo}
            </h4>

            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=ttmw.english@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-background transition-colors"
                >
                  ttmw.english@gmail.com
                </a>
              </li>

              <li>
                <a
                  href="tel:0557439844"
                  className="hover:text-background transition-colors"
                >
                  0557439844
                </a>
              </li>
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
