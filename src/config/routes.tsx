import { lazy } from "react";
import { Navigate } from "react-router-dom";

const Dashboard = lazy(() => import("@/app/dashboard/page"));
const Users = lazy(() => import("@/app/users/page"));
const Properties = lazy(() => import("@/app/properties/page"));
const PropertyNewPage = lazy(() => import("@/app/properties/pages/property-new-page"));
const PropertyEditPage = lazy(() => import("@/app/properties/pages/property-edit-page"));
const Bookings = lazy(() => import("@/app/bookings/page"));

const Unauthorized = lazy(() => import("@/app/errors/unauthorized/page"));
const Forbidden = lazy(() => import("@/app/errors/forbidden/page"));
const NotFound = lazy(() => import("@/app/errors/not-found/page"));
const InternalServerError = lazy(
  () => import("@/app/errors/internal-server-error/page"),
);
const UnderMaintenance = lazy(
  () => import("@/app/errors/under-maintenance/page"),
);

const AccountSettings = lazy(() => import("@/app/settings/account/page"));
const NotificationSettings = lazy(
  () => import("@/app/settings/notifications/page"),
);
const PaymentsSettings = lazy(
  () => import("@/app/settings/payments/page"),
);

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
  isPublic?: boolean;
}

export const routes: RouteConfig[] = [
  { path: "/", element: <Navigate to="dashboard" replace /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/users", element: <Users /> },
  { path: "/properties", element: <Properties /> },
  { path: "/properties/new", element: <PropertyNewPage /> },
  { path: "/properties/:id/edit", element: <PropertyEditPage /> },
  { path: "/bookings", element: <Bookings /> },
  { path: "/errors/unauthorized", element: <Unauthorized /> },
  { path: "/errors/forbidden", element: <Forbidden /> },
  { path: "/errors/not-found", element: <NotFound /> },
  { path: "/errors/internal-server-error", element: <InternalServerError /> },
  { path: "/errors/under-maintenance", element: <UnderMaintenance /> },
  { path: "/settings/account", element: <AccountSettings /> },
  { path: "/settings/notifications", element: <NotificationSettings /> },
  { path: "/settings/payments", element: <PaymentsSettings /> },
  { path: "*", element: <NotFound /> },
];
