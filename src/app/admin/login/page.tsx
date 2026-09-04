import { redirect } from "next/navigation";
import { getStaffSession, staffHomePath } from "@/lib/admin-auth";
import { AdminLoginForm } from "./AdminLoginForm";

export default async function AdminLoginPage() {
  const staff = await getStaffSession();
  if (staff) {
    redirect(staffHomePath(staff.role));
  }

  return <AdminLoginForm />;
}
