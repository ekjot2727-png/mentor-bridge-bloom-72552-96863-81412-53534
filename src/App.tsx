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

// Safe lazy import wrapper
const safeImport = (importFn: () => Promise<any>, name: string) => {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (err) {
      console.error(`Error loading ${name}:`, err);
      return { default: () => <div className="p-8">Error loading {name}</div> };
    }
  });
};

// All page imports with error handling
const Index = safeImport(() => import("./pages/Index"), "Index");
const NotFound = safeImport(() => import("./pages/NotFound"), "NotFound");
const About = safeImport(() => import("./pages/About"), "About");
const ContactUs = safeImport(() => import("./pages/ContactUs"), "ContactUs");
const Feedback = safeImport(() => import("./pages/Feedback"), "Feedback");
const PortalSelection = safeImport(() => import("./pages/PortalSelection"), "PortalSelection");
const StudentRegistration = safeImport(() => import("./pages/StudentRegistration"), "StudentRegistration");
const StudentLogin = safeImport(() => import("./pages/StudentLogin"), "StudentLogin");
const AlumniRegistration = safeImport(() => import("./pages/AlumniRegistration"), "AlumniRegistration");
const AlumniLogin = safeImport(() => import("./pages/AlumniLogin"), "AlumniLogin");
const StudentPortal = safeImport(() => import("./pages/StudentPortal"), "StudentPortal");
const AlumniPortal = safeImport(() => import("./pages/AlumniPortal"), "AlumniPortal");
const AdminLogin = safeImport(() => import("./pages/AdminLogin"), "AdminLogin");
const ProfileEdit = safeImport(() => import("./pages/ProfileEdit"), "ProfileEdit");
const Messaging = safeImport(() => import("./pages/Messaging"), "Messaging");
const Connections = safeImport(() => import("./pages/Connections"), "Connections");

// Student Pages
const MyProfile = safeImport(() => import("./pages/student/MyProfile"), "MyProfile");
const AICareerAdvisor = safeImport(() => import("./pages/student/AICareerAdvisor"), "AICareerAdvisor");
const FindMentor = safeImport(() => import("./pages/student/FindMentor"), "FindMentor");
const StudentJenHub = safeImport(() => import("./pages/student/JenHub"), "StudentJenHub");
const MyCredentials = safeImport(() => import("./pages/student/MyCredentials"), "MyCredentials");
const StartupIncubator = safeImport(() => import("./pages/student/StartupIncubator"), "StartupIncubator");
const StudentLeaderboard = safeImport(() => import("./pages/student/Leaderboard"), "StudentLeaderboard");
const MyAcademics = safeImport(() => import("./pages/student/MyAcademics"), "MyAcademics");
const StudentMessages = safeImport(() => import("./pages/student/Messages"), "StudentMessages");

// Alumni Pages
const UpdateProfile = safeImport(() => import("./pages/alumni/UpdateProfile"), "UpdateProfile");
const Mentorship = safeImport(() => import("./pages/alumni/Mentorship"), "Mentorship");
const AlumniJenHub = safeImport(() => import("./pages/alumni/JenHub"), "AlumniJenHub");
const AlumniAnalytics = safeImport(() => import("./pages/alumni/Analytics"), "AlumniAnalytics");
const Events = safeImport(() => import("./pages/alumni/Events"), "Events");
const GiveBack = safeImport(() => import("./pages/alumni/GiveBack"), "GiveBack");
const AlumniDirectory = safeImport(() => import("./pages/alumni/AlumniDirectory"), "AlumniDirectory");
const AlumniLeaderboard = safeImport(() => import("./pages/alumni/Leaderboard"), "AlumniLeaderboard");
const AlumniMessages = safeImport(() => import("./pages/alumni/Messages"), "AlumniMessages");

// Admin Pages
const AdminDashboard = safeImport(() => import("./pages/admin/Dashboard"), "AdminDashboard");
const BulkOnboarding = safeImport(() => import("./pages/admin/BulkOnboarding"), "BulkOnboarding");
const AdminAnalyticsPage = safeImport(() => import("./pages/admin/Analytics"), "AdminAnalyticsPage");
const UserManagement = safeImport(() => import("./pages/admin/UserManagement"), "UserManagement");
const ContentModeration = safeImport(() => import("./pages/admin/ContentModeration"), "ContentModeration");
const Communications = safeImport(() => import("./pages/admin/Communications"), "Communications");

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-foreground/70 font-medium">Loading...</p>
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md p-6 glass-effect rounded-lg border border-primary/20">
            <h1 className="text-2xl font-bold text-destructive mb-4">⚠️ Error</h1>
            <p className="text-foreground/70 mb-4 text-sm">{this.state.error?.message || "Something went wrong"}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
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
            <div className="min-h-screen">
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
                  <Route path="/student/profile" element={<MyProfile />} />
                  <Route path="/student/career-advisor" element={<AICareerAdvisor />} />
                  <Route path="/student/mentors" element={<FindMentor />} />
                  <Route path="/student/jen-hub" element={<StudentJenHub />} />
                  <Route path="/student/credentials" element={<MyCredentials />} />
                  <Route path="/student/incubator" element={<StartupIncubator />} />
                  <Route path="/student/leaderboard" element={<StudentLeaderboard />} />
                  <Route path="/student/academics" element={<MyAcademics />} />
                  <Route path="/student/messages" element={<StudentMessages />} />
                  
                  {/* Alumni Routes */}
                  <Route path="/alumni-login" element={<AlumniLogin />} />
                  <Route path="/alumni-registration" element={<AlumniRegistration />} />
                  <Route path="/alumni-portal" element={<AlumniPortal />} />
                  <Route path="/alumni/profile" element={<UpdateProfile />} />
                  <Route path="/alumni/mentorship" element={<Mentorship />} />
                  <Route path="/alumni/jen-hub" element={<AlumniJenHub />} />
                  <Route path="/alumni/analytics" element={<AlumniAnalytics />} />
                  <Route path="/alumni/events" element={<Events />} />
                  <Route path="/alumni/give-back" element={<GiveBack />} />
                  <Route path="/alumni/directory" element={<AlumniDirectory />} />
                  <Route path="/alumni/leaderboard" element={<AlumniLeaderboard />} />
                  <Route path="/alumni/messages" element={<AlumniMessages />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/onboarding" element={<BulkOnboarding />} />
                  <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/moderation" element={<ContentModeration />} />
                  <Route path="/admin/communications" element={<Communications />} />
                  
                  {/* Shared Routes */}
                  <Route path="/profile-edit" element={<ProfileEdit />} />
                  <Route path="/messages" element={<Messaging />} />
                  <Route path="/connections" element={<Connections />} />
                  
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
