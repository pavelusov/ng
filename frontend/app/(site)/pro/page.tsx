import { notFound, redirect } from "next/navigation";
import { Stack } from "@mui/material";
import { getActiveMembership } from "@/core/auth/authorization";
import type { OrderDto } from "@/entities/order";
import type { ServiceLeadDto } from "@/entities/service-lead";
import type { ServiceDto } from "@/entities/service";
import { BackendApiError, fetchBackendJsonAsUser } from "@/lib/backend-api";
import { getServerAuthSession } from "@/lib/auth";
import { ProOverviewDashboard } from "@/widgets/pro-dashboard/ui/ProOverviewDashboard";
import { ProfessionalWorkspacePanel } from "@/widgets/pro-dashboard/ui/ProfessionalWorkspacePanel";

export default async function ProDashboardPage() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const activeMembership = getActiveMembership(session.user);

  if (!activeMembership) {
    return (
      <Stack spacing={3}>
        <ProfessionalWorkspacePanel />
      </Stack>
    );
  }

  try {
    const [services, leads, orders] = await Promise.all([
      fetchBackendJsonAsUser<ServiceDto[]>("/admin/services", session.user.id),
      fetchBackendJsonAsUser<ServiceLeadDto[]>("/admin/service-leads", session.user.id),
      fetchBackendJsonAsUser<OrderDto[]>("/admin/orders", session.user.id),
    ]);

    const sortByRecent = <T extends { updatedAt: string; createdAt?: string }>(items: T[]) =>
      [...items].sort((left, right) => {
        const leftValue = new Date(left.updatedAt ?? left.createdAt).getTime();
        const rightValue = new Date(right.updatedAt ?? right.createdAt).getTime();
        return rightValue - leftValue;
      });

    return (
      <Stack spacing={3}>
        <ProOverviewDashboard
          provider={activeMembership}
          services={services}
          leads={sortByRecent(leads)}
          orders={sortByRecent(orders)}
        />
      </Stack>
    );
  } catch (error) {
    if (error instanceof BackendApiError && (error.status === 401 || error.status === 403)) {
      notFound();
    }

    throw error;
  }
}
