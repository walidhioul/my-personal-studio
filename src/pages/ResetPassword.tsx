import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { ApiValidationError } from "@/api/passwordReset";
import { useResetPassword } from "@/hooks/useAuthEmail";
import logo from "@/assets/logo.jpeg";

const schema = z
  .object({
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    password_confirmation: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((v) => v.password === v.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const reset = useResetPassword();

  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Invalid/expired token comes back as errors.token from the backend.
  const tokenError =
    reset.error instanceof ApiValidationError && Boolean(reset.error.errors?.token?.length);

  useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => navigate("/login"), 4000);
    return () => window.clearTimeout(id);
  }, [done, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);
    const parsed = schema.safeParse({ password, password_confirmation: confirm });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0].message);
      return;
    }
    reset.mutate(
      { email, token, password, password_confirmation: confirm },
      { onSuccess: () => setDone(true) },
    );
  };

  const otherError =
    reset.isError && !tokenError
      ? reset.error instanceof Error
        ? reset.error.message
        : "Something went wrong. Please try again."
      : null;

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
            {done ? (
              <div className="text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <CheckCircle2 size={26} />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Password reset successfully</h1>
                <p className="text-muted-foreground text-sm">
                  Your password has been changed successfully.
                </p>
                <Button asChild className="w-full">
                  <Link to="/login">Go to login</Link>
                </Button>
              </div>
            ) : tokenError || !token || !email ? (
              <div className="text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                  <AlertTriangle size={26} />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Reset link problem</h1>
                <p className="text-muted-foreground text-sm">
                  This reset link is invalid or has expired. Please request a new password reset
                  link.
                </p>
                <Button asChild className="w-full">
                  <Link to="/forgot-password">Request a new reset link</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Choose a new password for <span className="font-medium">{email}</span>.
                  </p>
                </div>

                {(fieldError || otherError) && (
                  <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg border border-destructive/20">
                    {fieldError ?? otherError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">New password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Confirm new password
                    </label>
                    <Input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={reset.isPending}>
                    {reset.isPending ? "Resetting..." : "Reset password"}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
