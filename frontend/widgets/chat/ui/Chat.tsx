"use client";

import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { ChatMessageDto } from "@/entities/chat/dto/chat.dto";

export type ChatReplyTarget = {
  messageId: string;
  senderLabel: string;
  bodySnippet: string;
};

export type ChatRenderableRow =
  | { kind: "message"; message: ChatMessageDto }
  | {
      kind: "pending";
      clientMessageId: string;
      body: string;
      replyToPreview?: { senderLabel: string; snippet: string };
    }
  | {
      kind: "failed";
      clientMessageId: string;
      body: string;
      error?: string;
      replyToPreview?: { senderLabel: string; snippet: string };
    };

type Props = {
  rows: ChatRenderableRow[];
  currentUserId: string;
  draft: string;
  onDraftChange: (value: string) => void;
  pendingReply: ChatReplyTarget | null;
  onPendingReplyChange: (next: ChatReplyTarget | null) => void;
  onSend: () => void;
  onRetry: (clientMessageId: string) => void;
  onReplyToMessage: (message: ChatMessageDto) => void;
  disabled?: boolean;
  sending?: boolean;
  loading?: boolean;
};

function ReplyPreviewBlock({
  senderLabel,
  snippet,
}: {
  senderLabel: string;
  snippet: string;
}) {
  return (
    <Box
      sx={{
        pl: 1,
        ml: 0.5,
        borderLeft: 3,
        borderColor: "primary.main",
        py: 0.25,
        mb: 0.75,
      }}
    >
      <Typography variant="caption" color="primary" fontWeight={700} display="block">
        {senderLabel}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {snippet}
      </Typography>
    </Box>
  );
}

function MessageBubble({
  message,
  mine,
  onReply,
}: {
  message: ChatMessageDto;
  mine: boolean;
  onReply: () => void;
}) {
  const align = mine ? "flex-end" : "flex-start";
  const bg = mine ? "secondary.main" : "action.hover";
  const color = mine ? "primary.contrastText" : "text.primary";

  return (
    <Box sx={{ alignSelf: align, maxWidth: "min(100%, 420px)", width: "100%" }}>
      <Paper
        elevation={0}
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: bg,
          color,
          borderRadius: 0.5,
        }}
      >
        {message.repliedTo ? (
          <ReplyPreviewBlock
            senderLabel={message.repliedTo.senderName ?? "Участник"}
            snippet={message.repliedTo.bodySnippet}
          />
        ) : null}
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {message.body}
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mt: 0.75 }}>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            {message.senderName ?? "Без имени"} ·{" "}
            {new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.createdAt))}
          </Typography>
          <IconButton size="small" onClick={onReply} aria-label="Ответить" sx={{ color: "inherit" }}>
            <ReplyOutlinedIcon fontSize="inherit" />
          </IconButton>
        </Stack>
      </Paper>
    </Box>
  );
}

export function Chat({
  rows,
  currentUserId,
  draft,
  onDraftChange,
  pendingReply,
  onPendingReplyChange,
  onSend,
  onRetry,
  onReplyToMessage,
  disabled,
  sending,
  loading,
}: Props) {
  return (
    <Stack spacing={1.5} sx={{ height: "100%", minHeight: 360 }}>
      <Box
        sx={{
          flex: 1,
          minHeight: 200,
          overflow: "auto",
          px: 0.5,
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
        }}
      >
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : null}
        {!loading && rows.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            Сообщений пока нет. Напишите первое.
          </Typography>
        ) : null}
        {rows.map((row) => {
          if (row.kind === "message") {
            const mine = row.message.senderUserId === currentUserId;
            return (
              <MessageBubble
                key={row.message.id}
                message={row.message}
                mine={mine}
                onReply={() =>
                  onReplyToMessage(row.message)
                }
              />
            );
          }
          if (row.kind === "pending") {
            return (
              <Box key={`p-${row.clientMessageId}`} sx={{ alignSelf: "flex-end", maxWidth: "min(100%, 420px)" }}>
                <Paper variant="outlined" sx={{ px: 1.5, py: 1, borderStyle: "dashed" }}>
                  {row.replyToPreview ? (
                    <ReplyPreviewBlock senderLabel={row.replyToPreview.senderLabel} snippet={row.replyToPreview.snippet} />
                  ) : null}
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {row.body}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="text.secondary">
                      Отправка…
                    </Typography>
                  </Stack>
                </Paper>
              </Box>
            );
          }
          return (
            <Box key={`f-${row.clientMessageId}`} sx={{ alignSelf: "flex-end", maxWidth: "min(100%, 420px)" }}>
              <Paper variant="outlined" sx={{ px: 1.5, py: 1, borderColor: "error.light" }}>
                {row.replyToPreview ? (
                  <ReplyPreviewBlock senderLabel={row.replyToPreview.senderLabel} snippet={row.replyToPreview.snippet} />
                ) : null}
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {row.body}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                  <ErrorOutlineIcon color="error" fontSize="small" />
                  <Typography variant="caption" color="error">
                    {row.error ?? "Не удалось отправить"}
                  </Typography>
                  <Button size="small" variant="outlined" color="inherit" onClick={() => onRetry(row.clientMessageId)}>
                    Повторить
                  </Button>
                </Stack>
              </Paper>
            </Box>
          );
        })}
      </Box>

      <Divider />

      {pendingReply ? (
        <Paper variant="outlined" sx={{ px: 1.5, py: 1 }}>
          <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Ответ на
              </Typography>
              <Typography variant="body2" fontWeight={600} noWrap>
                {pendingReply.senderLabel}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", wordBreak: "break-word" }}>
                {pendingReply.bodySnippet}
              </Typography>
            </Box>
            <IconButton size="small" aria-label="Отменить ответ" onClick={() => onPendingReplyChange(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Paper>
      ) : null}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "flex-end" }}>
        <TextField
          label="Сообщение"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <Button variant="contained" disabled={disabled || sending} onClick={onSend} sx={{ flexShrink: 0 }}>
          {sending ? "…" : "Отправить"}
        </Button>
      </Stack>
    </Stack>
  );
}
