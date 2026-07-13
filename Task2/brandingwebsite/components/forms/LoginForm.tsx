"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        toast.error(result.error || "Invalid authentication credentials.");
      } else {
        toast.success("Welcome back to Nexus control workspace!");
        window.location.href = "/dashboard";
      }
    } catch (err) {
      toast.error("Internal service failure handling sign-in.");
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">Account Verification</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Access secure real-time node modules
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Network Email
          </label>
          <input
            type="email"
            placeholder="admin@platform.com"
            {...register("email", {
              required: "System mail parameter required",
            })}
            className="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-2xs focus:border-indigo-500 focus:outline-hidden"
          />
          {errors.email && (
            <span className="text-xs text-destructive mt-1 block">
              {String(errors.email.message)}
            </span>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Access Encryption Key
          </label>
          <input
            type="password"
            placeholder="••••••••"
            {...register("password", {
              required: "Verification hash code required",
            })}
            className="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-2xs focus:border-indigo-500 focus:outline-hidden"
          />
          {errors.password && (
            <span className="text-xs text-destructive mt-1 block">
              {String(errors.password.message)}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Verifying Integrity..." : "Establish Session"}
        </button>
      </form>

      <div className="relative flex py-2 items-center text-xs text-muted-foreground uppercase">
        <div className="flex-grow border-t" />
        <span className="flex-shrink mx-4">Cloud Auth Providers</span>
        <div className="flex-grow border-t" />
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-2 rounded-lg border bg-background py-2 text-sm font-medium hover:bg-accent transition-colors"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.6 2.8C6.01 7.34 8.78 5.04 12 5.04z"
          />
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.64 2.83c2.13-1.97 3.41-4.86 3.41-8.51z"
          />
          <path
            fill="#FBBC05"
            d="M5.1 14.7c-.25-.75-.39-1.55-.39-2.38s.14-1.63.39-2.38L1.5 7.14C.54 9.06 0 11.21 0 12.5s.54 3.44 1.5 5.36l3.6-2.8z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.64-2.83c-1.02.68-2.33 1.09-4.32 1.09-3.22 0-5.99-2.3-6.96-5.26l-3.6 2.8C3.4 20.35 7.35 23 12 23z"
          />
        </svg>
        Sync via Google
      </button>

      <p className="text-center text-xs text-muted-foreground">
        New operator node?{" "}
        <Link href="/signup" className="text-indigo-600 hover:underline">
          Provision access credentials
        </Link>
      </p>
    </div>
  );
}
