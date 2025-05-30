
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { BookingProvider } from "./contexts/BookingContext";
import { DriverProvider } from "./contexts/DriverContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import DriverRegistrationPage from "./pages/DriverRegistrationPage";
import DriverDashboardPage from "./pages/DriverDashboardPage";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import RequireAuth from "./components/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DriverProvider>
        <BookingProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/booking/:id" element={<BookingConfirmationPage />} />
                  <Route path="/driver-registration" element={<DriverRegistrationPage />} />
                  <Route
                    path="/dashboard"
                    element={
                      <RequireAuth>
                        <DashboardPage />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/driver-dashboard"
                    element={
                      <RequireAuth>
                        <DriverDashboardPage />
                      </RequireAuth>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </BookingProvider>
      </DriverProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
