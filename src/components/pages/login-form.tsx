"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const demoAccounts = [
  {
    label: "Employee",
    email: "employee@atomquest.demo",
  },
  {
    label: "Manager",
    email: "manager@atomquest.demo",
  },
  {
    label: "Admin",
    email: "admin@atomquest.demo",
  },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("employee@atomquest.demo");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setError("");
    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("That login did not match the demo workspace.");
        return;
      }

      router.push(result?.url || callbackUrl);
      router.refresh();
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 surface-grid">
      <div className="w-full max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="flex flex-col justify-center">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
              AtomQuest Goal Setting & Tracking Portal
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-7 text-muted-foreground">
              A clean demo workspace for goal creation, manager approvals,
              quarterly check-ins, audit-ready governance, and reporting.
            </p>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  className="rounded-lg border bg-card p-3 text-left shadow-sm transition hover:border-primary"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword("demo123");
                  }}
                  type="button"
                >
                  <p className="text-sm font-semibold">{account.label}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {account.email}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <Card className="rounded-lg border bg-card shadow-lg">
            <CardContent className="p-6">
              <div className="mb-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-semibold tracking-normal">
                  Demo sign in
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Password for every seeded account is demo123.
                </p>
              </div>

              {error ? (
                <Alert className="mb-4 border-destructive/30 bg-red-50">
                  <AlertTitle>Could not sign in</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        submit();
                      }
                    }}
                  />
                </div>
                <Button className="w-full" disabled={pending} onClick={submit}>
                  {pending ? "Signing in..." : "Enter portal"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
