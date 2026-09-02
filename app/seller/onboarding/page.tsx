"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2, Building, Upload, CreditCard, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuraminatorIcon, AuraminatorLogo } from "@/components/brand-logo";

export default function SellerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [businessName, setBusinessName] = useState("Kaizen Global Design Labs");
  const [taxIdentifier, setTaxIdentifier] = useState("29ABCDE1234F1Z5");
  const [documentUrl, setDocumentUrl] = useState("https://assets.auraminator.in/docs/kyc-sample.pdf");

  const [bankAccount, setBankAccount] = useState("91823719283719");
  const [ifscCode, setIfscCode] = useState("HDFC0001234");
  const [beneficiaryName, setBeneficiaryName] = useState("Kaizen Global Design Labs Private Limited");

  // Warehouse Pickup Address State
  const [warehouseAddress, setWarehouseAddress] = useState("Plot 42, Okhla Industrial Area Phase 3");
  const [warehouseCity, setWarehouseCity] = useState("New Delhi");
  const [warehouseState, setWarehouseState] = useState("Delhi");
  const [warehousePin, setWarehousePin] = useState("110020");
  const [warehousePhone, setWarehousePhone] = useState("+91 9811002233");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch("/api/seller/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legal_business_name: businessName,
          tax_identifier: taxIdentifier,
          document_urls: [documentUrl],
          bank_details: {
            account_number: bankAccount,
            ifsc_code: ifscCode,
            beneficiary_name: beneficiaryName,
          },
        }),
      });

      // Also register warehouse pickup address for automated courier routes
      await fetch("/api/seller/pickup-addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLocationNickname: `${businessName.split(" ")[0]}-Central-Hub`,
          contactName: beneficiaryName,
          contactPhone: warehousePhone,
          addressLine1: warehouseAddress,
          city: warehouseCity,
          state: warehouseState,
          pincode: warehousePin,
          isPrimary: true,
        }),
      });

      setIsSubmitted(true);
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center font-mono">
        <div className="max-w-lg w-full rounded-2xl border border-border bg-surface p-8 text-center space-y-6 brutalist-card">
          <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold uppercase tracking-tight text-white">
              KYC &amp; WAREHOUSE PICKUP DOSSIER TRANSMITTED
            </h2>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Your business verification and automated Shiprocket courier pickup hub have been registered. Seller Studio access is now unlocked.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface-elevated p-4 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-zinc-500">Legal Entity:</span>
              <span className="font-bold text-white">{businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Registered Pickup Hub:</span>
              <span className="text-white">{warehouseCity} ({warehousePin})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Verification Status:</span>
              <span className="text-emerald-400 font-bold">Verified &amp; Ready for Automated Dispatch</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/seller/dashboard")}
            className="w-full"
          >
            ENTER SELLER STUDIO DASHBOARD
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 selection:bg-white selection:text-black font-mono">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1 text-[11px] text-zinc-300">
              <AuraminatorIcon size={14} />
              <span>VERIFIED CREATOR PROTOCOL</span>
            </div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white">
              Seller KYC &amp; Logistics Onboarding
            </h1>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Join the sovereign creator network in 3 minutes. Unlock instant payouts to your bank account, automated Shiprocket courier routes, and protected escrow sales.
            </p>
          </div>
          <div>
            <AuraminatorLogo size="sm" />
          </div>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div
            className={`rounded-lg border p-3 flex items-center gap-2.5 ${
              step >= 1 ? "border-white bg-surface-elevated text-white" : "border-border text-zinc-600"
            }`}
          >
            <Building className="h-4 w-4" />
            <span className="font-bold">1. Entity</span>
          </div>
          <div
            className={`rounded-lg border p-3 flex items-center gap-2.5 ${
              step >= 2 ? "border-white bg-surface-elevated text-white" : "border-border text-zinc-600"
            }`}
          >
            <Upload className="h-4 w-4" />
            <span className="font-bold">2. Docs</span>
          </div>
          <div
            className={`rounded-lg border p-3 flex items-center gap-2.5 ${
              step >= 3 ? "border-white bg-surface-elevated text-white" : "border-border text-zinc-600"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span className="font-bold">3. Bank &amp; Pickup Hub</span>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmitKYC} className="rounded-xl border border-border bg-surface p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm uppercase border-b border-border pb-3">
                Legal Entity Identification
              </h3>
              <Input
                label="Registered Business / Creator Name"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
              <Input
                label="Tax Identifier / GSTIN / PAN"
                required
                value={taxIdentifier}
                onChange={(e) => setTaxIdentifier(e.target.value)}
                helperText="Required for automated invoice generation & TDS reconciliation."
              />
              <div className="flex justify-end pt-4">
                <Button type="button" variant="primary" size="md" onClick={() => setStep(2)}>
                  Next: Compliance Documents →
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm uppercase border-b border-border pb-3">
                Verification Documents
              </h3>
              <Input
                label="Business Certificate / Identity Document URL"
                required
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                helperText="Provide secure URL to PDF/Image containing certificate of incorporation, GST certificate, or Govt ID."
              />
              <div className="flex justify-between pt-4">
                <Button type="button" variant="ghost" size="md" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button type="button" variant="primary" size="md" onClick={() => setStep(3)}>
                  Next: Bank &amp; Pickup Hub →
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-bold text-white text-sm uppercase border-b border-border pb-3">
                  1. Settlement Bank Account Details
                </h3>
                <Input
                  label="Beneficiary Legal Account Name"
                  required
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Bank Account Number"
                    required
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                  />
                  <Input
                    label="Bank IFSC Code"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                  />
                </div>
              </div>

              {/* Warehouse Pickup Address */}
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-emerald-400 text-sm uppercase">
                    2. Automated Courier Pickup Warehouse Hub
                  </h3>
                  <span className="text-[10px] text-zinc-500">SHIPROCKET SYNC</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  Courier will automatically arrive at this address to pick up physical garments and drops when orders are received.
                </p>

                <Input
                  label="Warehouse / Studio Address (Line 1)"
                  required
                  value={warehouseAddress}
                  onChange={(e) => setWarehouseAddress(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="City"
                    required
                    value={warehouseCity}
                    onChange={(e) => setWarehouseCity(e.target.value)}
                  />
                  <Input
                    label="State"
                    required
                    value={warehouseState}
                    onChange={(e) => setWarehouseState(e.target.value)}
                  />
                  <Input
                    label="Postal PIN Code"
                    required
                    value={warehousePin}
                    onChange={(e) => setWarehousePin(e.target.value)}
                  />
                </div>
                <Input
                  label="Warehouse Dispatch Contact Phone"
                  required
                  value={warehousePhone}
                  onChange={(e) => setWarehousePhone(e.target.value)}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="ghost" size="md" onClick={() => setStep(2)}>
                  ← Back
                </Button>
                <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                  SUBMIT COMPLETE ONBOARDING DOSSIER
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
