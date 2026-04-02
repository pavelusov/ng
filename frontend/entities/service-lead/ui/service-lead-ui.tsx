"use client";

import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import { Box, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import type { ServiceLeadDto, ServiceLeadStatus } from "../dto/service-lead.dto";

export type ServiceLeadStatusFilter = "ALL" | ServiceLeadStatus;

export function getServiceLeadStatusLabel(status: ServiceLeadStatus) {
  if (status === "IN_PROGRESS") return "На согласовании";
  if (status === "CONVERTED_TO_ORDER") return "Передана в работу";
  if (status === "CLOSED") return "Закрыта";
  return "Новая";
}

export function getServiceLeadStatusColor(
  status: ServiceLeadStatus,
): "default" | "info" | "success" | "primary" {
  if (status === "IN_PROGRESS") return "info";
  if (status === "CONVERTED_TO_ORDER") return "success";
  if (status === "CLOSED") return "default";
  return "primary";
}

export function formatServiceLeadDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getServiceLeadCardAccentColor(status: ServiceLeadStatus) {
  if (status === "CONVERTED_TO_ORDER") return "success.main";
  if (status === "CLOSED") return "text.disabled";
  return "primary.main";
}

type ServiceLeadOverviewPanelProps = {
  heading: string;
  description: string;
  summaryChipLabel: string;
  stats: Record<ServiceLeadStatusFilter, number>;
  selectedFilter: ServiceLeadStatusFilter;
};

export function ServiceLeadOverviewPanel({
  heading,
  description,
  summaryChipLabel,
  stats,
  selectedFilter,
}: ServiceLeadOverviewPanelProps) {
  return (
    <Paper
      variant="outlined"
      sx={(theme) => ({
        p: 2.5,
        borderColor: "primary.main",
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(180deg, ${theme.palette.primary.main}1F 0%, rgba(15,18,14,0) 100%)`
            : `linear-gradient(180deg, ${theme.palette.primary.main}14 0%, rgba(255,255,255,0.92) 100%)`,
      })}
    >
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                flexShrink: 0,
              }}
            >
              <TimelineOutlinedIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {heading}
              </Typography>
              <Typography color="text.secondary">{description}</Typography>
            </Box>
          </Stack>
          <Chip label={summaryChipLabel} color="primary" variant="filled" />
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          {([
            ["ALL", "Всего"],
            ["NEW", "Новые"],
            ["IN_PROGRESS", "На согласовании"],
            ["CONVERTED_TO_ORDER", "В работе"],
            ["CLOSED", "Закрытые"],
          ] as const).map(([status, label]) => (
            <Paper
              key={status}
              variant="outlined"
              sx={{ p: 1.5, flex: 1, minWidth: 0, borderColor: selectedFilter === status ? "primary.main" : "divider" }}
            >
              <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: "0.06em" }}>
                {label}
              </Typography>
              <Typography variant="h5" fontWeight={800}>
                {stats[status]}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}

type ServiceLeadSearchAndFiltersProps = {
  searchLabel: string;
  search: string;
  onSearchChange: (value: string) => void;
  filter: ServiceLeadStatusFilter;
  onFilterChange: (filter: ServiceLeadStatusFilter) => void;
};

export function ServiceLeadSearchAndFilters({
  searchLabel,
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: ServiceLeadSearchAndFiltersProps) {
  return (
    <Stack spacing={2}>
      <TextField
        label={searchLabel}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        fullWidth
      />

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {(["ALL", "NEW", "IN_PROGRESS", "CONVERTED_TO_ORDER", "CLOSED"] as const).map((status) => (
          <Chip
            key={status}
            label={
              status === "ALL"
                ? "Все"
                : status === "NEW"
                  ? "Новые"
                  : status === "IN_PROGRESS"
                    ? "На согласовании"
                    : status === "CONVERTED_TO_ORDER"
                      ? "В работе"
                      : "Закрытые"
            }
            color={filter === status ? "primary" : "default"}
            variant={filter === status ? "filled" : "outlined"}
            onClick={() => onFilterChange(status)}
          />
        ))}
      </Stack>
    </Stack>
  );
}

type ServiceLeadCardProps = {
  lead: ServiceLeadDto;
  topLabel?: string;
  primaryMeta?: ReactNode;
  rightActions?: ReactNode;
  infoText: string;
  infoPanelSx?: SxProps<Theme>;
  bottomContent?: ReactNode;
};

export function ServiceLeadCard({
  lead,
  topLabel = "Заявка",
  primaryMeta,
  rightActions,
  infoText,
  infoPanelSx,
  bottomContent,
}: ServiceLeadCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderLeft: 4,
        borderLeftColor: getServiceLeadCardAccentColor(lead.status),
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ md: "flex-start" }}
      >
        <Stack spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
          <Box>
            <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: "0.08em" }}>
              {topLabel}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="h6" fontWeight={700}>
                {lead.serviceTitle}
              </Typography>
              <Chip
                size="small"
                label={getServiceLeadStatusLabel(lead.status)}
                color={getServiceLeadStatusColor(lead.status)}
                variant={lead.status === "CLOSED" ? "outlined" : "filled"}
              />
            </Stack>
            {primaryMeta}
          </Box>

          {bottomContent}
        </Stack>

        <Stack spacing={1.25} sx={{ width: { xs: "100%", md: 360 }, flexShrink: 1 }}>
          {rightActions}

          <Box
            sx={[
              {
                px: 1.5,
                py: 1.25,
                // borderRadius: 2,
                bgcolor: "action.hover",
                height: "100%",
              },
              ...(Array.isArray(infoPanelSx) ? infoPanelSx : infoPanelSx ? [infoPanelSx] : []),
            ]}
          >
            <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: "0.08em" }}>
              Сведения по заявке
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {infoText}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}
