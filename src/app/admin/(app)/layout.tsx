import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { logout } from "../login/actions";
import AdminNav from "./AdminNav";

/**
 * The signed-in admin shell. `requireAdmin()` runs before anything renders, so
 * an unauthenticated or non-admin request never sees a single byte of the
 * admin — and it runs again inside every Server Action, because actions are
 * their own endpoints and do not inherit this check.
 */
export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const { displayName, email } = await requireAdmin();

  return (
    <div className="a-shell">
      <aside className="a-sidebar">
        <Link href="/admin" className="a-brand">
          Improve your skills
          <small>Verwaltung</small>
        </Link>

        <AdminNav />

        <div className="a-user">
          <span>
            <strong>{displayName}</strong>
            <br />
            {email}
          </span>
          <form action={logout}>
            <button type="submit" className="a-btn a-btn-sm a-btn-on-dark">
              Abmelden
            </button>
          </form>
        </div>
      </aside>

      <main className="a-main">
        <div className="a-main-inner">{children}</div>
      </main>
    </div>
  );
}
