/**
 * AURAMINATOR AUTOMATED AI SEO & GEO OPTIMIZATION ENGINE
 *
 * Uses Google Gemini AI API to analyze titles, descriptions, asset classes,
 * tech stacks, and job requirements to automatically generate:
 * - High-CTR Google Search Titles (< 60 chars)
 * - Conversion-optimized Meta Descriptions (< 155 chars)
 * - 12+ Targeted SEO & GEO Keywords
 * - OpenGraph & Twitter Card Metadata
 * - Valid Schema.org JSON-LD (SoftwareApplication, JobPosting, Product, Service)
 */

export interface GeneratedSeoMetadata {
  seo_title: string;
  seo_description: string;
  keywords: string[];
  og_title: string;
  og_description: string;
  canonical_slug: string;
  geo_region: string;
  geo_placename: string;
  schema_type: "SoftwareApplication" | "JobPosting" | "Product" | "Service";
  schema_json_ld: Record<string, any>;
}

export async function generateAutomatedSeo(input: {
  title: string;
  description: string;
  type: string; // 'saas' | 'app' | 'source_code' | 'social_account' | 'physical' | 'service' | 'job' | 'digital_file'
  priceOrSalary?: number | string;
  techStackOrLocation?: string;
  brandOrCompany?: string;
}): Promise<GeneratedSeoMetadata> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const cleanTitle = input.title.trim();
  const cleanDesc = input.description.trim();
  const type = input.type || "saas";
  const brand = input.brandOrCompany || "Auraminator";

  // If Gemini API Key is available, call the Gemini Generative Engine
  if (apiKey) {
    try {
      const prompt = `You are a World-Class Technical SEO and GEO-Optimization AI for Auraminator.in, an elite marketplace and escrow platform.
Analyze the following listing:
- Title: "${cleanTitle}"
- Description: "${cleanDesc}"
- Classification Type: "${type}"
- Price/Compensation: "${input.priceOrSalary || "Market Value"}"
- Tech Stack/Location: "${input.techStackOrLocation || "Global / India"}"
- Company/Brand: "${brand}"

Generate optimal SEO & GEO metadata in valid JSON format with these exact keys:
{
  "seo_title": "Max 58 chars title with brand suffix | Auraminator",
  "seo_description": "Max 155 chars high-converting meta description",
  "keywords": ["10-14 high volume search tags including regional geo tags"],
  "og_title": "Engaging social card headline",
  "og_description": "Rich social preview summary",
  "geo_region": "IN",
  "geo_placename": "India",
  "search_intent": "commercial / transactional"
}
Output ONLY the raw JSON object, without markdown backticks or commentary.`;

      const models = ["gemini-flash-latest", "gemini-3.6-flash", "gemini-flash-lite-latest"];
      let data: any = null;

      for (const model of models) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens: 600,
                },
              }),
            }
          );

          if (res.ok) {
            data = await res.json();
            break;
          }
        } catch {
          // Continue to next model
        }
      }

      if (data) {
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleanJsonStr = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJsonStr);

        return formatSeoResult(parsed, input);
      }
    } catch {
      // Fallback to deterministic AI-heuristic SEO generator if external request fails
    }
  }

  // Robust Built-In AI Heuristic SEO Engine (Zero Dependency & Instant Execution)
  return generateDeterministicSeo(input);
}

function formatSeoResult(parsed: any, input: any): GeneratedSeoMetadata {
  const schemaType = getSchemaType(input.type);
  const jsonLd = buildSchemaJsonLd(schemaType, input, parsed.seo_title, parsed.seo_description);

  return {
    seo_title: parsed.seo_title || `${input.title} • Auraminator`,
    seo_description: parsed.seo_description || input.description.slice(0, 150),
    keywords: parsed.keywords || ["auraminator", "digital-asset", "escrow", "verified-marketplace"],
    og_title: parsed.og_title || parsed.seo_title,
    og_description: parsed.og_description || parsed.seo_description,
    canonical_slug: input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    geo_region: parsed.geo_region || "IN",
    geo_placename: parsed.geo_placename || "India",
    schema_type: schemaType,
    schema_json_ld: jsonLd,
  };
}

