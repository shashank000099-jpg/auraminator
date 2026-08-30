import React from "react";
import { CheckCircle2, Clock, Truck, Package, ShieldCheck, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface TrackingStep {
  status: string;
  activity: string;
  location?: string;
  date: string;
  isCompleted: boolean;
  isCurrent?: boolean;
}

export function TrackingTimeline({
  awb,
  courierName,
  trackingStatus,
  events,
}: {
  awb: string;
  courierName: string;
  trackingStatus: string;
  events?: Array<{ date: string; activity: string; location?: string }>;
}) {
  const steps: TrackingStep[] = [
    {
      status: "Manifest Created",
      activity: "Merchant packed and shipping label generated",
      location: "Bengaluru Sort Hub",
      date: "Aug 28, 2026",
      isCompleted: true,
    },
    {
      status: "Pickup Scanned",
      activity: `Assigned to ${courierName || "Delhivery"} courier partner`,
      location: "Merchant Hub",
      date: "Aug 29, 2026",
      isCompleted: true,
    },
    {
      status: "In-Transit",
      activity: "Arrived at Regional Distribution Hub (Sector 4)",
      location: "Mumbai Gateway",
      date: "Aug 30, 2026",
      isCompleted: ["in_transit", "out_for_delivery", "delivered"].includes(trackingStatus),
      isCurrent: trackingStatus === "in_transit",
    },
    {
      status: "Out for Delivery",
      activity: "Courier rider dispatched for local drop",
      location: "Destination Hub",
      date: "Estimated Today",
      isCompleted: ["out_for_delivery", "delivered"].includes(trackingStatus),
      isCurrent: trackingStatus === "out_for_delivery",
    },
    {
      status: "Delivered & Verified",
      activity: "Direct OTP verified handover completed. Escrow released.",
      location: "Recipient Address",
      date: "Pending Delivery",
      isCompleted: trackingStatus === "delivered",
      isCurrent: trackingStatus === "delivered",
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-surface p-6 font-mono text-xs text-white space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase">Live Shiprocket AWB</span>
          <p className="font-bold text-white text-sm">{awb}</p>
        </div>
        <div className="text-right sm:text-right">
          <span className="text-[10px] text-zinc-500 uppercase">Courier Network</span>
          <p className="font-bold text-emerald-400">{courierName || "Delhivery Express"}</p>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
        {steps.map((step, idx) => (
          <div key={idx} className="relative group">
            {/* Step Icon */}
            <div
              className={`absolute -left-6 top-0 flex h-4 w-4 items-center justify-center rounded-full border ${
                step.isCurrent
                  ? "border-emerald-400 bg-emerald-500/20 text-emerald-400 animate-pulse"
                  : step.isCompleted
                  ? "border-white bg-white text-black"
                  : "border-zinc-700 bg-surface text-zinc-600"
              }`}
            >
              {step.isCompleted ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
              )}
            </div>

            {/* Step Details */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span
                  className={`font-semibold ${
                    step.isCurrent
                      ? "text-emerald-400 font-bold"
                      : step.isCompleted
                      ? "text-white"
                      : "text-zinc-500"
                  }`}
                >
                  {step.status}
                </span>
                <span className="text-[10px] text-zinc-500">{step.date}</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans">{step.activity}</p>
              {step.location && (
                <p className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-2.5 w-2.5" />
                  <span>{step.location}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
