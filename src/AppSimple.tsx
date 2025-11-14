import { Suspense, lazy, Component, ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Create query client
const queryClient = new QueryClient();

// Lazy load main pages only
const Index = lazy(() => import("./pages/Index").catch(() => ({ default: () => <div>Page not found</div> })));
const NotFound = lazy(() => import("./pages/NotFound").catch(() => ({ default: () => <div>404 Not Found</div> })));

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
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center min-h-screen bg-red-50">
    <div className="text-center max-w-md">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading App</h1>
      <p className="text-red-500 mb-4">{error?.message || "An error occurred"}</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Reload Page
      </button>
    </div>
  </div>
);

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
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error || new Error("Unknown error")} />;
    }
    return this.props.children;
  }
}

const AppSimple = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-white">
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Index />} />
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

export default AppSimple;
