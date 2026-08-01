import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * S3-backed file storage.
 *
 * Everything is uploaded private. Resumes are candidate PII and must never be
 * world-readable from a guessable URL, so reads go through short-lived signed
 * URLs issued only after an auth check (see /api/files/[...key]).
 */

const REGION = process.env.AWS_REGION || "ap-south-1";
const BUCKET = process.env.S3_BUCKET || "";

const s3 = new S3Client({ region: REGION });

export const STORAGE_CONFIGURED = Boolean(BUCKET);

/** Signed URLs outlive a page render but not a shared link pasted elsewhere. */
const SIGNED_URL_TTL_SECONDS = 300;

export type UploadKind = "resumes" | "images";

export async function putObject(opts: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: opts.key,
      Body: opts.body,
      ContentType: opts.contentType,
      // Defence in depth — the bucket also blocks public access at the account level.
      ServerSideEncryption: "AES256",
    })
  );
}

export async function signedReadUrl(key: string) {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: SIGNED_URL_TTL_SECONDS }
  );
}
