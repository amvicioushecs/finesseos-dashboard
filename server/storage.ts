import { ENV } from './_core/env';
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let s3Client: S3Client | null = null;

function getS3Client() {
  if (s3Client) return s3Client;
  
  if (!ENV.storageAccessKeyId || !ENV.storageSecretAccessKey) {
    console.warn("[Storage] S3 credentials missing. Storage operations will fail.");
    return null;
  }

  s3Client = new S3Client({
    region: ENV.storageRegion,
    endpoint: ENV.storageEndpoint || undefined,
    credentials: {
      accessKeyId: ENV.storageAccessKeyId,
      secretAccessKey: ENV.storageSecretAccessKey,
    },
    forcePathStyle: !!ENV.storageEndpoint, // Required for Supabase/Minio
  });

  return s3Client;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const client = getS3Client();
  const key = normalizeKey(relKey);
  const bucket = ENV.storageBucket || "finesseos-assets";

  if (!client) {
    console.log(`[Storage Mock] Putting object: ${key}`);
    return { key, url: `https://mock-storage.com/${key}` };
  }

  const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);

  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  // Generate a public URL or a signed URL
  const url = ENV.storageEndpoint 
    ? `${ENV.storageEndpoint}/${bucket}/${key}`
    : `https://${bucket}.s3.${ENV.storageRegion}.amazonaws.com/${key}`;

  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  const client = getS3Client();
  const key = normalizeKey(relKey);
  const bucket = ENV.storageBucket || "finesseos-assets";

  if (!client) {
    return { key, url: `https://mock-storage.com/${key}` };
  }

  const url = await getSignedUrl(client, new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  }), { expiresIn: 3600 });

  return { key, url };
}
