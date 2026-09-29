import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Clipboard, LogOut, Mail, ShieldCheck, UsersRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/api/axios";
import { createHost } from "@/api/admin.api";
import { useAuthStore } from "@/store/auth.store";

const hostSchema = z.object({
    name: z.string().trim().min(2, "Enter the host's name."),
    email: z.string().trim().email("Enter a valid host email."),
});

type HostFormValues = z.infer<typeof hostSchema>;

export default function RoleHomePage({ role }: { role: "admin" | "host" | "receptionist" }) {
    const navigate = useNavigate();
    const { user, clearAuth } = useAuthStore();
    const [requestError, setRequestError] = useState<string | null>(null);
    const [createdCredentials, setCreatedCredentials] = useState<{ email: string; temporaryPassword: string; emailSent: boolean } | null>(null);
    const [copied, setCopied] = useState(false);
    const form = useForm<HostFormValues>({ resolver: zodResolver(hostSchema) });

    if (!user || user.role !== role) return <Navigate to="/login" replace />;

    const logout = () => {
        clearAuth();
        navigate("/login", { replace: true });
    };

    const submitHost = async (values: HostFormValues) => {
        setRequestError(null);
        setCreatedCredentials(null);

        try {
            const response = await createHost(values);
            if (!response.data) throw new Error("Host credentials were not returned.");

            setCreatedCredentials({
                email: response.data.credentials.email,
                temporaryPassword: response.data.credentials.temporaryPassword,
                emailSent: response.data.emailSent,
            });
            form.reset();
        } catch (error) {
            setRequestError(getApiErrorMessage(error));
        }
    };

    const copyCredentials = async () => {
        if (!createdCredentials) return;
        await navigator.clipboard.writeText(`Email: ${createdCredentials.email}\nPassword: ${createdCredentials.temporaryPassword}`);
        setCopied(true);
    };

    const title = role === "admin" ? "Administration workspace" : role === "host" ? "Welcome to your host workspace" : "Reception workspace";

    return (
        <main className="min-h-svh bg-background px-6 py-6 text-foreground sm:px-10">
            <div className="mx-auto w-full max-w-6xl">
                <header className="flex items-center justify-between border-b border-border pb-5">
                    <div className="flex items-center gap-3"><span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground"><ShieldCheck className="size-5" /></span><div><p className="text-sm font-bold">VisitorFlow</p><p className="text-xs capitalize text-muted-foreground">{role} workspace</p></div></div>
                    <Button variant="ghost" onClick={logout}><LogOut /> Sign out</Button>
                </header>

                <section className="py-14">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Signed in as {user.email}</p>
                    <h1 className="mt-3 text-5xl font-bold tracking-tight">{title}</h1>
                    <p className="mt-5 max-w-xl leading-7 text-muted-foreground">{role === "admin" ? "Create host accounts from this protected administration workspace." : role === "host" ? "Your account is ready. Visitor requests and appointment tools will appear here as the host workflow is added." : "Reception tools for arrivals, QR check-in, and check-out will appear here next."}</p>

                    {role === "admin" ? (
                        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
                            <form className="rounded-2xl border border-border bg-card p-6 shadow-sm" onSubmit={form.handleSubmit(submitHost)} noValidate>
                                <div className="flex items-center gap-3"><UsersRound className="size-5 text-primary" /><h2 className="text-xl font-bold">Create a host</h2></div>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">A temporary password will be generated and emailed to the host.</p>
                                {requestError && <Alert className="mt-5" variant="destructive"><AlertTitle>Host creation failed</AlertTitle><AlertDescription>{requestError}</AlertDescription></Alert>}
                                <div className="mt-6 grid gap-4">
                                    <label className="grid gap-2 text-sm font-medium" htmlFor="host-name">Host name<input id="host-name" className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20" {...form.register("name")} />{form.formState.errors.name && <span className="text-xs font-normal text-destructive">{form.formState.errors.name.message}</span>}</label>
                                    <label className="grid gap-2 text-sm font-medium" htmlFor="host-email">Host email<input id="host-email" type="email" className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/20" {...form.register("email")} />{form.formState.errors.email && <span className="text-xs font-normal text-destructive">{form.formState.errors.email.message}</span>}</label>
                                </div>
                                <Button className="mt-6 h-11 w-full" type="submit" disabled={form.formState.isSubmitting}><Mail />{form.formState.isSubmitting ? "Creating host..." : "Create host and send credentials"}</Button>
                            </form>

                            {createdCredentials && <section className="rounded-2xl border border-success/30 bg-success/5 p-6 shadow-sm"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-success">Host created</p><h2 className="mt-2 text-xl font-bold">Temporary credentials</h2></div><Button variant="outline" onClick={copyCredentials}>{copied ? <Check /> : <Clipboard />} {copied ? "Copied" : "Copy"}</Button></div><div className="mt-6 grid gap-3 rounded-xl bg-background p-4 text-sm"><div><span className="text-muted-foreground">Email</span><p className="mt-1 break-all font-semibold">{createdCredentials.email}</p></div><div><span className="text-muted-foreground">Temporary password</span><p className="mt-1 break-all font-mono font-semibold">{createdCredentials.temporaryPassword}</p></div></div><p className="mt-4 text-sm text-muted-foreground">{createdCredentials.emailSent ? "Credentials were emailed to the host." : "The host was created, but the email could not be sent."} Keep this password secure; it will not be shown again after leaving this page.</p></section>}
                        </div>
                    ) : (
                        <div className="mt-10 inline-flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-sm"><UsersRound className="size-5 text-primary" /> Account role: <strong className="capitalize">{role}</strong></div>
                    )}
                </section>
            </div>
        </main>
    );
}