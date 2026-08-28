import { signOut } from "next-auth/react";

/**
 * Universally safe signOut function that preserves the current website domain (e.g. spligue.ro),
 * preventing NextAuth from redirecting back to localhost:3000.
 */
export async function appSignOut(callbackUrl: string = "/") {
  try {
    // Clear NextAuth session cookies asynchronously without hardcoded server redirect
    await signOut({ redirect: false });
  } catch (error) {
    console.error("SignOut error:", error);
  } finally {
    // Ensure navigation always stays on the current domain/origin (e.g. https://spligue.ro/)
    if (typeof window !== "undefined") {
      window.location.href = callbackUrl.startsWith("http") ? callbackUrl : callbackUrl;
    }
  }
}
