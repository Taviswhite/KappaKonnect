/**
 * Application routes configuration
 * Centralized route definitions for better organization
 */

import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Events from "./pages/Events";
import Members from "./pages/Members";
import Tasks from "./pages/Tasks";
import Meetings from "./pages/Meetings";
import Chat from "./pages/Chat";
import Attendance from "./pages/Attendance";
import Alumni from "./pages/Alumni";
import Documents from "./pages/Documents";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Blocked from "./pages/Blocked";
import AdminPanel from "./pages/AdminPanel";

/**
 * Application routes
 * All routes are defined here for better maintainability
 */
export const appRoutes = (
  <>
    <Route path="/auth" element={<Auth />} />
    <Route path="/blocked" element={<Blocked />} />
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
    <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
    <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
    <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
    <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
    <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
    <Route path="/alumni" element={<ProtectedRoute><Alumni /></ProtectedRoute>} />
    <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </>
);
