"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLogin } from "../hooks/use-account";

const inputClassName = "mt-2 h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    try {
      await loginMutation.mutateAsync({
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
      });
      router.push("/account");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to sign in.");
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="text-sm font-bold">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className={inputClassName} />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-bold">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Enter your password" className={inputClassName} />
        </div>
        {error && <p role="alert" className="flex items-start gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-error"><span className="material-symbols-rounded text-lg" aria-hidden="true">error</span>{error}</p>}
        <button type="submit" disabled={loginMutation.isPending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-black text-primary-foreground outline-none transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60">
          {loginMutation.isPending && <span className="material-symbols-rounded animate-spin" aria-hidden="true">progress_activity</span>}
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-muted-foreground">New to Store? <Link href="/register" className="font-black text-primary hover:text-primary-hover">Create an account</Link></p>
    </>
  );
}
