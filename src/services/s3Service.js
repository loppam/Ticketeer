import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (file, path) => {
  try {
    const command = new PutObjectCommand({
      Bucket: import.meta.env.VITE_S3_BUCKET,
      Key: path,
      Body: file,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Return the URL of the uploaded file
    return `https://${import.meta.env.VITE_S3_BUCKET}.s3.${
      import.meta.env.VITE_AWS_REGION
    }.amazonaws.com/${path}`;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};
