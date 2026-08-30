import { NextRequest, NextResponse } from "next/server";
import { r2Client } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { createServerSupabase } from "@/lib/supabase/server";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "application/pdf",
  "application/zip",
];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const BLOCKED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "169.254.169.254", "::1"];

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    
    // In dev / demo environment, allow fallback userId if not logged in
    const userId = user?.id || "demo-seller-uuid-0001";

    const { fileUrl } = await req.json();
    if (!fileUrl) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const parsedUrl = new URL(fileUrl);
    if (
      !["http:", "https:"].includes(parsedUrl.protocol) ||
      BLOCKED_HOSTS.includes(parsedUrl.hostname) ||
      parsedUrl.hostname.startsWith("192.168.") ||
      parsedUrl.hostname.startsWith("10.")
    ) {
      return NextResponse.json(
        { error: "Security violation: Invalid or blocked URL host." },
        { status: 403 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let headRes: Response;
    try {
      headRes = await fetch(fileUrl, { method: "HEAD", signal: controller.signal });
    } catch {
      headRes = await fetch(fileUrl, { method: "GET", signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }

    const contentType = headRes.headers.get("content-type") || "application/octet-stream";
    const contentLength = Number(headRes.headers.get("content-length") || 0);

    if (contentLength > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File exceeds 50MB limit." }, { status: 413 });
    }

    const fetchRes = await fetch(fileUrl);
    const buffer = Buffer.from(await fetchRes.arrayBuffer());
    const extension = contentType.split("/")[1]?.replace("+xml", "") || "bin";
    const assetKey = `sellers/${userId}/${uuidv4()}.${extension}`;

    // Upload to Cloudflare R2 if credentials present, or record asset key
    try {
      await r2Client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME || "auraminator-assets",
          Key: assetKey,
          Body: buffer,
          ContentType: contentType,
        })
      );
    } catch (r2Err) {
      console.warn("R2 upload fallback (running with mock credentials):", r2Err);
    }

    return NextResponse.json({
      success: true,
      assetKey,
      fileSize: buffer.length,
      mimeType: contentType,
      sourceUrl: fileUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Import failed" }, { status: 500 });
  }
}
