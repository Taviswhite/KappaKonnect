import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname === "/admin";

  useEffect(() => {
    if (!isAdminRoute) {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname, isAdminRoute]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center max-w-md px-4">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        {isAdminRoute ? (
          <>
            <p className="mb-2 text-xl text-muted-foreground">Admin panel not found.</p>
            <p className="mb-4 text-sm text-muted-foreground">
              Deploy the latest version of the app so the /admin route is included. Then log in as admin or e_board and try again.
            </p>
          </>
        ) : (
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        )}
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
