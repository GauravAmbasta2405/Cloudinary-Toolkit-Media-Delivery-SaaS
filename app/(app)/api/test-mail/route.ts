import { NextResponse } from "next/server";
import { resend } from "@/utils/resend";

export async function GET() {
  try {
    const dummySrt = `1
00:00:00,000 --> 00:00:05,000
Hello, this is your subtitle file!

2
00:00:05,000 --> 00:00:10,000
Mail attachment test successful.`;

    await resend.emails.send({
      from: "Cloudinary Toolkit <onboarding@resend.dev>",
      to: [process.env.TEST_EMAIL!],
      subject: "Your Subtitle File",
      html: "<strong>Attached is your subtitle file 🎬</strong>",
      attachments: [
        {
          filename: "subtitles.srt",
          content: Buffer.from(dummySrt).toString("base64"),
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
