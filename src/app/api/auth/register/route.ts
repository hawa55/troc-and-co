import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser, getUserByEmail } from "@/lib/models";
import { hashPassword, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
  city: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  const { name, email, password, city } = parsed.data;

  if (getUserByEmail(email)) {
    return NextResponse.json({ error: "Un compte existe déjà avec cet e-mail" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = createUser({ email, passwordHash, name, city });
  await setSessionCookie({ userId: user.id, email: user.email, name: user.name });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
