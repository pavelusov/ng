import { notFound, redirect } from "next/navigation";
import { Box, Paper, Stack, Typography } from "@mui/material";
import type { ServiceLeadDto } from "@/entities/service-lead";
import { BackendApiError, fetchBackendJsonAsUser } from "@/lib/backend-api";
import { getServerAuthSession } from "@/lib/auth";
import { ServiceLeadChatPanel } from "@/widgets/chat/ui/ServiceLeadChatPanel";
import { ChatThreeColumnLayout } from "@/widgets/chat/ui/ChatThreeColumnLayout";
import { ProfileSidebarNav } from "@/widgets/profile/ui/ProfileSidebarNav";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CustomerLeadDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  let lead: ServiceLeadDto;
  try {
    lead = await fetchBackendJsonAsUser<ServiceLeadDto>(`/service-leads/mine/${id}`, session.user.id);
  } catch (error) {
    if (error instanceof BackendApiError && (error.status === 401 || error.status === 403 || error.status === 404)) {
      notFound();
    }
    throw error;
  }

  return (
    <main>
      <ChatThreeColumnLayout
        left={<ProfileSidebarNav selected="leads" />}
        middle={
          <Stack spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Заявка
              </Typography>
              <Typography color="text.secondary">{lead.serviceTitle}</Typography>
            </Box>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Stack spacing={1}>
                <Typography fontWeight={800}>Детали</Typography>
                <Typography color="text.secondary">Статус: {lead.status}</Typography>
                {lead.message ? <Typography color="text.secondary">Сообщение: {lead.message}</Typography> : null}
              </Stack>
            </Paper>
          </Stack>
        }
        right={<ServiceLeadChatPanel serviceLeadId={lead.id} title="Чат" subtitle={lead.serviceTitle} />}
      />
    </main>
  );
}

