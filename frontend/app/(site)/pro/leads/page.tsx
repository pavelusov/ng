import { notFound, redirect } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import type { ServiceLeadDto } from "@/entities/service-lead";
import { BackendApiError, fetchBackendJsonAsUser } from "@/lib/backend-api";
import { getServerAuthSession } from "@/lib/auth";
import { ProLeadsBoard } from "@/widgets/pro-leads/ui/ProLeadsBoard";

export default async function ProLeadsPage() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  if ((session.user.memberships?.length ?? 0) === 0) {
    notFound();
  }

  let leads: ServiceLeadDto[];

  try {
    leads = await fetchBackendJsonAsUser<ServiceLeadDto[]>("/admin/service-leads", session.user.id);
  } catch (error) {
    if (error instanceof BackendApiError && (error.status === 401 || error.status === 403)) {
      notFound();
    }
    throw error;
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Заявки
        </Typography>
        <Typography color="text.secondary">
          Рабочая воронка первых откликов клиентов по опубликованным услугам provider.
        </Typography>
      </Box>

      <ProLeadsBoard initialLeads={leads} />
    </Stack>
  );
}
