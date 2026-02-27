import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Courses", href: "#courses" },
  { label: "About Me", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">🌙</span>
          </div>
          <div className="leading-tight">
            <span className="font-bold text-foreground text-sm">To The Moon</span>
            <br />
            <span className="text-muted-foreground text-xs">With English</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm">Login</Button>
          <Button size="sm">Start Learning</Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4">
          <nav className="flex flex-col gap-3 pt-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm">Login</Button>
              <Button size="sm">Start Learning</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
