import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = contactFormSchema.parse(body);

    console.log("Contact form submission:", validatedData);

    return NextResponse.json(
      { message: "Message received successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
