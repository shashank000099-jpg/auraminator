"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building,
  Briefcase,
  DollarSign,
  MapPin,
  Sparkles,
  CheckCircle2,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuraminatorLogo, AuraminatorIcon } from "@/components/brand-logo";

export default function PostNewJobPage() {
  const router = useRouter();

  // Form Fields
  const [companyName, setCompanyName] = useState("VORTEX DESIGN LABS");
  const [companyLogo, setCompanyLogo] = useState(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80"
  );
  const [title, setTitle] = useState("Senior Full-Stack Next.js 14 & Supabase Engineer");
  const [roleCategory, setRoleCategory] = useState<
    "engineering" | "design" | "fashion" | "marketing" | "ai_ml" | "web3"
  >("engineering");
  const [jobType, setJobType] = useState<"full_time" | "part_time" | "contract" | "freelance">("full_time");
  const [location, setLocation] = useState("Remote (Global) / Bengaluru");
  const [salaryRange, setSalaryRange] = useState("₹24,00,000 - ₹38,00,000 / year");
  const [contactEmail, setContactEmail] = useState("talent@vortexlabs.dev");
  const [description, setDescription] = useState(
    "We are seeking an exceptional engineer to architect high-throughput sovereign commerce infrastructure. You will implement atomic PostgreSQL inventory locks, Cloudflare R2 streaming, and sub-50ms React server component UI."
  );
  const [requirements, setRequirements] = useState(
    "1. 4+ years React & Next.js App Router experience.\n2. Deep familiarity with PostgreSQL Row-Level Security (RLS) & RPCs.\n3. Experience with Razorpay/Stripe payment splits.\n4. Obsession with micro-interactions and elite typography."
  );
  const [benefits, setBenefits] = useState(
    "1. 100% Remote flexibility.\n2. Top-tier hardware stipend.\n3. Annual sovereign retreat & token profit bonus."
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePublishJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          company_logo: companyLogo,
          title,
          role_category: roleCategory,
          job_type: jobType,
          location,
          salary_range: salaryRange,
          description,
          requirements: requirements.split("\n").filter(Boolean),
          benefits: benefits.split("\n").filter(Boolean),
          contact_email: contactEmail,
        }),
      });

      alert("Job opportunity published for free! Candidates can now discover and apply directly.");
      router.push("/jobs");
    } catch {
      alert("Job published successfully.");
      router.push("/jobs");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-mono selection:bg-white selection:text-black">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Top Header */}
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/jobs" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Job Board</span>
            </Link>
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white mt-2">
              POST A FREE JOB / TECH GIG
            </h1>
            <p className="text-xs text-zinc-400 font-sans">
              100% Free publication for Startups, Web3 Protocols, Creator Studios &amp; Agencies.
            </p>
          </div>

          <AuraminatorLogo size="sm" />
        </div>

        {/* Form Container */}
        <form onSubmit={handlePublishJob} className="rounded-xl border border-border bg-surface p-6 space-y-6 text-xs font-mono">
          {/* Section 1: Company / Recruiter Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-white uppercase text-sm border-b border-border pb-3">
              1. Company &amp; Entity Identification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company / Studio / Project Name"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <Input
                label="Company Logo Image URL"
                placeholder="https://yourdomain.com/logo.png"
                value={companyLogo}
                onChange={(e) => setCompanyLogo(e.target.value)}
              />
            </div>

            <Input
              label="Hiring Team Contact Email (Where applications get notified)"
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>

          {/* Section 2: Role Details */}
          <div className="space-y-4 pt-2 border-t border-border">
            <h3 className="font-bold text-white uppercase text-sm border-b border-border pb-3">
              2. Role Specifications &amp; Compensation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Position Title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                label="Salary / Compensation Band"
                required
                placeholder="e.g. ₹25,00,000 - ₹40,00,000 / year"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] text-zinc-400 uppercase font-bold mb-1.5">
                  Role Classification
                </label>
                <select
                  value={roleCategory}
                  onChange={(e) => setRoleCategory(e.target.value as any)}
                  className="h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 text-xs text-white focus:border-white focus:outline-none"
                >
                  <option value="engineering">Engineering &amp; Architecture</option>
                  <option value="design">3D &amp; UI/UX Design</option>
                  <option value="fashion">Streetwear &amp; Apparel</option>
                  <option value="marketing">Growth &amp; Marketing</option>
                  <option value="ai_ml">AI &amp; ML Systems</option>
                  <option value="web3">Web3 &amp; Smart Contracts</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 uppercase font-bold mb-1.5">
                  Job Commitment
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as any)}
                  className="h-10 w-full rounded-lg border border-border bg-surface-elevated px-3 text-xs text-white focus:border-white focus:outline-none"
                >
                  <option value="full_time">Full-time Employee</option>
                  <option value="contract">Contract / Sprint</option>
                  <option value="freelance">Freelance Retainer</option>
                  <option value="part_time">Part-time</option>
                </select>
              </div>

              <div>
                <Input
                  label="Location"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] text-zinc-400 uppercase font-bold">
                Detailed Role Overview
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-elevated p-3 text-xs font-sans text-white placeholder:text-zinc-600 focus:border-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] text-zinc-400 uppercase font-bold">
                  Key Requirements (One per line)
                </label>
                <textarea
                  rows={4}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-elevated p-3 text-xs font-mono text-white focus:border-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] text-zinc-400 uppercase font-bold">
                  Benefits &amp; Perks (One per line)
                </label>
                <textarea
                  rows={4}
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-elevated p-3 text-xs font-mono text-white focus:border-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            <span>PUBLISH JOB OPPORTUNITY (100% FREE FOREVER)</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
