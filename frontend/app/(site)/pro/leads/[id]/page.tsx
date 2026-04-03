import { notFound, redirect } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import type { ServiceLeadDto } from "@/entities/service-lead";
import { BackendApiError, fetchBackendJsonAsUser } from "@/lib/backend-api";
import { getServerAuthSession } from "@/lib/auth";
import { ChatBodyWithSidePanelLayout } from "@/widgets/chat/ui/ChatBodyWithSidePanelLayout";
import { ServiceLeadChatPanel } from "@/widgets/chat/ui/ServiceLeadChatPanel";
import { ProLeadDetails } from "@/widgets/pro-leads/ui/ProLeadDetails";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProLeadDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  if ((session.user.memberships?.length ?? 0) === 0) {
    notFound();
  }

  let lead: ServiceLeadDto;
  try {
    lead = await fetchBackendJsonAsUser<ServiceLeadDto>(`/pro/service-leads/${id}`, session.user.id);
  } catch (error) {
    if (error instanceof BackendApiError && (error.status === 401 || error.status === 403 || error.status === 404)) {
      notFound();
    }
    throw error;
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Заявка
        </Typography>
        <Typography color="text.secondary">{lead.serviceTitle}</Typography>
      </Box>

      <ChatBodyWithSidePanelLayout
        middle={<ProLeadDetails initialLead={lead} />}
        right={
          lead.customerUserId ? (
            <ServiceLeadChatPanel serviceLeadId={lead.id} title="Чат" subtitle={lead.serviceTitle} />
          ) : (
            <Box>
              <Typography color="text.secondary">Чат будет доступен после привязки заявки к аккаунту клиента.</Typography>
            </Box>
          )
        }
      />
    </Stack>
  );
}

