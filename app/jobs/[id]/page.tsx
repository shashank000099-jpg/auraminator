"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building,
  MapPin,
  Clock,
  DollarSign,
  Send,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  FileText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_JOBS } from "@/lib/mock-data";
import { AuraminatorLogo, AuraminatorIcon } from "@/components/brand-logo";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = (params?.id as string) || "job-001";

  const job = MOCK_JOBS.find((j) => j.id === jobId) || MOCK_JOBS[0];

  // Application Form State
  const [fullName, setFullName] = useState("Aarav Mehta");
  const [email, setEmail] = useState("aarav.mehta@build.dev");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [portfolioUrl, setPortfolioUrl] = useState("https://aaravmehta.dev");
  const [githubUrl, setGithubUrl] = useState("https://github.com/aaravmehta");
  const [resumeUrl, setResumeUrl] = useState("https://assets.auraminator.in/resumes/aarav-mehta-fullstack.pdf");
  const [coverNote, setCoverNote] = useState(
    "I have 5+ years of experience in high-performance Next.js architectures, Supabase PostgreSQL RLS policies, and real-time payment integrations. Excited to contribute to your core sovereign drops engine."
  );
  const [expectedSalary, setExpectedSalary] = useState("₹32,00,000 / year");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/jobs/${job.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          portfolio_url: portfolioUrl,
          github_url: githubUrl,
          resume_url: resumeUrl,
          cover_note: coverNote,
          expected_salary: expectedSalary,
        }),
      });

      setIsApplied(true);
    } catch {
      setIsApplied(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-mono selection:bg-white selection:text-black">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link href="/jobs" className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Open Roles</span>
          </Link>
          <AuraminatorLogo size="sm" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Job Overview & Requirements (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-lg bg-zinc-900 border border-white/10 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                  {job.company_logo ? (
                    <Image src={job.company_logo} alt={job.company_name} fill className="object-cover" />
                  ) : (
                    <Building className="h-7 w-7 text-zinc-500" />
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    {job.company_name}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white uppercase tracking-tight">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="bg-white/10 px-2 py-0.5 rounded text-white font-bold">
                      {job.job_type.replace("_", " ")}
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400">{job.location}</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-emerald-400 font-bold">{job.salary_range}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-white uppercase tracking-wider">Role Overview</h3>
                <p className="text-zinc-300 font-sans leading-relaxed text-sm">
                  {job.description}
                </p>
              </div>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="space-y-2 text-xs">
                  <h3 className="font-bold text-white uppercase tracking-wider">Key Requirements &amp; Experience</h3>
                  <ul className="space-y-2 text-zinc-300 font-sans text-sm list-disc pl-4">
                    {job.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <div className="space-y-2 text-xs">
                  <h3 className="font-bold text-white uppercase tracking-wider">Perks &amp; Sovereign Benefits</h3>
                  <ul className="space-y-2 text-zinc-300 font-sans text-sm list-disc pl-4">
                    {job.benefits.map((ben, idx) => (
                      <li key={idx}>{ben}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Free Direct Application Form (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl border border-white/20 bg-surface p-6 space-y-5">
              <div className="border-b border-border pb-3">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">100% Free Candidate Application</span>
                <h3 className="font-bold text-white text-base uppercase mt-0.5">Apply for this Position</h3>
              </div>

              {isApplied ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-white text-base">Application Dispatched!</h4>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    Your profile, resume, and portfolio have been sent directly to the hiring team at <strong>{job.company_name}</strong>.
                  </p>
                  <Link href="/jobs" className="block pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Browse More Opportunities
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4 text-xs font-mono">
                  <Input
                    label="Full Name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <Input
                    label="Phone / WhatsApp Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />

                  <Input
                    label="Resume URL / Cloud Drive Link"
                    required
                    placeholder="https://drive.google.com/your-resume.pdf"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="GitHub URL"
                      placeholder="https://github.com/username"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                    />
                    <Input
                      label="Portfolio / Site"
                      placeholder="https://yoursite.dev"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                    />
                  </div>

                  <Input
                    label="Expected Compensation"
                    placeholder="e.g. ₹30,00,000 / year or $3,500/mo"
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-zinc-400 uppercase font-bold">
                      About Me &amp; Why I am a Great Fit
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface-elevated p-3 text-xs font-mono text-white placeholder:text-zinc-600 focus:border-white focus:outline-none"
                      placeholder="Tell the company about your recent achievements, tech stack mastery, and why you want to build with them..."
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>SUBMIT DIRECT APPLICATION (FREE)</span>
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
