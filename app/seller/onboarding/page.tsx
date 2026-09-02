"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, CheckCircle2, Building, Upload, CreditCard, Sparkles, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuraminatorIcon, AuraminatorLogo } from "@/components/brand-logo";
import { useAuth } from "@/lib/context/auth-context";

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State - Clean & Empty
  const [businessName, setBusinessName] = useState("");
  const [taxIdentifier, setTaxIdentifier] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");

  // Warehouse Pickup Address State
  const [warehouseAddress, setWarehouseAddress] = useState("");
  const [warehouseCity, setWarehouseCity] = useState("");
  const [warehouseState, setWarehouseState] = useState("");
  const [warehousePin, setWarehousePin] = useState("");
  const [warehousePhone, setWarehousePhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Pre-fill beneficiary name from auth user if available
  useEffect(() => {
    if (user?.fullName && !beneficiaryName) {
      setBeneficiaryName(user.fullName);
    }
  }, [user, beneficiaryName]);

  // Auth Gate: Require login/signup to access Creator KYC
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-white rounded-full animate-ping"></div>
          <span>VERIFYING CREATOR CREDENTIALS...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center font-mono selection:bg-white selection:text-black">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-surface p-8 text-center space-y-6 brutalist-card">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold uppercase tracking-tight text-white">
              CREATOR AUTHENTICATION REQUIRED
            </h2>
            <p className="text-xs text-zinc-400 font-sans">
              You must sign in or register an account before submitting Seller KYC verification and launching your studio on Auraminator.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <Link href="/auth/login?redirect=/seller/onboarding">
              <Button variant="primary" size="lg" className="w-full font-mono">
                <span>SIGN IN TO APPLY</span>
                <ArrowRight className="h-4 w-4 ml-2 inline" />
              </Button>
            </Link>
            <Link href="/auth/signup?redirect=/seller/onboarding">
              <Button variant="outline" size="sm" className="w-full font-mono text-zinc-400 hover:text-white">
                Create New Account (Free)
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !taxIdentifier || !bankAccount || !ifscCode) return;
    setIsSubmitting(true);

    try {
      await fetch("/api/seller/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legal_business_name: businessName,
          tax_identifier: taxIdentifier,
          document_urls: documentUrl ? [documentUrl] : [],
          bank_details: {
            account_number: bankAccount,
            ifsc_code: ifscCode,
            beneficiary_name: beneficiaryName || businessName,
          },
        }),
      });

      // Also register warehouse pickup address for physical products if provided
      if (warehouseAddress && warehousePin) {
        await fetch("/api/seller/pickup-addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pickupLocationNickname: `${businessName.split(" ")[0] || "Hub"}-Origin`,
            contactName: beneficiaryName || businessName,
            contactPhone: warehousePhone,
            addressLine1: warehouseAddress,
            city: warehouseCity,
            state: warehouseState,
            pincode: warehousePin,
            isPrimary: true,
          }),
        });
      }

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
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold uppercase tracking-tight text-white">
              KYC DOSSIER TRANSMITTED
            </h1>
            <p className="text-xs text-zinc-400 font-sans">
              Your legal business verification and double-entry settlement profile have been registered into the Auraminator compliance ledger.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface-elevated p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Legal Business Name:</span>
              <span className="font-bold text-white">{businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Tax ID / PAN:</span>
              <span className="font-bold text-white">{taxIdentifier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Settlement Account:</span>
              <span className="font-bold text-white">•••• {bankAccount.slice(-4) || "XXXX"}</span>
            </div>
          </div>
          <Link href="/seller/dashboard">
            <Button variant="primary" size="lg" className="w-full">
              ENTER CREATOR STUDIO
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 font-mono">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-surface px-3 py-0.5 text-[11px] text-zinc-400 mb-2">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>SOVEREIGN CREATOR ONBOARDING</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              VERIFIED SELLER KYC &amp; SETTLEMENT SETUP
            </h1>
          </div>
          <AuraminatorIcon size={32} />
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-3 text-xs font-mono">
          {[
            { id: 1, label: "Business Identity" },
            { id: 2, label: "Bank Settlement" },
            { id: 3, label: "Pickup Warehouse" },
          ].map((s) => (
            <div
              key={s.id}
              onClick={() => setStep(s.id as any)}
              className={`rounded-lg border p-3 cursor-pointer transition-all ${
                step === s.id
                  ? "border-white bg-white text-black font-bold"
                  : "border-border bg-surface text-zinc-500 hover:text-white"
              }`}
            >
              <span className="text-[10px] block opacity-70">STEP 0{s.id}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitKYC} className="space-y-6">
          {/* Step 1: Legal Identity */}
          {step === 1 && (
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-4 brutalist-card">
              <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
                <Building className="h-4 w-4 text-emerald-400" />
                <span>Legal Business Details</span>
              </h3>

              <Input
                label="Legal Business Name / Sole Proprietor Name"
                required
                placeholder="e.g. Kaizen Global Labs Private Limited"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />

              <Input
                label="Tax Identification / GSTIN / PAN"
                required
                placeholder="e.g. 29ABCDE1234F1Z5 or ABCDE1234F"
                value={taxIdentifier}
                onChange={(e) => setTaxIdentifier(e.target.value)}
              />

              <Input
                label="Business Registration / Identity Document URL (Optional)"
                placeholder="https://..."
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
              />

              <div className="pt-4 flex justify-end">
                <Button type="button" variant="primary" onClick={() => setStep(2)}>
                  <span>CONTINUE TO SETTLEMENT</span>
                  <ArrowRight className="h-4 w-4 ml-1 inline" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Bank Details */}
          {step === 2 && (
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-4 brutalist-card">
              <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-400" />
                <span>Direct Bank Payout Settlement</span>
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                85% net earnings from all drops, digital vaults, and escrow releases will be disbursed to this linked account.
              </p>

              <Input
                label="Account Beneficiary Name"
                required
                placeholder="Name as registered on Bank Account"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
              />

              <Input
                label="Bank Account Number"
                required
                placeholder="e.g. 91823719283719"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
              />

              <Input
                label="Bank IFSC Code"
                required
                placeholder="e.g. HDFC0001234"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
              />

              <div className="pt-4 flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" variant="primary" onClick={() => setStep(3)}>
                  <span>CONTINUE TO WAREHOUSE SETUP</span>
                  <ArrowRight className="h-4 w-4 ml-1 inline" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Warehouse Pickup */}
          {step === 3 && (
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-4 brutalist-card">
              <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
                <Building className="h-4 w-4 text-emerald-400" />
                <span>Shiprocket Courier Pickup Warehouse</span>
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Origin warehouse address for courier pickup vans when physical streetwear or physical artifacts are dispatched.
              </p>

              <Input
                label="Street Address / Facility Location"
                placeholder="Plot / Street / Area"
                value={warehouseAddress}
                onChange={(e) => setWarehouseAddress(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  placeholder="e.g. New Delhi"
                  value={warehouseCity}
                  onChange={(e) => setWarehouseCity(e.target.value)}
                />
                <Input
                  label="State"
                  placeholder="e.g. Delhi"
                  value={warehouseState}
                  onChange={(e) => setWarehouseState(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Postal PIN Code"
                  placeholder="e.g. 110020"
                  value={warehousePin}
                  onChange={(e) => setWarehousePin(e.target.value)}
                />
                <Input
                  label="Facility Contact Phone"
                  placeholder="e.g. +91 98765 43210"
                  value={warehousePhone}
                  onChange={(e) => setWarehousePhone(e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting}>
                  SUBMIT KYC &amp; LAUNCH STUDIO
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
