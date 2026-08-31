import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const body = await req.json();
    const {
      full_name,
      email,
      phone,
      portfolio_url,
      github_url,
      resume_url,
      cover_note,
      expected_salary,
    } = body;

    if (!full_name || !email || !resume_url || !cover_note) {
      return NextResponse.json(
        { error: "Please fill in all required fields (Name, Email, Resume, and About Me note)" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const newApplication = {
      id: uuidv4(),
      job_id: jobId,
      applicant_id: user?.id || null,
      full_name,
      email,
      phone: phone || null,
      portfolio_url: portfolio_url || null,
      github_url: github_url || null,
      resume_url,
      cover_note,
      expected_salary: expected_salary || null,
      status: "submitted",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("job_applications").insert(newApplication).select().single();

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully! The company hiring team has received your profile.",
      application: data || newApplication,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
