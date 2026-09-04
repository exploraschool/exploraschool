import { redirect } from "next/navigation";
import { getStaffSession, staffHomePath } from "@/lib/admin-auth";

export default async function AdminPage() {
  const staff = await getStaffSession();
  if (!staff) redirect("/admin/login");
  redirect(staffHomePath(staff.role));
}
