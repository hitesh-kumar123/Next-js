// app/(marketing)/contact/page.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Mail, BookOpen, Activity, Clock } from "lucide-react";

type ContactFormValues = {
  name: string;
  email: string;
  message: string;
};

const CHANNELS = [
  {
    icon: <Mail className="h-4 w-4" />,
    label: "Email support",
    value: "support@nexus.io",
    href: "mailto:support@nexus.io",
  },
  {
    icon: <BookOpen className="h-4 w-4" />,
    label: "Documentation",
    value: "docs.nexus.io",
    href: "https://docs.nexus.io",
  },
  {
    icon: <Activity className="h-4 w-4" />,
    label: "Status page",
    value: "status.nexus.io",
    href: "https://status.nexus.io",
  },
];

// Fixed coordinates -- deterministic so server/client render identically.
const NODES = [
  { x: 40, y: 30 }, { x: 160, y: 70 }, { x: 60, y: 140 }, { x: 200, y: 160 },
  { x: 20, y: 220 }, { x: 150, y: 240 },
];
const EDGES = [
  [0, 1], [1, 3], [0, 2], [2, 4], [2, 3], [3, 5], [4, 5],
];

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>();

  const handleMessageDispatch = async () => {
    toast.success("Message sent — our team will reply shortly.");
    reset();
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-20">
      <div className="mb-14 space-y-2 text-center">
        <h1 className="flex items-center justify-center gap-2 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight">
          <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-[2px] bg-[#29E3C4]" />
          Contact support
        </h1>
        <p className="text-muted-foreground">
          Running into cluster or pipeline issues? Send us the details and
          we'll take a look.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Contact channels panel */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-[#0A0C10] p-8 text-[#EDEEF2] lg:col-span-2">
          <svg
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-full w-full opacity-[0.14]"
            viewBox="0 0 240 280"
            preserveAspectRatio="xMaxYMid slice"
          >
            {EDGES.map(([a, b], i) => (
              <line
                key={i}
                x1={NODES[a].x}
                y1={NODES[a].y}
                x2={NODES[b].x}
                y2={NODES[b].y}
                stroke="#29E3C4"
                strokeWidth="1"
              />
            ))}
            {NODES.map((n, i) => (
              <circle key={i} cx={n.x} cy={n.y} r="3" fill="#29E3C4" />
            ))}
          </svg>

          <div className="relative space-y-8">
            <div>
              <h2 className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[#8891A3]">
                Reach the team
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#8891A3]">
                For account or billing questions, email us directly. For
                outages, check the status page first — it's usually faster.
              </p>
            </div>

            <ul className="space-y-5">
              {CHANNELS.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    className="group flex items-start gap-3 transition-colors hover:text-[#29E3C4]"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#20242C] text-[#29E3C4] transition-colors group-hover:border-[#29E3C4]/50">
                      {c.icon}
                    </span>
                    <span>
                      <span className="block text-xs text-[#8891A3]">{c.label}</span>
                      <span className="block text-sm font-medium">{c.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 border-t border-[#20242C] pt-6 font-[family-name:var(--font-mono)] text-xs text-[#8891A3]">
              <Clock className="h-3.5 w-3.5" />
              Typical response time: under 4 hours
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(handleMessageDispatch)}
          className="space-y-4 rounded-2xl border border-border/60 bg-card p-8 shadow-2xs lg:col-span-3"
        >
          <div>
            <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Alex Mercer"
              {...register("name", { required: "Enter your name" })}
              className="mt-1 block w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:border-[#29E3C4] focus:outline-hidden"
            />
            {errors.name && (
              <span className="mt-1 block text-xs text-destructive">
                {errors.name.message}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="alex@company.com"
              {...register("email", { required: "Enter your email" })}
              className="mt-1 block w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:border-[#29E3C4] focus:outline-hidden"
            />
            {errors.email && (
              <span className="mt-1 block text-xs text-destructive">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Message
            </label>
            <textarea
              id="message"
              rows={6}
              placeholder="Describe the cluster or pipeline issue you're seeing..."
              {...register("message", { required: "Enter a message" })}
              className="mt-1 block w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm focus:border-[#29E3C4] focus:outline-hidden"
            />
            {errors.message && (
              <span className="mt-1 block text-xs text-destructive">
                {errors.message.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-[#29E3C4] py-2.5 text-sm font-semibold text-[#0A0C10] transition-colors hover:bg-[#29E3C4]/90 disabled:opacity-50"
          >
            {isSubmitting ? "Sending…" : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
}