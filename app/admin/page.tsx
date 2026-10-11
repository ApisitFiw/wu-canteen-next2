import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/staff");

  return (
    <div className="flex items-center gap-4">
      Admin Page - Welcome, {staff.full_name} ({staff.role})
    </div>
  );
}
