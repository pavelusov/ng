import { notFound, redirect } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import type { OrderDto } from "@/entities/order";
import { BackendApiError, fetchBackendJsonAsUser } from "@/lib/backend-api";
import { getServerAuthSession } from "@/lib/auth";
import { ProClientsBoard } from "@/widgets/pro-clients/ui/ProClientsBoard";

function sortOrdersByCreatedAtDesc(orders: OrderDto[]) {
  return [...orders].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export default async function ProClientsPage() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  if ((session.user.memberships?.length ?? 0) === 0) {
    notFound();
  }

  let orders: OrderDto[];

  try {
    orders = await fetchBackendJsonAsUser<OrderDto[]>("/admin/orders", session.user.id);
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
          Клиенты
        </Typography>
        <Typography color="text.secondary">
          Уникальные заказчики активного provider, собранные из всех заказов независимо от их статуса.
        </Typography>
      </Box>

      <ProClientsBoard initialOrders={sortOrdersByCreatedAtDesc(orders)} />
    </Stack>
  );
}
