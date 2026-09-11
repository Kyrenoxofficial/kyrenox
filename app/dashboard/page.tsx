import { redirect } from "next/navigation";
import { createClient } from "../utils/supabase/server";
import {
  BarChart3,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import MobileSidebar from "../MobileSidebar";
import TaskList from "../TaskList";
import NewMenu from "../NewMenu";

export default async function DashboardPage() {
    const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  redirect("/login");
}
 const { data: profile } = await supabase
  .from("profiles")
  .select("has_access")
  .eq("user_id", user.id)
  .single();

if (!profile?.has_access) {
  redirect("/");
}
const { count: clientCount } = await supabase
  .from("clients")
  .select("*", { count: "exact", head: true })
  .eq("user_id", user.id);
  
  const startOfMonth = new Date();
startOfMonth.setUTCDate(1);
startOfMonth.setUTCHours(0, 0, 0, 0);

const { count: newClientsThisMonth } = await supabase
  .from("clients")
  .select("*", { count: "exact", head: true })
  .eq("user_id", user.id)
  .gte("created_at", startOfMonth.toISOString());

const { count: activeProjectCount } = await supabase
  .from("projects")
  .select("*", { count: "exact", head: true })
  .eq("user_id", user.id)
  .eq("status", "active");

  const startOfWeek = new Date();
const day = startOfWeek.getUTCDay();
const diff = day === 0 ? -6 : 1 - day;
startOfWeek.setUTCDate(startOfWeek.getUTCDate() + diff);
startOfWeek.setUTCHours(0, 0, 0, 0);

const { count: newProjectsThisWeek } = await supabase
  .from("projects")
  .select("*", { count: "exact", head: true })
  .eq("user_id", user.id)
  .eq("status", "active")
  .gte("created_at", startOfWeek.toISOString());

  const { count: openTaskCount } = await supabase
  .from("tasks")
  .select("*", { count: "exact", head: true })
  .eq("user_id", user.id)
  .eq("completed", false);

  const startOfToday = new Date();
startOfToday.setUTCHours(0, 0, 0, 0);

const endOfToday = new Date(startOfToday);
endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);

const { count: dueTodayCount } = await supabase
  .from("tasks")
  .select("*", { count: "exact", head: true })
  .eq("user_id", user.id)
  .eq("completed", false)
  .gte("due_date", startOfToday.toISOString())
  .lt("due_date", endOfToday.toISOString());

  const { data: revenueRows } = await supabase
  .from("revenue")
  .select("amount")
  .eq("user_id", user.id)
  .eq("status", "paid");

const totalRevenue =
  revenueRows?.reduce((total, row) => total + Number(row.amount), 0) ?? 0;

const startOfCurrentMonth = new Date();
startOfCurrentMonth.setUTCDate(1);
startOfCurrentMonth.setUTCHours(0, 0, 0, 0);

const startOfPreviousMonth = new Date(startOfCurrentMonth);
startOfPreviousMonth.setUTCMonth(startOfPreviousMonth.getUTCMonth() - 1);

const { data: currentMonthRevenueRows } = await supabase
  .from("revenue")
  .select("amount")
  .eq("user_id", user.id)
  .eq("status", "paid")
  .gte("paid_at", startOfCurrentMonth.toISOString());

const { data: previousMonthRevenueRows } = await supabase
  .from("revenue")
  .select("amount")
  .eq("user_id", user.id)
  .eq("status", "paid")
  .gte("paid_at", startOfPreviousMonth.toISOString())
  .lt("paid_at", startOfCurrentMonth.toISOString());

const currentMonthRevenue =
  currentMonthRevenueRows?.reduce(
    (total, row) => total + Number(row.amount),
    0
  ) ?? 0;

const previousMonthRevenue =
  previousMonthRevenueRows?.reduce(
    (total, row) => total + Number(row.amount),
    0
  ) ?? 0;

const revenueGrowth =
  previousMonthRevenue === 0
    ? null
    : ((currentMonthRevenue - previousMonthRevenue) /
        previousMonthRevenue) *
      100;

  const { data: todayTasks } = await supabase
  .from("tasks")
  .select("id, title, completed, due_date")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false })
  .limit(4);
