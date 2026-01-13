import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Blocked = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center max-w-md mx-auto p-6">
        <ShieldAlert className="mx-auto mb-4 h-16 w-16 text-destructive" />
        <h1 className="mb-4 text-4xl font-bold">Request Blocked</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          Your request contained potentially malicious content and was blocked for security reasons.
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          If you believe this is an error, please contact support.
        </p>
        <Button asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default Blocked;
