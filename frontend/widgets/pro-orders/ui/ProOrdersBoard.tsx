"use client";

import { useEffect, useMemo, useState } from "react";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import {
  OrderCard,
  OrderOverviewPanel,
  OrderSearchAndFilters,
  formatOrderDate,
  getOrderStatusLabel,
  type OrderDto,
  type OrderStatus,
  type OrderStatusFilter,
} from "@/entities/order";
import { useChatSocket } from "@/widgets/chat/socket/ChatSocketContext";
import { ChatThreadLinkButton } from "@/widgets/chat/ui/ChatThreadLinkButton";

type Props = {
  initialOrders: OrderDto[];
};

export function ProOrdersBoard({ initialOrders }: Props) {
  const { refreshUnreadByLeads } = useChatSocket();
  const [orders] = useState(initialOrders);
  const [filter, setFilter] = useState<OrderStatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const activeOrdersCount = useMemo(() => orders.filter((order) => order.status === "ACTIVE").length, [orders]);

  const stats = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc.ALL += 1;
        acc[order.status] += 1;
        return acc;
      },
      {
        ALL: 0,
        ACTIVE: 0,
        COMPLETED: 0,
        CANCELLED: 0,
      } satisfies Record<OrderStatusFilter, number>
    );
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return orders.filter((order) => {
      const byStatus = filter === "ALL" ? true : order.status === filter;
      const bySearch = normalizedSearch.length
        ? [order.serviceTitle, order.customerName, order.customerEmail]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalizedSearch))
        : true;
      return byStatus && bySearch;
    });
  }, [filter, orders, search]);

  useEffect(() => {
    const ids = orders.map((order) => order.serviceLeadId);
    if (ids.length === 0) {
      return;
    }
    void refreshUnreadByLeads(ids);
  }, [orders, refreshUnreadByLeads]);

  return (
    <Stack spacing={3}>
      <OrderOverviewPanel
        heading="Активные сделки"
        description="Здесь собраны заказы, которые уже вышли из воронки заявок и перешли в исполнение."
        summaryChipLabel={`${activeOrdersCount} активных`}
        stats={stats}
        selectedFilter={filter}
      />

      <OrderSearchAndFilters
        searchLabel="Поиск по услуге или клиенту"
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
      />

      {orders.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography fontWeight={800} gutterBottom>
            Пока нет заказов
          </Typography>
          <Typography color="text.secondary">
            Когда заявку переведут в заказ, запись появится здесь и будет связана с активным provider.
          </Typography>
        </Paper>
      ) : null}

      <Stack spacing={2}>
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            leftMeta={
              <ChatThreadLinkButton href={`/pro/orders/${order.id}`} serviceLeadId={order.serviceLeadId} label="Открыть" />
            }
            partyChip={
              <Chip
                size="small"
                variant="outlined"
                icon={<PersonOutlineOutlinedIcon />}
                label={
                  order.customerName
                    ? order.customerEmail
                      ? `${order.customerName} · ${order.customerEmail}`
                      : order.customerName
                    : order.customerEmail || "Клиент без имени"
                }
              />
            }
            infoRows={[
              { label: "Дата оформления", value: formatOrderDate(order.createdAt) },
              { label: "Статус исполнения", value: getOrderStatusLabel(order.status) },
            ]}
            infoNote="Заказ сформирован на основании согласованной заявки и сопровождается как отдельная рабочая запись."
          />
        ))}

        {orders.length > 0 && filteredOrders.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography color="text.secondary">
              По текущему фильтру заказов нет. Попробуйте изменить строку поиска или статус.
            </Typography>
          </Paper>
        ) : null}
      </Stack>
    </Stack>
  );
}
