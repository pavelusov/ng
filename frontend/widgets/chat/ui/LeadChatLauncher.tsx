"use client";

import { useState } from "react";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import { Badge, Button, Tooltip } from "@mui/material";
import { useChatSocket } from "@/widgets/chat/socket/ChatSocketContext";
import { ServiceLeadChatDialog } from "./ServiceLeadChatDialog";

type Props = {
  serviceLeadId: string;
  subtitle?: string;
  chatAvailable: boolean;
  unavailableReason?: string;
  size?: "small" | "medium";
};

export function LeadChatLauncher({
  serviceLeadId,
  subtitle,
  chatAvailable,
  unavailableReason = "Чат недоступен для этой заявки.",
  size = "small",
}: Props) {
  const [open, setOpen] = useState(false);
  const { unreadByLeadId } = useChatSocket();
  const count = unreadByLeadId[serviceLeadId] ?? 0;

  const badge = (
    <Badge color="error" badgeContent={count} max={99} invisible={count === 0}>
      <span>
        <Button
          variant="outlined"
          size={size}
          startIcon={<ChatOutlinedIcon fontSize="small" />}
          disabled={!chatAvailable}
          onClick={() => {
            if (chatAvailable) {
              setOpen(true);
            }
          }}
        >
          Чат
        </Button>
      </span>
    </Badge>
  );

  return (
    <>
      {chatAvailable ? (
        badge
      ) : (
        <Tooltip title={unavailableReason}>
          <span>{badge}</span>
        </Tooltip>
      )}
      {chatAvailable ? (
        <ServiceLeadChatDialog
          open={open}
          onClose={() => setOpen(false)}
          serviceLeadId={serviceLeadId}
          subtitle={subtitle}
        />
      ) : null}
    </>
  );
}
