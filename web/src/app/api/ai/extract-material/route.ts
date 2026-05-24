import { NextRequest, NextResponse } from "next/server";

import { getCurrentTeacher } from "@/shared/lib/server/current-user";
import { extractTextFromUpload } from "@/shared/lib/server/extract-file-text";
import { unauthorized } from "@/shared/lib/server/api-response";

export async function POST(request: NextRequest) {
  const teacher = await getCurrentTeacher();
  if (!teacher) {
    return unauthorized();
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "File is required (field name: file)" },
        { status: 400 },
      );
    }

    const result = await extractTextFromUpload(file);

    if (!result.text) {
      return NextResponse.json(
        {
          message:
            "No text found in file. Try a clearer scan or paste text manually.",
          fileName: result.fileName,
          text: "",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      fileName: result.fileName,
      mimeType: result.mimeType,
      text: result.text.slice(0, 12000),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "File processing failed",
      },
      { status: 400 },
    );
  }
}
