import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/context/AuthContext"; 
import CourseDetails from "./pages/CourseDetails";


import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PlacementTest from "./pages/PlacementTest";
import QuizResult from "./pages/QuizResult";
import Courses from "./pages/Courses";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import CoursePlayer from "./pages/CoursePlayer";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminFeedbacks from "./pages/admin/AdminFeedbacks";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider> {/* <-- WRAP HERE */}
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/placement-test" element={<PlacementTest />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/result" element={<QuizResult />} />
              <Route path="/courses" element={<Courses />} />
               <Route path="/courses/:id" element={<CourseDetails />} />
               <Route path="/courses/:id/learn" element={<CoursePlayer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;