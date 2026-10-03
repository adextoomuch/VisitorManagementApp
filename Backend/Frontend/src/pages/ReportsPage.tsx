import { useState } from "react";
import { CalendarDays, RefreshCw, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Report = {
  summary: {
    total: number;
    pendingApproval: number;
    approved: number;
    rejected: number;
    checkedIn: number;
    checkedOut: number;
  };
  purposeBreakdown: Record<string, number>;
  dailyBreakdown: Record<string, number>;
};

export default function ReportsPage() {
  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateReport() {
    setLoading(true);
    setError("");

    try {
      const url =
        "/VMS/version1/reports?startDate=" + startDate + "&endDate=" + endDate;

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load report");
      }

      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-svh bg-background px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-sm font-medium text-primary">
            VisitorFlow Analytics
          </p>

          <h1 className="mt-2 text-3xl font-semibold">Visitor Reports</h1>

          <p className="mt-2 text-muted-foreground">
            View visitor activity and statistics for a selected date range.
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-end">
            <label className="flex flex-1 flex-col gap-2 text-sm font-medium">
              Start date
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3"
                />
              </div>
            </label>

            <label className="flex flex-1 flex-col gap-2 text-sm font-medium">
              End date
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3"
                />
              </div>
            </label>

            <Button onClick={generateReport} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} />
              {loading ? "Loading..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {report && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Total Visitors" value={report.summary.total} />

            <StatCard
              title="Pending Approval"
              value={report.summary.pendingApproval}
            />
            <StatCard title="Approved" value={report.summary.approved} />

            <StatCard title="Rejected" value={report.summary.rejected} />

            <StatCard title="Checked In" value={report.summary.checkedIn} />

            <StatCard title="Checked Out" value={report.summary.checkedOut} />
          </section>
        )}

        {report && (
          <section className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Visit Purpose</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {Object.entries(report.purposeBreakdown).map(
                  ([purpose, count]) => (
                    <div
                      key={purpose}
                      className="flex items-center justify-between border-b pb-3"
                    >
                      <span>{purpose}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Visitors</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {Object.entries(report.dailyBreakdown).map(([date, count]) => (
                  <div
                    key={date}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <span>{date}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between pt-6">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>

        <Users className="size-6 text-primary" />
      </CardContent>
    </Card>
  );
}
