import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectDetailsPage from "@/pages/ProjectDetailsPage";
import ProjectFormPage from "@/pages/ProjectFormPage";
import MyProjectsPage from "@/pages/MyProjectsPage";
import MyProposalsPage from "@/pages/MyProposalsPage";
import BookmarksPage from "@/pages/BookmarksPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFoundPage from "@/pages/NotFoundPage";
import LoadingSpinner from "@/components/LoadingSpinner";

function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  if (isInitializing) return <LoadingSpinner fullPage />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function HomeRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  if (isInitializing) return <LoadingSpinner fullPage />;
  return isAuthenticated ? <DashboardPage /> : <Navigate to="/projects" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestOnlyRoute><AuthLayout /></GuestOnlyRoute>}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<MainLayout />}>
        {/* عمومی: هرکسی (مهمان یا واردشده) می‌تواند پروژه‌ها را ببیند */}
        <Route path="/" element={<HomeRoute />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailsPage />} />

        {/* نیازمند ورود: فقط اقدامات واقعی (ثبت، ویرایش، پیگیری شخصی) */}
        <Route path="/projects/new" element={<ProtectedRoute><ProjectFormPage /></ProtectedRoute>} />
        <Route path="/projects/:id/edit" element={<ProtectedRoute><ProjectFormPage /></ProtectedRoute>} />
        <Route path="/my-projects" element={<ProtectedRoute><MyProjectsPage /></ProtectedRoute>} />
        <Route path="/proposals" element={<ProtectedRoute><MyProposalsPage /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
