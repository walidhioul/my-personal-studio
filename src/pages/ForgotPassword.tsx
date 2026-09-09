import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MailCheck, ArrowLeft } from "lucide-react";
import { useForgotPassword } from "@/hooks/useAuthEmail";
import logo from "@/assets/logo.jpeg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const forgot = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgot.mutate(email, {
      // The backend always answers the same way — show its message as-is.
      onSuccess: (res) =>
        setSentMessage(
          res?.message ||
            "If an account exists with this email, we've sent you a password reset link.",
        ),
    });
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
          <CardContent className="pt-8 pb-8 space-y-5">
            {sentMessage ? (
              <div className="text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <MailCheck size={26} />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
                <p className="text-muted-foreground text-sm">{sentMessage}</p>
                <Button asChild className="w-full">
                  <Link to="/login">Back to login</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-foreground">Forgot password</h1>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Enter your email and we'll send you a password reset link.
                  </p>
                </div>

                {forgot.isError && (
                  <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg border border-destructive/20">
                    {forgot.error instanceof Error
                      ? forgot.error.message
                      : "Something went wrong. Please try again."}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={forgot.isPending}>
                    {forgot.isPending ? "Sending..." : "Send reset link"}
                  </Button>
                </form>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft size={14} />
                  Back to login
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
