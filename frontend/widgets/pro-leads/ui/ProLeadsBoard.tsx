"use client";

import { useEffect, useMemo, useState } from "react";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  ServiceLeadCard,
  ServiceLeadOverviewPanel,
  ServiceLeadSearchAndFilters,
  formatServiceLeadDate,
  getServiceLeadStatusLabel,
  type ServiceLeadDto,
  type ServiceLeadStatus,
  type ServiceLeadStatusFilter,
} from "@/entities/service-lead";
import { useChatSocket } from "@/widgets/chat/socket/ChatSocketContext";
import { ChatThreadLinkButton } from "@/widgets/chat/ui/ChatThreadLinkButton";

type Props = {
  initialLeads: ServiceLeadDto[];
};

function getNextActions(status: ServiceLeadStatus): Array<{ status: ServiceLeadStatus; label: string }> {
  if (status === "NEW") {
    return [
      { status: "IN_PROGRESS", label: "Взять в работу" },
      { status: "CLOSED", label: "Закрыть" },
    ];
  }

  if (status === "IN_PROGRESS") {
    return [
      { status: "CONVERTED_TO_ORDER", label: "Перевести в заказ" },
      { status: "CLOSED", label: "Закрыть" },
    ];
  }

  return [];
}

export function ProLeadsBoard({ initialLeads }: Props) {
  const { refreshUnreadByLeads } = useChatSocket();
  const [leads, setLeads] = useState(initialLeads);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ServiceLeadStatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const openLeadsCount = useMemo(
    () => leads.filter((lead) => lead.status === "NEW" || lead.status === "IN_PROGRESS").length,
    [leads]
  );

  const stats = useMemo(() => {
    return leads.reduce(
      (acc, lead) => {
        acc.ALL += 1;
        acc[lead.status] += 1;
        return acc;
      },
      {
        ALL: 0,
        NEW: 0,
        IN_PROGRESS: 0,
        CONVERTED_TO_ORDER: 0,
        CLOSED: 0,
      } satisfies Record<ServiceLeadStatusFilter, number>
    );
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const byStatus = filter === "ALL" ? true : lead.status === filter;
      const bySearch = normalizedSearch.length
        ? [
            lead.serviceTitle,
            lead.customerName,
            lead.customerEmail,
            lead.customerPhone,
            lead.message,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalizedSearch))
        : true;
      return byStatus && bySearch;
    });
  }, [filter, leads, search]);

  useEffect(() => {
    const ids = leads.filter((lead) => lead.customerUserId).map((lead) => lead.id);
    if (ids.length === 0) {
      return;
    }
    void refreshUnreadByLeads(ids);
  }, [leads, refreshUnreadByLeads]);

  async function patchStatus(lead: ServiceLeadDto, status: ServiceLeadStatus) {
    setBusyId(lead.id);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/pro/leads/${lead.id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | ServiceLeadDto | null;

      if (!response.ok) {
        throw new Error(
          payload && typeof payload === "object" && "error" in payload
            ? payload.error ?? "Не удалось обновить статус заявки"
            : "Не удалось обновить статус заявки"
        );
      }

      setLeads((current) => current.map((item) => (item.id === lead.id ? (payload as ServiceLeadDto) : item)));
      setNotice(
        status === "IN_PROGRESS"
          ? "Заявка взята в работу."
          : status === "CONVERTED_TO_ORDER"
            ? "Заявка переведена в заказ."
            : "Заявка закрыта."
      );
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Не удалось обновить статус заявки");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Stack spacing={3}>
      <ServiceLeadOverviewPanel
        heading="Воронка заявок"
        description="Это входящие отклики клиентов до оформления сделки. Здесь вы берете лиды в работу, согласуете детали и только потом переводите их в заказ."
        summaryChipLabel={`${openLeadsCount} в обработке`}
        stats={stats}
        selectedFilter={filter}
      />

      <ServiceLeadSearchAndFilters
        searchLabel="Поиск по услуге, контакту или сообщению"
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
      />

      {notice ? <Alert severity="success">{notice}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      {leads.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography fontWeight={800} gutterBottom>
            Пока нет входящих заявок
          </Typography>
          <Typography color="text.secondary">
            Заявки начнут появляться здесь после откликов клиентов на опубликованные услуги.
          </Typography>
        </Paper>
      ) : null}

      <Stack spacing={2}>
        {filteredLeads.map((lead) => {
          const nextActions = getNextActions(lead.status);

          return (
            <ServiceLeadCard
              key={lead.id}
              lead={lead}
              topLabel="Лид"
              primaryMeta={
                <>
                  <Typography color="text.secondary">
                    {lead.customerName || "Имя не указано"}
                    {lead.customerEmail ? ` · ${lead.customerEmail}` : ""}
                    {lead.customerPhone ? ` · ${lead.customerPhone}` : ""}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Создано: {formatServiceLeadDate(lead.createdAt)}
                  </Typography>
                </>
              }
              rightActions={
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                  {nextActions.length > 0
                    ? nextActions.map((action) => (
                        <Button
                          key={action.status}
                          variant={action.status === "IN_PROGRESS" ? "contained" : "outlined"}
                          color={
                            action.status === "CLOSED"
                              ? "inherit"
                              : action.status === "CONVERTED_TO_ORDER"
                                ? "success"
                                : "primary"
                          }
                          size="small"
                          disabled={busyId === lead.id}
                          onClick={() => patchStatus(lead, action.status)}
                        >
                          {action.label}
                        </Button>
                      ))
                    : null}
                  <ChatThreadLinkButton
                    href={`/pro/leads/${lead.id}`}
                    serviceLeadId={lead.id}
                    label="Открыть"
                    tooltip={
                      lead.customerUserId
                        ? undefined
                        : "Чат будет доступен после привязки заявки к аккаунту клиента."
                    }
                    disabled={false}
                  />
                </Stack>
              }
              infoText={`Этап воронки: ${getServiceLeadStatusLabel(lead.status)}.${
                lead.status === "CONVERTED_TO_ORDER"
                  ? " Лид уже успешно переведен в заказ."
                  : lead.status === "IN_PROGRESS"
                    ? " Клиент в активной обработке и согласовании."
                    : lead.status === "CLOSED"
                      ? " Работа по этому лиду завершена без сделки."
                      : " Это новый входящий отклик, который еще не взят в работу."
              }`}
              bottomContent={
                <>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={<PersonSearchOutlinedIcon />}
                      label={lead.customerName || lead.customerEmail || lead.customerPhone || "Клиент без контакта"}
                    />
                  </Stack>

                  {lead.message ? (
                    <Typography color="text.secondary">{lead.message}</Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Клиент не оставил сообщение.
                    </Typography>
                  )}
                </>
              }
            />
          );
        })}

        {leads.length > 0 && filteredLeads.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box>
                <Typography fontWeight={700} gutterBottom>
                  По текущему фильтру заявок нет
                </Typography>
                <Typography color="text.secondary">
                  Попробуйте сменить статус или строку поиска, чтобы увидеть другие заявки воронки.
                </Typography>
              </Box>

              <Box>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFilter("ALL");
                    setSearch("");
                  }}
                >
                  Сбросить фильтры
                </Button>
              </Box>
            </Stack>
          </Paper>
        ) : null}
      </Stack>
    </Stack>
  );
}
