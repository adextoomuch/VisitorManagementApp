import { createElement, lazy, Suspense, type ReactNode } from "react";
import { Routes, Route } from "react-router-dom";
import { PageLoader } from "@/components/feedback/PageLoader";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";

/**
 * Lazy-loaded pages — each chunk is only fetched when the user
 * navigates to that route, keeping the initial bundle small.
 */

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// ─────────────────────────────────────────────────────────────
// Route guards
// ─────────────────────────────────────────────────────────────

/**
 * Redirects unauthenticated users to /login.
 * Wraps all protected dashboard routes.
 */
// function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const isAuthenticated = useAuthStore((s) => s.isAuthenticated)()
//   if (!isAuthenticated) return <Navigate to="/login" replace />
//   return <>{children}</>
// }

/**
 * Redirects authenticated users away from auth pages.
 * Wraps login, forgot password, reset password.
 */
// function GuestRoute({ children }: { children: React.ReactNode }) {
//   const isAuthenticated = useAuthStore((s) => s.isAuthenticated)()
//   if (isAuthenticated) return <Navigate to="/" replace />
//   return <>{children}</>
// }

/**
 * Wraps each lazy route in Suspense + ErrorBoundary.
 * Suspense shows PageLoader while the chunk is loading.
 * ErrorBoundary catches render errors so one broken page
 * doesn't crash the whole app.
 */
function RouteWrapper({ children }: { children: ReactNode }) {
  return createElement(
    ErrorBoundary,
    null,
    createElement(Suspense, { fallback: createElement(PageLoader) }, children),
  );
}

// ─────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────

export default function AppRouter() {
  return createElement(
    Routes,
    null,
    createElement(Route, {
      path: "/",
      element: createElement(RouteWrapper, null, createElement(LandingPage)),
    }),
    createElement(Route, {
      path: "/reports",
      element: createElement(RouteWrapper, null, createElement(ReportsPage)),
    }),
    createElement(Route, {
      path: "*",
      element: createElement(RouteWrapper, null, createElement(NotFoundPage)),
    }),
  );
}
