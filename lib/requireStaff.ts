import { redirect } from "next/navigation";
import { getCurrentStaff, type SessionStaff } from "@/lib/session";

// ป้องกันผู้ใช้ทั่วไปเข้าถึง (ต้อง Login เป็น staff หรือ admin เท่านั้น)
export async function requireStaff(): Promise<SessionStaff> {
  const staff = await getCurrentStaff();
  if (!staff) redirect("/");
  return staff;
}

// ป้องกันผู้ที่ไม่ใช่ Admin (ถ้าเป็น staff ธรรมดาจะถูก redirect ไปหน้า /staff)
export async function requireAdmin(): Promise<SessionStaff> {
  const staff = await requireStaff();
  if (staff.role !== "admin") redirect("/staff");
  return staff;
}