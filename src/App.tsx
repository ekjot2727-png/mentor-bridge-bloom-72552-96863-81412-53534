import { Suspense, lazy, Component, ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import Navigation from "./components/Navigation";

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60000, gcTime: 5 * 60 * 1000 },
  },
});

// Lazy load all pages with error fallbacks
const Index = lazy(() => 
  import("./pages/Index").catch(() => ({ default: () => <div className="p-8">Error loading page</div> }))
);
const NotFound = lazy(() => 
  import("./pages/NotFound").catch(() => ({ default: () => <div className="p-8">404 Not Found</div> }))
);
const About = lazy(() => import("./pages/About").catch(() => ({ default: () => <div className="p-8">Page not found</div> })));
const ContactUs = lazy(() => import("./pages/ContactUs").catch(() => ({ default: () => <div className="p-8">Page not found</div> })));
const Feedback = lazy(() => import("./pages/Feedback").catch(() => ({ default: () => <div className="p-8">Page not found</div> })));
const PortalSelection = lazy(() => import("./pages/PortalSelection").catch(() => ({ default: () => <div className="p-8">Page not found</div> })));
const StudentRegistration = lazy(() => import("./pages/StudentRegistration").catch(() => ({ default: () => <div className="p-8">Page not found</div> })));
const StudentLogin = lazy(() => import("./pages/StudentLogin").catch(() => ({ default: () => <div className="p-8">Page not found</div> })));
const AlumniRegistration = lazy(() => import("./pages/AlumniRegistration").catch(() => ({ default: () => <div className="p-8">Page not found</div> })));
const AlumniLogin = lazy(() => import("./pages/AlumniLogin").catch(() => ({ default: () => <div className="p-8">Page not found</div> })));
const StudentPortal = lazy(() => import("./pages/StudentPortal").catch(() => ({ default: () => <div className="p-8">Page not found</div> })));
const AlumniPortal = lazy(() => import("./pages/AlumniPortal").catch(() => ({ default: () => <div className="p-8">Page not found</div> })));
const AdminLogin = lazy(() => import("./pages/AdminLogin").catch(() => ({ default: () => <div className="p-8">Page not found</div> })));

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

// Error boundary
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("Error boundary caught:", error);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="text-center max-w-md p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">⚠️ Error</h1>
            <p className="text-red-500 mb-4 text-sm">{this.state.error?.message || "Something went wrong"}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Main App component
const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background text-foreground">
              <Navigation />
              <Suspense fallback={<Loading />}>
                <Routes>
                  {/* Main Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/feedback" element={<Feedback />} />
                  
                  {/* Portal Selection */}
                  <Route path="/portal-selection" element={<PortalSelection />} />
                  
                  {/* Student Routes */}
                  <Route path="/student-login" element={<StudentLogin />} />
                  <Route path="/student-registration" element={<StudentRegistration />} />
                  <Route path="/student-portal" element={<StudentPortal />} />
                  
                  {/* Alumni Routes */}
                  <Route path="/alumni-login" element={<AlumniLogin />} />
                  <Route path="/alumni-registration" element={<AlumniRegistration />} />
                  <Route path="/alumni-portal" element={<AlumniPortal />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin-login" element={<AdminLogin />} />
                  
                  {/* Catch all - 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Toaster />
              <Sonner />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
