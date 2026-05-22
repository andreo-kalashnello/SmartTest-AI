import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function validationError(error: ZodError) {
  return NextResponse.json(
    {
      message: "Invalid request data",
      errors: error.flatten(),
    },
    { status: 400 },
  );
}

export function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
