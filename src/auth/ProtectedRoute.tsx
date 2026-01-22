import { Navigate, useLocation, Outlet } from "react-router-dom"

import { useAuthUser } from "./hooks"

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuthUser()
  const location = useLocation()

  if (isInitializing) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Checking your session...
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/signup"
        replace
        state={{ from: location.pathname || "/" }}
      />
    )
  }

  return <Outlet />
}


