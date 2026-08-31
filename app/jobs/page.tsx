"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Users,
  Sparkles,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_JOBS } from "@/lib/mock-data";
import { JobPosting } from "@/lib/types";
import { AuraminatorIcon, AuraminatorLogo, AuraminatorWatermark } from "@/components/brand-logo";

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<JobPosting[]>(MOCK_JOBS);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs);
        }
      })
      .catch(() => {});
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesCategory = selectedCategory === "all" || job.role_category === selectedCategory;
    const matchesType = selectedType === "all" || job.job_type === selectedType;
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-mono selection:bg-white selection:text-black relative overflow-hidden">
      <AuraminatorWatermark size={580} className="-top-24 -right-24" />

      <div className="mx-auto max-w-6xl space-y-8 relative z-10">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1 text-[11px] text-zinc-300 mb-2">
              <AuraminatorIcon size={14} />
              <span>100% FREE CREATOR &amp; TECH JOB NETWORK</span>
            </div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white">
              SOVEREIGN CAREERS &amp; TECH GIGS
            </h1>
            <p className="text-xs text-zinc-400 font-sans mt-1">
              Find top roles or hire elite Next.js developers, 3D shader artists, streetwear pattern makers, and growth architects.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/jobs/dashboard">
              <Button variant="outline" size="md" className="flex items-center gap-1.5 border-emerald-500/30 text-emerald-400">
                <Users className="h-4 w-4" />
                <span>APPLICANT PIPELINE</span>
              </Button>
            </Link>
            <Link href="/jobs/new">
              <Button variant="primary" size="md" className="flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                <span>POST A JOB (100% FREE)</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by role (e.g. Next.js, Supabase, 3D Artist, Streetwear Designer, Remote)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-xs font-mono text-white placeholder:text-zinc-500 focus:border-white focus:outline-none"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            {[
              { id: "all", label: "ALL ROLES" },
              { id: "engineering", label: "ENGINEERING & ARCHITECTURE" },
              { id: "design", label: "3D & UI/UX DESIGN" },
              { id: "fashion", label: "STREETWEAR & APPAREL" },
              { id: "marketing", label: "GROWTH & COMMUNITY" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap rounded-lg border px-3 py-2 transition-all ${
                  selectedCategory === cat.id
                    ? "border-white bg-white text-black font-bold"
                    : "border-border bg-surface text-zinc-400 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Showing <strong className="text-white">{filteredJobs.length}</strong> active career opportunities</span>
            <span>Free Direct Applications</span>
          </div>

          {filteredJobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="block rounded-xl border border-border bg-surface p-6 hover:border-white/40 transition-all brutalist-card group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-zinc-900 border border-white/10 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                    {job.company_logo ? (
                      <Image src={job.company_logo} alt={job.company_name} fill className="object-cover" />
                    ) : (
                      <Building className="h-6 w-6 text-zinc-500" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        {job.company_name}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-zinc-600"></span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {job.job_type.replace("_", " ")}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-white group-hover:text-zinc-200 transition-colors">
                      {job.title}
                    </h2>

                    <p className="text-xs text-zinc-400 font-sans line-clamp-2 max-w-2xl pt-1">
                      {job.description}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono space-y-1 sm:self-center flex-shrink-0">
                  <p className="font-bold text-white text-sm">{job.salary_range}</p>
                  <div className="flex sm:justify-end items-center gap-1.5 text-[11px] text-zinc-400">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{job.location}</span>
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1 text-xs text-white font-bold group-hover:translate-x-1 transition-transform">
                      <span>View &amp; Apply</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
