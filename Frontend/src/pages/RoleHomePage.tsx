import { LogOut, ShieldCheck, UsersRound } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";

export default function RoleHomePage({ role }: { role: "admin" | "host" | "receptionist" }) {
    const navigate = useNavigate();
    const { user, clearAuth } = useAuthStore();

    if (!user || user.role !== role) return <Navigate to="/login" replace />;

    const title = role === "admin" ? "Administration workspace" : role === "host" ? "Host workspace" : "Reception workspace";

    const logout = () => {
        clearAuth();
        navigate("/login", { replace: true });
    };

    return (
        <main className="min-h-svh bg-background px-6 py-6 text-foreground sm:px-10">
            <div className="mx-auto w-full max-w-6xl">
                <header className="flex items-center justify-between border-b border-border pb-5">
                    <div className="flex items-center gap-3"><span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><ShieldCheck className="size-5" /></span><div><p className="text-sm font-bold">VisitorFlow</p><p className="text-xs capitalize text-muted-foreground">{role} workspace</p></div></div>
                    <Button variant="ghost" onClick={logout}><LogOut /> Sign out</Button>
                </header>
                <section className="py-16"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Signed in as {user.email}</p><h1 className="mt-3 text-5xl font-bold tracking-tight">{title}</h1><p className="mt-4 max-w-xl leading-7 text-muted-foreground">Your authentication is active. Role-specific visitor tools can be added here next.</p><div className="mt-10 inline-flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-sm"><UsersRound className="size-5 text-primary" /> Account role: <strong className="capitalize">{role}</strong></div></section>
            </div>
        </main>
    );
}