return (
    <main className="min-h-screen bg-[#F8F9FA] text-[#111111]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-[#E5E7EB] bg-white md:flex md:flex-col">
          <div className="flex h-20 items-center border-b border-[#E5E7EB] px-6">
            <div className="flex items-center gap-2">
              <img
                src="/kyrenox-logo.svg"
                alt=""
                className="h-7 w-7"
              />
              <span className="text-xl font-medium tracking-tight">
                Kyrenox
              </span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6">
            <p className="px-3 pb-3 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Workspace
            </p>

            <div className="space-y-1">
              <a
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg bg-[#F5F5F5] px-3 py-2.5 text-sm font-medium"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </a>

              <a
                href="/clients"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
              >
                <Users className="h-4 w-4" />
                Clients
              </a>

              <a
                href="/projects"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
              >
                <FolderKanban className="h-4 w-4" />
                Projects
              </a>

              <a
                href="/proposals"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
              >
                <FileText className="h-4 w-4" />
                Proposals
              </a>

              <a
                href="/analytics"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </a>
            </div>

            <p className="px-3 pb-3 pt-8 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
              Tools
            </p>

            <a
              href="/ai"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
            >
              <Sparkles className="h-4 w-4" />
              AI Workspace
            </a>
          </nav>

          <div className="border-t border-[#E5E7EB] p-4">
            <a
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
            >
              <Settings className="h-4 w-4" />
              Settings
            </a>
            <form
  action={async () => {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
    
  }}
  className="mt-2"
>
  <button
    type="submit"
    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#F8F9FA]"
  >
    Log out
  </button>
</form>
          </div>
        </aside>

        {/* Main content */}
        <section className="flex-1">
          <header className="flex h-20 items-center justify-between border-b border-[#E5E7EB] bg-white px-6 md:px-10">
           <MobileSidebar />
            <div>
              <p className="text-sm text-[#6B7280]">Workspace</p>
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>

            <NewMenu />
          </header>

          <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Welcome back.
              </h2>

              <p className="mt-2 text-sm text-[#6B7280]">
                Plan. Create. Automate. Grow.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <p className="text-xs text-[#6B7280]">Revenue</p>
                <p className="mt-2 text-2xl font-semibold">
  €{totalRevenue.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}
</p>
                <p className="mt-1 text-xs text-green-600">
  {revenueGrowth === null
    ? "No data yet"
    : `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth.toFixed(1)}% this month`}
</p>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <p className="text-xs text-[#6B7280]">Active Projects</p>
                <p className="mt-2 text-2xl font-semibold">{activeProjectCount ?? 0}</p>
                <p className="mt-1 text-xs text-green-600">
  +{newProjectsThisWeek ?? 0} this week
</p>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <p className="text-xs text-[#6B7280]">Clients</p>
                <p className="mt-2 text-2xl font-semibold">{clientCount ?? 0}</p>
                <p className="mt-1 text-xs text-green-600">
  +{newClientsThisMonth ?? 0} this month
</p>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <p className="text-xs text-[#6B7280]">Tasks</p>
               <p className="mt-2 text-2xl font-semibold">{openTaskCount ?? 0}</p>
               <p className="mt-1 text-xs text-orange-500">
  {dueTodayCount ?? 0} due today
</p>
              </div>
            </div>

            {/* Content */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Tasks</h3>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      Your current priorities
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <TaskList initialTasks={todayTasks ?? []} />
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h3 className="text-sm font-semibold">Quick Actions</h3>
                <p className="mt-1 text-xs text-[#6B7280]">
                  Start something new
                </p>

                <div className="mt-5 space-y-2">
                  <button className="flex w-full items-center gap-3 rounded-lg border border-[#E5E7EB] px-4 py-3 text-left text-sm hover:bg-[#F8F9FA]">
                    <FolderKanban className="h-4 w-4" />
                    New Project
                  </button>

                  <button className="flex w-full items-center gap-3 rounded-lg border border-[#E5E7EB] px-4 py-3 text-left text-sm hover:bg-[#F8F9FA]">
                    <FileText className="h-4 w-4" />
                    New Proposal
                  </button>

                  <button className="flex w-full items-center gap-3 rounded-lg border border-[#E5E7EB] px-4 py-3 text-left text-sm hover:bg-[#F8F9FA]">
                    <Sparkles className="h-4 w-4" />
                    Open AI Workspace
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}