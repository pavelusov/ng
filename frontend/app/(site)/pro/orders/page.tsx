import { notFound, redirect } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import type { OrderDto } from "@/entities/order";
import { BackendApiError, fetchBackendJsonAsUser } from "@/lib/backend-api";
import { getServerAuthSession } from "@/lib/auth";
import { ProOrdersBoard } from "@/widgets/pro-orders/ui/ProOrdersBoard";

export default async function ProOrdersPage() {
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
          Заказы
        </Typography>
        <Typography color="text.secondary">
          Список заказов, созданных из заявок по услугам активного provider.
        </Typography>
      </Box>

      <ProOrdersBoard initialOrders={orders} />
    </Stack>
  );
}
