import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MailCheck, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useResendVerificationEmail } from "@/hooks/useAuthEmail";
import logo from "@/assets/logo.jpeg";

const COOLDOWN_SECONDS = 60;

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const resend = useResendVerificationEmail();
  const [cooldown, setCooldown] = useState(0);

  // Laravel redirects back with ?verified=1 after handling the emailed link.
  const verified = params.get("verified") === "1" || params.get("verified") === "true";

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const handleResend = () => {
    if (resend.isPending || cooldown > 0) return;
    resend.mutate(undefined, {
      onSuccess: () => {
        setCooldown(COOLDOWN_SECONDS);
        toast.success("Verification email sent successfully. Please check your inbox.");
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Could not send the verification email"),
    });
  };

  const handleContinue = () => {
    navigate(user?.role === "admin" ? "/admin" : "/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <img src={logo} alt="To The Moon With English" className="h-9 w-auto rounded-lg" />
          <span className="font-bold text-foreground text-sm">To The Moon</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              {verified ? <MailCheck size={26} /> : <Mail size={26} />}
            </div>

            {verified ? (
              <>
                <h1 className="text-2xl font-bold text-foreground">Email verified successfully!</h1>
                <p className="text-muted-foreground text-sm">Your email has been verified.</p>
                <Button className="w-full" onClick={handleContinue}>
                  Continue
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-foreground">Verify your email</h1>
                <p className="text-muted-foreground text-sm">
                  We've sent a verification link to{" "}
                  <span className="font-medium text-foreground">{user?.email ?? "your email"}</span>.
                  Please check your inbox and click the verification link.
                </p>
                <Button
                  className="w-full"
                  onClick={handleResend}
                  disabled={resend.isPending || cooldown > 0}
                >
                  {resend.isPending
                    ? "Sending..."
                    : cooldown > 0
                      ? `Resend verification email (${cooldown}s)`
                      : "Resend verification email"}
                </Button>
                <Link
                  to="/dashboard"
                  className="block text-xs text-muted-foreground hover:text-foreground"
                >
                  Skip for now
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
