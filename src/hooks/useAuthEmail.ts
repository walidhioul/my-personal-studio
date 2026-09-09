import { useMutation } from "@tanstack/react-query";
import {
  forgotPassword,
  resetPassword,
  resendVerificationEmail,
  ResetPasswordPayload,
} from "@/api/passwordReset";

/** Resend the email-verification link for the signed-in user. */
export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: resendVerificationEmail,
  });
}

/** Request a password reset link (no auth header, generic response). */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
}

/** Submit a new password with the token/email taken from the reset link. */
export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
  });
}
