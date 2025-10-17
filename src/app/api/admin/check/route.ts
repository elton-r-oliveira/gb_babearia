import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "../../../../lib/firebaseAdmin"

const ADMIN_EMAILS = ["elton@gmail.com", "admin@gbbarbershop.com"];

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // Verificar token com Firebase adm
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userEmail = decodedToken.email;

    const isAdmin = ADMIN_EMAILS.includes(userEmail!);
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("Erro ao verificar admin:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
