const Footer = () => {
  return (
    <footer className="bg-foreground text-background/80 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm">🌙</span>
              </div>
            </div>
            <p className="text-sm text-background/60 max-w-xs">
              Empowering students to achieve English fluency through personalized learning, expert guidance, and proven methodologies.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-background mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {["Home", "Courses", "About Me", "Contact"].map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-background transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-background mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm">
              <li>info@tothemoonwithenglish.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 pt-6 text-center text-xs text-background/40">
          © 2024 To The Moon With English. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
