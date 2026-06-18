import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { token } = body as { token: string };

  if (!token) {
    return NextResponse.json({ success: false, error: "Missing token" }, { status: 400 });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ success: false, error: "Secret key not configured" }, { status: 500 });
  }

  const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
  const response = await fetch(verifyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: secretKey, response: token }),
  });

  const data = await response.json();

  return NextResponse.json({
    success: data.success,
    score: data.score,
    action: data.action,
  });
}
