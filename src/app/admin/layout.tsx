import { headers } from "next/headers";
import { getCurrentAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  return (
    <div className="admin-theme dark h-screen max-h-screen w-full overflow-hidden bg-background text-foreground flex flex-col md:flex-row">
      {admin && <AdminSidebar admin={admin} />}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {admin && <AdminHeader admin={admin} />}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-0 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
