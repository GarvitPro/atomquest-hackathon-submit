import { Suspense } from "react";
import { LoginForm } from "@/components/pages/login-form";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
