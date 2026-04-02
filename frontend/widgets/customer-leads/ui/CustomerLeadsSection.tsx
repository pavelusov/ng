"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import {
  SERVICE_LEADS_PROFILE_URL,
  ServiceLeadCard,
  ServiceLeadOverviewPanel,
  ServiceLeadSearchAndFilters,
  clearPendingServiceLeadDraft,
  formatServiceLeadDate,
  getServiceLeadStatusLabel,
  isPendingServiceLeadSubmitting,
  markPendingServiceLeadFailed,
  markPendingServiceLeadSubmitting,
  readPendingServiceLeadDraft,
  type ServiceLeadDto,
  type ServiceLeadStatus,
  type ServiceLeadStatusFilter,
  type PendingServiceLeadDraft,
} from "@/entities/service-lead";

type Props = {
  autoResumeEnabled: boolean;
  noticeKey?: string | null;
  resumeState?: string | null;
};

function noticeFromKey(value?: string | null) {
  if (value === "lead-created") {
    return "Заявка зарегистрирована и появилась в вашем списке.";
  }

  return null;
}

export function CustomerLeadsSection({ autoResumeEnabled, noticeKey, resumeState }: Props) {
  const router = useRouter();
  const didAttemptAutoResume = useRef(false);
  const [leads, setLeads] = useState<ServiceLeadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(() => noticeFromKey(noticeKey));
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeBusy, setResumeBusy] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<PendingServiceLeadDraft | null>(() => readPendingServiceLeadDraft());
  const [filter, setFilter] = useState<ServiceLeadStatusFilter>("ALL");
  const [search, setSearch] = useState("");

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
        ? [lead.serviceTitle, lead.message]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalizedSearch))
        : true;
      return byStatus && bySearch;
    });
  }, [filter, leads, search]);

  async function loadLeads() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile/leads", {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as ServiceLeadDto[] | { error?: string } | null;

      if (!response.ok) {
        throw new Error(
          payload && typeof payload === "object" && !Array.isArray(payload) && payload.error
            ? payload.error
            : "Не удалось загрузить заявки"
        );
      }

      setLeads(payload as ServiceLeadDto[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLeads();
  }, []);

  useEffect(() => {
    setNotice(noticeFromKey(noticeKey));
  }, [noticeKey]);

  useEffect(() => {
    if (resumeState === "failed") {
      const draft = readPendingServiceLeadDraft();
      setPendingDraft(draft);
      setResumeError(draft?.lastError ?? "Не удалось завершить отправку заявки. Попробуйте еще раз.");
      return;
    }

    setResumeError(null);
  }, [resumeState]);

  async function resumePendingLead(forceRetry = false) {
    const draft = readPendingServiceLeadDraft();
    setPendingDraft(draft);
    setResumeBusy(true);
    setError(null);
    setResumeError(null);
    setNotice(null);

    if (!draft) {
      router.replace(SERVICE_LEADS_PROFILE_URL);
      setResumeBusy(false);
      return;
    }

    if (!forceRetry && isPendingServiceLeadSubmitting(draft)) {
      setResumeError("Заявка уже отправляется. Если список не обновился, попробуйте повторить.");
      setResumeBusy(false);
      return;
    }

    markPendingServiceLeadSubmitting();
    setPendingDraft(readPendingServiceLeadDraft());

    try {
      const response = await fetch(`/api/services/${draft.serviceId}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          customerName: draft.customerName,
          customerEmail: draft.customerEmail,
          customerPhone: draft.customerPhone,
          message: draft.message,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | ServiceLeadDto | null;

      if (!response.ok) {
        throw new Error(
          payload && typeof payload === "object" && "error" in payload
            ? payload.error ?? "Не удалось зарегистрировать заявку"
            : "Не удалось зарегистрировать заявку"
        );
      }

      clearPendingServiceLeadDraft();
      setPendingDraft(null);
      setNotice("Заявка зарегистрирована и появилась в вашем списке.");
      await loadLeads();
      router.replace("/profile?section=leads&notice=lead-created");
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Не удалось зарегистрировать заявку";
      markPendingServiceLeadFailed(message);
      setPendingDraft(readPendingServiceLeadDraft());
      setResumeError(message);
      router.replace("/profile?section=leads&resume=failed");
    } finally {
      setResumeBusy(false);
    }
  }

  useEffect(() => {
    if (!autoResumeEnabled || didAttemptAutoResume.current) {
      return;
    }

    didAttemptAutoResume.current = true;
    void resumePendingLead();
  }, [autoResumeEnabled]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Заявки
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Здесь отображаются ваши отклики по услугам. После отправки заявки provider увидит ее в
          своем профессиональном кабинете.
        </Typography>
      </Box>

      <ServiceLeadOverviewPanel
        heading="Воронка откликов"
        description="Это еще не заказ, а ваш отклик по услуге. Дальше заявка проходит согласование и только потом становится сделкой."
        summaryChipLabel={`${leads.length} откликов`}
        stats={stats}
        selectedFilter={filter}
      />

      <ServiceLeadSearchAndFilters
        searchLabel="Поиск по услуге или сообщению"
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
      />

      {notice ? <Alert severity="success">{notice}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {resumeError ? (
        <Alert
          severity="warning"
          action={
            pendingDraft ? (
              <Button color="inherit" size="small" onClick={() => void resumePendingLead(true)} disabled={resumeBusy}>
                Повторить
              </Button>
            ) : null
          }
        >
          {resumeError}
        </Alert>
      ) : null}

      {loading ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="text.secondary">Загрузка заявок...</Typography>
        </Paper>
      ) : null}

      {!loading && leads.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography fontWeight={800} gutterBottom>
            У вас пока нет заявок
          </Typography>
          <Typography color="text.secondary">
            Когда вы откликнетесь на услугу, заявка появится здесь и будет доступна для отслеживания.
          </Typography>
        </Paper>
      ) : null}

      {!loading ? (
        <Stack spacing={2}>
          {filteredLeads.map((lead) => (
            <ServiceLeadCard
              key={lead.id}
              lead={lead}
              topLabel="Заявка"
              primaryMeta={
                <Typography variant="body2" color="text.secondary">
                  Отправлено: {formatServiceLeadDate(lead.createdAt)}
                </Typography>
              }
              infoText={`Статус отклика: ${getServiceLeadStatusLabel(lead.status)}.${
                lead.status === "CONVERTED_TO_ORDER"
                  ? " Provider уже перевел его в рабочий заказ."
                  : lead.status === "IN_PROGRESS"
                    ? " Provider рассматривает детали и согласовывает следующий шаг."
                    : lead.status === "CLOSED"
                      ? " Диалог по этой заявке завершен без оформления заказа."
                      : " Отклик зарегистрирован и ожидает реакции provider."
              }`}
              bottomContent={
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={<ChatBubbleOutlineOutlinedIcon />}
                      label={lead.message ? "Есть сообщение" : "Без сообщения"}
                    />
                  </Stack>

                  {lead.message ? <Typography color="text.secondary">{lead.message}</Typography> : null}
                </Stack>
              }
            />
          ))}

          {leads.length > 0 && filteredLeads.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography fontWeight={700} gutterBottom>
                    По текущему фильтру заявок нет
                  </Typography>
                  <Typography color="text.secondary">
                    Попробуйте изменить строку поиска или статусный фильтр.
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
      ) : null}
    </Stack>
  );
}