function generateDeterministicSeo(input: any): GeneratedSeoMetadata {
  const type = input.type || "saas";
  let typeLabel = "Turnkey Asset";
  let schemaType: "SoftwareApplication" | "JobPosting" | "Product" | "Service" = "SoftwareApplication";

  switch (type) {
    case "saas":
    case "website":
      typeLabel = "Turnkey SaaS Platform (Verified MRR)";
      schemaType = "SoftwareApplication";
      break;
    case "app":
      typeLabel = "Mobile App & Source IP";
      schemaType = "SoftwareApplication";
      break;
    case "source_code":
      typeLabel = "Exclusive Source Code & IP";
      schemaType = "SoftwareApplication";
      break;
    case "social_account":
      typeLabel = "Monetized Channel & Social Brand";
      schemaType = "Product";
      break;
    case "physical":
      typeLabel = "500 GSM Luxury Streetwear Drop";
      schemaType = "Product";
      break;
    case "service":
      typeLabel = "24h SLA Tech & Debugging Sprint";
      schemaType = "Service";
      break;
    case "job":
      typeLabel = "Careers & Hiring";
      schemaType = "JobPosting";
      break;
    default:
      typeLabel = "Verified Digital Vault Asset";
      schemaType = "Product";
  }

  const seoTitle = `${input.title.slice(0, 42)} | ${typeLabel} • Auraminator`.slice(0, 60);
  const seoDesc = `Buy, negotiate & acquire ${input.title}. ${input.description.slice(0, 80)}... 100% Escrow Protected with instant verified handover on Auraminator.in.`.slice(0, 155);

  const keywords = [
    input.title.toLowerCase().replace(/[^a-z0-9\s]/g, ""),
    type,
    typeLabel.toLowerCase(),
    "auraminator",
    "verified escrow",
    "digital assets india",
    "buy saas startup",
    "delhivery express",
    "razorpay route",
    "mumbai",
    "delhi ncr",
    "bangalore tech",
  ].filter(Boolean);

  const jsonLd = buildSchemaJsonLd(schemaType, input, seoTitle, seoDesc);

  return {
    seo_title: seoTitle,
    seo_description: seoDesc,
    keywords,
    og_title: seoTitle,
    og_description: seoDesc,
    canonical_slug: input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    geo_region: "IN",
    geo_placename: "India",
    schema_type: schemaType,
    schema_json_ld: jsonLd,
  };
}

function getSchemaType(type: string): "SoftwareApplication" | "JobPosting" | "Product" | "Service" {
  if (["saas", "app", "source_code", "website"].includes(type)) return "SoftwareApplication";
  if (type === "job") return "JobPosting";
  if (type === "service") return "Service";
  return "Product";
}

function buildSchemaJsonLd(
  schemaType: "SoftwareApplication" | "JobPosting" | "Product" | "Service",
  input: any,
  title: string,
  desc: string
): Record<string, any> {
  const base = {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: title,
    description: desc,
    url: `https://auraminator.in/product/${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  };

  if (schemaType === "SoftwareApplication") {
    return {
      ...base,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Cloud, Web, iOS, Android",
      offers: {
        "@type": "Offer",
        price: input.priceOrSalary || "450000",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
    };
  }

  if (schemaType === "JobPosting") {
    return {
      ...base,
      title: input.title,
      hiringOrganization: {
        "@type": "Organization",
        name: input.brandOrCompany || "Auraminator Partner Studio",
        sameAs: "https://auraminator.in",
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: input.techStackOrLocation || "Bangalore / Remote",
          addressCountry: "IN",
        },
      },
      employmentType: "FULL_TIME",
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "INR",
        value: {
          "@type": "QuantitativeValue",
          value: input.priceOrSalary || "2400000",
          unitText: "YEAR",
        },
      },
    };
  }

  if (schemaType === "Service") {
    return {
      ...base,
      provider: {
        "@type": "Organization",
        name: "Auraminator Verified Specialists",
      },
      offers: {
        "@type": "Offer",
        price: input.priceOrSalary || "4999",
        priceCurrency: "INR",
      },
    };
  }

  // Product
  return {
    ...base,
    brand: {
      "@type": "Brand",
      name: "Auraminator Cut-and-Sew",
    },
    offers: {
      "@type": "Offer",
      price: input.priceOrSalary || "2499",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
  };
}
