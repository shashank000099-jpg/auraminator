"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  FileText,
  ExternalLink,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Building,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_APPLICATIONS, MOCK_JOBS } from "@/lib/mock-data";
import { JobApplication } from "@/lib/types";
import { AuraminatorLogo, AuraminatorIcon } from "@/components/brand-logo";

export default function RecruiterPipelinePage() {
  const [applications, setApplications] = useState<JobApplication[]>(MOCK_APPLICATIONS);
  const [selectedAppId, setSelectedAppId] = useState<string>("app-101");
  const [statusFilter, setStatusFilter] = useState("all");

  const selectedApp = applications.find((a) => a.id === selectedAppId) || applications[0];

  const handleUpdateStatus = (appId: string, newStatus: any) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    );
    alert(`Candidate status updated to: ${newStatus.replace("_", " ").toUpperCase()}`);
  };

  const filteredApps = applications.filter((a) => {
    if (statusFilter === "all") return true;
    return a.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-mono selection:bg-white selection:text-black">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1 text-[11px] text-zinc-300 mb-2">
              <AuraminatorIcon size={14} />
              <span>RECRUITER &amp; TALENT PIPELINE</span>
            </div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white">
              Candidate Applications &amp; Resumes
            </h1>
            <p className="text-xs text-zinc-400 font-sans mt-1">
              Review received resumes, evaluate portfolios, and schedule interviews with applicants with zero hassle.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/jobs">
              <Button variant="outline" size="md">
                ← View Public Job Board
              </Button>
            </Link>
            <Link href="/jobs/new">
              <Button variant="primary" size="md">
                + Post Another Role (Free)
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="rounded-xl border border-border bg-surface p-4 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase">Total Applications</span>
            <p className="text-xl font-bold text-white">{applications.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase">Shortlisted Candidates</span>
            <p className="text-xl font-bold text-emerald-400">
              {applications.filter((a) => a.status === "shortlisted").length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase">Under Review</span>
            <p className="text-xl font-bold text-amber-400">
              {applications.filter((a) => a.status === "under_review").length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase">Active Posted Roles</span>
            <p className="text-xl font-bold text-white">{MOCK_JOBS.length}</p>
          </div>
        </div>

        {/* Pipeline Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Candidates List (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Candidate Pipeline
              </h3>

              <div className="flex gap-1 text-[10px]">
                {["all", "shortlisted", "under_review"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-2 py-1 rounded border uppercase ${
                      statusFilter === f
                        ? "border-white bg-white text-black font-bold"
                        : "border-border text-zinc-400"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`rounded-xl border p-5 space-y-3 cursor-pointer transition-all ${
                    selectedApp?.id === app.id
                      ? "border-white bg-surface-elevated text-white shadow-lg"
                      : "border-border bg-surface text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{app.full_name}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        app.status === "shortlisted"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {app.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 font-sans line-clamp-1">{app.email}</p>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Expected: <strong className="text-white">{app.expected_salary || "Negotiable"}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Candidate Profile & Resume Review (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {selectedApp ? (
              <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
                <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase">Applicant Dossier</span>
                    <h3 className="font-bold text-white text-xl mt-0.5">{selectedApp.full_name}</h3>
                    <div className="flex items-center gap-3 pt-1 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{selectedApp.email}</span>
                      </span>
                      {selectedApp.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{selectedApp.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${selectedApp.email}?subject=Interview Invitation from ${selectedApp.full_name}`}
                      className="inline-block"
                    >
                      <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        <span>Email Candidate</span>
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Candidate Links (Resume, GitHub, Portfolio) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="rounded-lg border border-border bg-surface-elevated p-3 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">1. Resume Dossier</span>
                    <a
                      href={selectedApp.resume_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white hover:text-emerald-400 font-bold flex items-center gap-1 truncate"
                    >
                      <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">View Resume PDF</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </div>

                  <div className="rounded-lg border border-border bg-surface-elevated p-3 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">2. GitHub Profile</span>
                    {selectedApp.github_url ? (
                      <a
                        href={selectedApp.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white hover:text-emerald-400 font-bold flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{selectedApp.github_url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-zinc-600">Not provided</span>
                    )}
                  </div>

                  <div className="rounded-lg border border-border bg-surface-elevated p-3 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">3. Portfolio / Site</span>
                    {selectedApp.portfolio_url ? (
                      <a
                        href={selectedApp.portfolio_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white hover:text-emerald-400 font-bold flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{selectedApp.portfolio_url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-zinc-600">Not provided</span>
                    )}
                  </div>
                </div>

                {/* Cover Note */}
                <div className="space-y-2 text-xs">
                  <span className="text-zinc-500 uppercase font-bold">Candidate Introduction &amp; Motivation</span>
                  <div className="rounded-lg border border-border bg-black p-4 text-zinc-300 font-sans leading-relaxed text-sm">
                    {selectedApp.cover_note}
                  </div>
                </div>

                {/* Candidate Action Buttons */}
                <div className="rounded-xl border border-white/10 bg-surface-elevated p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-zinc-400 font-bold">Manage Hiring Status:</span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, "shortlisted")}
                      className={`px-3 py-1.5 rounded border transition-all ${
                        selectedApp.status === "shortlisted"
                          ? "border-emerald-400 bg-emerald-400 text-black font-bold"
                          : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                      }`}
                    >
                      Shortlist Candidate
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, "interview_scheduled")}
                      className={`px-3 py-1.5 rounded border transition-all ${
                        selectedApp.status === "interview_scheduled"
                          ? "border-white bg-white text-black font-bold"
                          : "border-border text-zinc-300 hover:bg-white/5"
                      }`}
                    >
                      Schedule Interview
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, "rejected")}
                      className={`px-3 py-1.5 rounded border transition-all ${
                        selectedApp.status === "rejected"
                          ? "border-red-400 bg-red-400 text-black font-bold"
                          : "border-red-500/30 text-red-400 hover:bg-red-500/10"
                      }`}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-surface p-12 text-center text-zinc-500">
                Select an applicant from the left to review their profile and resume.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
