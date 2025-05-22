import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export default defineEventHandler(async (event) => {
  // When deployed, NuxtHub injects R2 bindings.
  // Locally, it uses environment variables for the S3 client.
  const hub = useHub(); // Provides access to NuxtHub features, including R2 bindings

  // Ensure bucket name is configured
  const bucketName = process.env.NUXT_HUB_R2_BUCKET_NAME;
  if (!bucketName) {
    throw createError({
      statusCode: 500,
      statusMessage: "R2 bucket name is not configured.",
    });
  }

  try {
    // Get the R2 binding (SDK instance) from NuxtHub
    // The `event.context.hub.r2` provides an R2Bucket instance
    // which has methods like .list(), .get(), .put(), etc.
    // This is simpler than instantiating S3Client manually for NuxtHub.
    const objects = await event.context.hub.r2(bucketName).list();

    // We only want image files, and we need their public URLs.
    // Assuming your R2 bucket is configured for public access or has a connected custom domain.
    // The key is the object's path in the bucket.
    // For public R2 buckets, the URL is typically:
    // https://<your-r2-public-bucket-url>/<object-key>
    // Replace <your-r2-public-bucket-url> with your bucket's public URL
    // (e.g., pub-xxxxxxxx.r2.dev or your custom domain).
    // This part might need adjustment based on your exact public URL setup.

    const r2PublicBaseUrl = `https://d059d559b54c11f29d0b573ee9509f77.r2.cloudflarestorage.com/${bucketName}`;
    // OR if you have a custom domain linked to your R2 bucket:
    // const r2PublicBaseUrl = 'https://your-custom-domain.com';

    const imageFiles = objects.objects
      .filter((obj) => obj.key && /\.(jpg|jpeg|png|gif|webp)$/i.test(obj.key))
      .map((obj) => ({
        key: obj.key,
        url: `${r2PublicBaseUrl}/${obj.key}`, // Construct the public URL
        uploaded: obj.uploaded,
        size: obj.size,
      }));

    return imageFiles;
  } catch (error: any) {
    console.error("Error listing R2 objects:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to list images from R2 bucket.",
      data: error.message,
    });
  }
});
