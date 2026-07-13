"use client";

import React from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function SignupForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data: any) => {
    try {
      // Simulating a minor network processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success("Account provisioned! Access credentials registered in system database.");
      router.push("/login");
    } catch (err) {
      toast.error("Failed to register access credentials.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">Register Operator Node</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Provision credentials to gain access to system logs
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Sarah Connor"
            {...register("name", {
              required: "Operator identity is required",
            })}
            className="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-2xs focus:border-indigo-500 focus:outline-hidden"
          />
          {errors.name && (
            <span className="text-xs text-destructive mt-1 block">
              {String(errors.name.message)}
            </span>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Network Email Address
          </label>
          <input
            type="email"
            placeholder="operator@nexus.io"
            {...register("email", {
              required: "Email is required to bind terminal",
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
              required: "Encryption verification key required",
              minLength: {
                value: 6,
                message: "Key strength must be at least 6 characters",
              },
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
          {isSubmitting ? "Provisioning..." : "Register Access Credentials"}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="text-indigo-600 hover:underline">
          Establish existing session
        </Link>
      </p>
    </div>
  );
}
