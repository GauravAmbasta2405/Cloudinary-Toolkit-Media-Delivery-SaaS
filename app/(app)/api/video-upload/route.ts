export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}

import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { resend } from "@/utils/resend";
import { currentUser } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

interface CloudinaryUploadResult {
  public_id: string;
  bytes: number;
  duration?: number;
  [key: string]: any;
}

export async function POST(req: NextRequest) {
  try {
    //const { userId } = auth();

    const authData = await auth();
    const userId = authData.userId;

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: "Cloudinary credentials not found" },
        { status: 500 }
      );
    }
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const originalSize = formData.get("originalSize") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    //Convert File to Buffer and upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload the image to Cloudinary
    const result = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: "video-uploads",
            transformation: [
              {
                quality: "auto",
                fetch_format: "mp4",
              },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as CloudinaryUploadResult);
          }
        );

        uploadStream.end(buffer);
      }
    );

    const video = await prisma.video.create({
      data: {
        title,
        description,
        publicId: result.public_id,
        originalSize: originalSize,
        compressedSize: String(result.bytes),
        duration: result.duration || 0,
      },
    });

    //adding feature for report

    const user = await currentUser();
    const email = user?.emailAddresses[0].emailAddress;

    const compressionPercentage = Math.round(
      (1 - Number(result.bytes) / Number(originalSize)) * 100
    );

    const report = `
VIDEO ANALYTICS REPORT
----------------------
Title: ${title}
Description: ${description}
Duration: ${result.duration || 0} seconds
Original Size: ${(Number(originalSize) / 1024 / 1024).toFixed(2)} MB
Compressed Size: ${(Number(result.bytes) / 1024 / 1024).toFixed(2)} MB
Compression Saved: ${compressionPercentage}%
Upload Time: ${new Date().toLocaleString()}
Cloudinary ID: ${result.public_id}
`;

    if (email) {
      await resend.emails.send({
        from: "Cloudinary Toolkit <onboarding@resend.dev>",
        to: [email],
        subject: "Your Video Analytics Report",
        html: `
      <h2>Upload Successful </h2>
      <pre>${report}</pre>
    `,
      });
    }
    return NextResponse.json(video);
  } catch (error) {
    console.log("UPload video failed", error);
    return NextResponse.json({ error: "UPload video failed" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
