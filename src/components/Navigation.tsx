import { useState } from "react";
import { Button } from "./ui/button";
import { Menu, X, Users, GraduationCap, Heart, MessageCircle } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <GraduationCap className="h-8 w-8 text-primary" />
              <Heart className="h-4 w-4 text-accent absolute -top-1 -right-1" />
            </div>
            <span className="text-xl font-bold hero-text">AlNet</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              Home
            </a>
            <a href="/about" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              About
            </a>
            <a href="/contact" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              Contact Us
            </a>
            <a href="/feedback" className="text-foreground/80 hover:text-primary transition-colors font-medium">
              Feedback
            </a>
            <a href="/admin/login" className="text-foreground/60 hover:text-primary transition-colors font-medium text-sm">
              Admin
            </a>
          </div>


          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-foreground p-2"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 glass-effect border-t border-border/20 p-6">
            <div className="flex flex-col gap-4">
              <a href="/" className="text-foreground/80 hover:text-primary transition-colors font-medium py-2">
                Home
              </a>
              <a href="/about" className="text-foreground/80 hover:text-primary transition-colors font-medium py-2">
                About
              </a>
              <a href="/contact" className="text-foreground/80 hover:text-primary transition-colors font-medium py-2">
                Contact Us
              </a>
              <a href="/feedback" className="text-foreground/80 hover:text-primary transition-colors font-medium py-2">
                Feedback
              </a>
              <a href="/admin/login" className="text-foreground/60 hover:text-primary transition-colors font-medium py-2 text-sm">
                Admin
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;