import { redirect } from "next/navigation";
import { ADMIN_PASSWORD_REQUIRED } from "@/lib/admin-auth-config";
import { AdminLoginForm } from "./AdminLoginForm";

export default function AdminLoginPage() {
  if (!ADMIN_PASSWORD_REQUIRED) {
    redirect("/admin/reservas");
  }

  return <AdminLoginForm />;
}
