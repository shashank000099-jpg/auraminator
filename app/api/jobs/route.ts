import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { MOCK_JOBS } from "@/lib/mock-data";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const jobType = searchParams.get("type");
    const search = searchParams.get("q")?.toLowerCase();

    const supabase = createServerSupabase();
    let query = supabase.from("jobs").select("*").eq("status", "published");

    if (category && category !== "all") {
      query = query.eq("role_category", category);
    }
    if (jobType && jobType !== "all") {
      query = query.eq("job_type", jobType);
    }

    const { data: dbJobs, error } = await query.order("created_at", { ascending: false });

    if (!error && dbJobs && dbJobs.length > 0) {
      let filtered = dbJobs;
      if (search) {
        filtered = filtered.filter(
          (j) =>
            j.title.toLowerCase().includes(search) ||
            j.company_name.toLowerCase().includes(search) ||
            j.description.toLowerCase().includes(search)
        );
      }
      return NextResponse.json({ jobs: filtered });
    }

    // Fallback to rich mock data
    let fallback = MOCK_JOBS;
    if (category && category !== "all") {
      fallback = fallback.filter((j) => j.role_category === category);
    }
    if (jobType && jobType !== "all") {
      fallback = fallback.filter((j) => j.job_type === jobType);
    }
    if (search) {
      fallback = fallback.filter(
        (j) =>
          j.title.toLowerCase().includes(search) ||
          j.company_name.toLowerCase().includes(search) ||
          j.description.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ jobs: fallback });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, jobs: MOCK_JOBS }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      company_name,
      company_logo,
      title,
      role_category,
      job_type,
      location,
      salary_range,
      description,
      requirements,
      benefits,
      contact_email,
    } = body;

    if (!company_name || !title || !description || !contact_email) {
      return NextResponse.json({ error: "Missing required job fields" }, { status: 400 });
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-4)}`;
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const newJob = {
      id: uuidv4(),
      poster_id: user?.id || "demo-poster-uuid-0001",
      company_name,
      company_logo: company_logo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      title,
      slug,
      role_category: role_category || "engineering",
      job_type: job_type || "full_time",
      location: location || "Remote",
      salary_range: salary_range || "Negotiable / Competitive",
      description,
      requirements: requirements || [],
      benefits: benefits || [],
      contact_email,
      status: "published",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      applicant_count: 0,
    };

    const { data, error } = await supabase.from("jobs").insert(newJob).select().single();

    return NextResponse.json({ success: true, job: data || newJob });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
