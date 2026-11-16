import { Suspense } from "react";

import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign in — Nori Robotics",
};

/**
 * Magic-link sign-in. Reached from the navbar and from the editor when a
 * signed-out user tries to save (with `?next=` pointing back to the editor).
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-var(--nav-h))] items-center justify-center px-5 py-12">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
