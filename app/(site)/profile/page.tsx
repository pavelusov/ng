"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Container,
  Divider,
  Paper,
  Skeleton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import { useAppSelector } from "@/core/store/hooks";

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      sx={{ py: 3 }}
    >
      {value === index && children}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `profile-tab-${index}`,
    "aria-controls": `profile-tabpanel-${index}`,
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { status, user } = useAppSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (status === "unknown" || status === "unauthenticated") {
    return (
      <Container maxWidth="md" sx={{ py: 4, pt: 14, pb: 10 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
            <Skeleton variant="circular" width={100} height={100} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="30%" />
            </Box>
          </Box>
          <Skeleton variant="rectangular" height={200} />
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, pt: 14, pb: 10 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: "flex", gap: 3, mb: 4, alignItems: "center" }}>
          <Avatar
            src={user?.image || undefined}
            sx={{
              width: 100,
              height: 100,
              bgcolor: "primary.main",
              fontSize: 40,
              fontWeight: 600,
            }}
          >
            {getInitials(user?.name) || user?.email?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              {user?.name || "Пользователь"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
              <EmailIcon fontSize="small" />
              <Typography variant="body1">{user?.email || "Email не указан"}</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="Вкладки профиля"
            variant="fullWidth"
          >
            <Tab label="Текущие заказы" {...a11yProps(0)} />
            <Tab label="Завершённые" {...a11yProps(1)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
            <Typography variant="h6" gutterBottom>
              У вас пока нет активных заказов
            </Typography>
            <Typography variant="body2">
              Здесь будут отображаться ваши текущие заказы и услуги
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
            <Typography variant="h6" gutterBottom>
              История заказов пуста
            </Typography>
            <Typography variant="body2">
              Завершённые заказы будут отображаться здесь
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
}
