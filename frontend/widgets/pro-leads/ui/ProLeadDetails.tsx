"use client";

import { useMemo, useState } from "react";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import { Alert, Button, Chip, Stack, Typography } from "@mui/material";
import {
  ServiceLeadCard,
  formatServiceLeadDate,
  getServiceLeadStatusLabel,
  type ServiceLeadDto,
  type ServiceLeadStatus,
} from "@/entities/service-lead";

type Props = {
  initialLead: ServiceLeadDto;
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

export function ProLeadDetails({ initialLead }: Props) {
  const [lead, setLead] = useState(initialLead);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const nextActions = useMemo(() => getNextActions(lead.status), [lead.status]);

  async function patchStatus(status: ServiceLeadStatus) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/pro/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | ServiceLeadDto | null;
      if (!response.ok) {
        throw new Error(
          payload && typeof payload === "object" && "error" in payload
            ? payload.error ?? "Не удалось обновить статус заявки"
            : "Не удалось обновить статус заявки",
        );
      }

      setLead(payload as ServiceLeadDto);
      setNotice(
        status === "IN_PROGRESS"
          ? "Заявка взята в работу."
          : status === "CONVERTED_TO_ORDER"
            ? "Заявка переведена в заказ."
            : "Заявка закрыта.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось обновить статус заявки");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack spacing={2}>
      {notice ? <Alert severity="success">{notice}</Alert> : null}
      {error ? <Alert severity="error">{error}</Alert> : null}

      <ServiceLeadCard
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
          nextActions.length > 0 ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {nextActions.map((action) => (
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
                  disabled={busy}
                  onClick={() => void patchStatus(action.status)}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          ) : null
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
    </Stack>
  );
}

