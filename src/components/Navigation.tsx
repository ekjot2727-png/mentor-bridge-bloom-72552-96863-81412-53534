import { useState } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { Menu, X, Users, GraduationCap, Heart, MessageCircle, LogOut } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!localStorage.getItem('accessToken');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/');
  };

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
            
            {isAuthenticated && (
              <>
                <a href="/profile-edit" className="text-foreground/80 hover:text-primary transition-colors font-medium text-sm flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Profile
                </a>
                <a href="/messages" className="text-foreground/80 hover:text-primary transition-colors font-medium text-sm flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  Messages
                </a>
                <a href="/connections" className="text-foreground/80 hover:text-primary transition-colors font-medium text-sm">
                  Connections
                </a>
                <a href="/alumni-directory" className="text-foreground/80 hover:text-primary transition-colors font-medium text-sm">
                  Alumni
                </a>
                {user.role === 'admin' && (
                  <a href="/admin/dashboard" className="text-foreground/80 hover:text-primary transition-colors font-medium text-sm">
                    Dashboard
                  </a>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            )}
            
            {!isAuthenticated && (
              <>
                <a href="/admin/login" className="text-foreground/60 hover:text-primary transition-colors font-medium text-sm">
                  Admin
                </a>
              </>
            )}
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
              
              {isAuthenticated && (
                <>
                  <hr className="my-2" />
                  <a href="/profile-edit" className="text-foreground/80 hover:text-primary transition-colors font-medium py-2">
                    Edit Profile
                  </a>
                  <a href="/messages" className="text-foreground/80 hover:text-primary transition-colors font-medium py-2">
                    Messages
                  </a>
                  <a href="/connections" className="text-foreground/80 hover:text-primary transition-colors font-medium py-2">
                    Connections
                  </a>
                  <a href="/alumni-directory" className="text-foreground/80 hover:text-primary transition-colors font-medium py-2">
                    Alumni Directory
                  </a>
                  {user.role === 'admin' && (
                    <a href="/admin/dashboard" className="text-foreground/80 hover:text-primary transition-colors font-medium py-2">
                      Admin Dashboard
                    </a>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-center mt-2"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
              
              {!isAuthenticated && (
                <>
                  <hr className="my-2" />
                  <a href="/admin/login" className="text-foreground/60 hover:text-primary transition-colors font-medium py-2 text-sm">
                    Admin Login
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;