import { S3Client } from "@aws-sdk/client-s3";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "placeholder-account-id";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "placeholder-access-key";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "placeholder-secret-key";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});
