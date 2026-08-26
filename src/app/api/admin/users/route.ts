import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const user = session.user as any;
  if (!isSuperAdmin(user)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      image: true,
      isActive: true,
      signupIp: true,
      refereeBadge: true,
      createdAt: true,
      _count: {
        select: {
          championships: true,
          venues: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const currentUser = session.user as any;
  if (!isSuperAdmin(currentUser)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, action, role, isActive, password, name, email, phone } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId este obligatoriu" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "Utilizatorul nu a fost găsit" }, { status: 404 });
    }

    // 1. Reset Password Action
    if (action === "reset_password") {
      if (!password || password.trim().length < 6) {
        return NextResponse.json({ error: "Parola nouă trebuie să aibă minim 6 caractere." }, { status: 400 });
      }
      const passwordHash = await bcrypt.hash(password.trim(), 10);
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
      return NextResponse.json({ success: true, message: `Parola utilizatorului ${updated.email} a fost resetată cu succes! ✓` });
    }

    // 2. Toggle Active Status Action
    if (action === "toggle_status") {
      const newStatus = typeof isActive === "boolean" ? isActive : !targetUser.isActive;
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isActive: newStatus },
      });
      return NextResponse.json({
        success: true,
        user: updated,
        message: `Contul ${updated.email} este acum ${newStatus ? "ACTIV" : "SUSPENDAT / DEZACTIVAT"}. ✓`,
      });
    }

    // 3. Edit User Profile Action
    if (action === "edit_user") {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name ?? targetUser.name,
          email: email ?? targetUser.email,
          phone: phone ?? targetUser.phone,
          role: role ?? targetUser.role,
          isActive: typeof isActive === "boolean" ? isActive : targetUser.isActive,
        },
      });
      return NextResponse.json({ success: true, user: updated, message: "Datele utilizatorului au fost actualizate! ✓" });
    }

    // 4. Update Role Action (default fallback)
    if (role) {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { role },
      });
      return NextResponse.json({ success: true, user: updated, message: `Rolul utilizatorului ${updated.email} a fost schimbat în ${role}. ✓` });
    }

    return NextResponse.json({ error: "Acțiune necunoscută" }, { status: 400 });
  } catch (err: any) {
    console.error("Error updating user:", err);
    return NextResponse.json({ error: err.message || "Eroare la actualizarea utilizatorului." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Autentificare necesară" }, { status: 401 });
  }

  const currentUser = session.user as any;
  if (!isSuperAdmin(currentUser)) {
    return NextResponse.json({ error: "Acces interzis: Doar SuperAdmin." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId este obligatoriu" }, { status: 400 });
    }

    if (userId === currentUser.id) {
      return NextResponse.json({ error: "Nu îți poți șterge propriul cont de SuperAdmin!" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true, message: "Utilizatorul a fost șters definitiv din baza de date. ✓" });
  } catch (err: any) {
    console.error("Error deleting user:", err);
    return NextResponse.json({ error: err.message || "Eroare la ștergerea utilizatorului." }, { status: 500 });
  }
}
