import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import PortalSelection from "./pages/PortalSelection";
import StudentRegistration from "./pages/StudentRegistration";
import StudentLogin from "./pages/StudentLogin";
import AlumniRegistration from "./pages/AlumniRegistration";
import AlumniLogin from "./pages/AlumniLogin";
import StudentPortal from "./pages/StudentPortal";
import AlumniPortal from "./pages/AlumniPortal";
import About from "./pages/About";
import ContactUs from "./pages/ContactUs";
import Feedback from "./pages/Feedback";
import ProfileEdit from "./pages/ProfileEdit";
import Messaging from "./pages/Messaging";
import Connections from "./pages/Connections";
import AlumniDirectoryPage from "./pages/AlumniDirectory";

// Student Pages
import MyProfile from "./pages/student/MyProfile";
import AICareerAdvisor from "./pages/student/AICareerAdvisor";
import FindMentor from "./pages/student/FindMentor";
import JenHub from "./pages/student/JenHub";
import MyCredentials from "./pages/student/MyCredentials";
import StartupIncubator from "./pages/student/StartupIncubator";
import StudentLeaderboard from "./pages/student/Leaderboard";
import MyAcademics from "./pages/student/MyAcademics";
import StudentAlumniDirectory from "./pages/student/AlumniDirectory";
import StudentMessages from "./pages/student/Messages";

// Alumni Pages
import UpdateProfile from "./pages/alumni/UpdateProfile";
import Mentorship from "./pages/alumni/Mentorship";
import AlumniJenHub from "./pages/alumni/JenHub";
import Analytics from "./pages/alumni/Analytics";
import Events from "./pages/alumni/Events";
import GiveBack from "./pages/alumni/GiveBack";
import AlumniDirectory from "./pages/alumni/AlumniDirectory";
import AlumniLeaderboard from "./pages/alumni/Leaderboard";
import AlumniMessages from "./pages/alumni/Messages";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import BulkOnboarding from "./pages/admin/BulkOnboarding";
import AdminAnalytics from "./pages/admin/Analytics";
import UserManagement from "./pages/admin/UserManagement";
import ContentModeration from "./pages/admin/ContentModeration";
import Communications from "./pages/admin/Communications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-hero">
        <Navigation />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/portal-selection" element={<PortalSelection />} />
            <Route path="/student-registration" element={<StudentRegistration />} />
            <Route path="/student-login" element={<StudentLogin />} />
            <Route path="/alumni-registration" element={<AlumniRegistration />} />
            <Route path="/alumni-login" element={<AlumniLogin />} />
            <Route path="/student-portal" element={<StudentPortal />} />
            <Route path="/alumni-portal" element={<AlumniPortal />} />
            
            {/* Student Routes */}
            <Route path="/student/profile" element={<MyProfile />} />
            <Route path="/student/career-advisor" element={<AICareerAdvisor />} />
            <Route path="/student/mentors" element={<FindMentor />} />
            <Route path="/student/jen-hub" element={<JenHub />} />
            <Route path="/student/credentials" element={<MyCredentials />} />
            <Route path="/student/incubator" element={<StartupIncubator />} />
            <Route path="/student/leaderboard" element={<StudentLeaderboard />} />
            <Route path="/student/academics" element={<MyAcademics />} />
            <Route path="/student/alumni" element={<StudentAlumniDirectory />} />
            <Route path="/student/messages" element={<StudentMessages />} />
            
            {/* Shared Routes */}
            <Route path="/profile-edit" element={<ProfileEdit />} />
            <Route path="/messages" element={<Messaging />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/alumni-directory" element={<AlumniDirectoryPage />} />
            
            {/* Alumni Routes */}
            <Route path="/alumni/profile" element={<UpdateProfile />} />
            <Route path="/alumni/mentorship" element={<Mentorship />} />
            <Route path="/alumni/jen-hub" element={<AlumniJenHub />} />
            <Route path="/alumni/analytics" element={<Analytics />} />
            <Route path="/alumni/events" element={<Events />} />
            <Route path="/alumni/give-back" element={<GiveBack />} />
            <Route path="/alumni/directory" element={<AlumniDirectory />} />
            <Route path="/alumni/leaderboard" element={<AlumniLeaderboard />} />
            <Route path="/alumni/messages" element={<AlumniMessages />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/onboarding" element={<BulkOnboarding />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/moderation" element={<ContentModeration />} />
            <Route path="/admin/communications" element={<Communications />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
