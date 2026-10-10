import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import type { User } from "../types";

/** Require login; optionally require specific roles. */
export default function RoleGuard({ roles, children }: { roles?: User["role"][]; children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const loc = useLocation();

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: loc.pathname }} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
