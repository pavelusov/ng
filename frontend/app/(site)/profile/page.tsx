"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import { useAppSelector } from "@/core/store/hooks";
import type { AuthMembership } from "@/core/auth/authorization";

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

interface TabPanelProps {
  children?: ReactNode;
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

type ProviderMemberRecord = {
  id: string;
  role: "OWNER" | "MANAGER";
  status: "INVITED" | "ACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
};

type ProviderMembersResponse = {
  id: string;
  name: string;
  slug: string;
  type: "SELF_EMPLOYED" | "COMPANY";
  members: ProviderMemberRecord[];
};

function providerTypeLabel(type: AuthMembership["providerType"]) {
  return type === "SELF_EMPLOYED" ? "самозанятый / физлицо" : "компания / организация";
}

function providerRoleLabel(role: AuthMembership["role"] | ProviderMemberRecord["role"]) {
  return role === "OWNER" ? "владелец" : "менеджер";
}

type ProfileSection = "profile" | "orders" | "professionals";

interface ProfileSidebarProps {
  selectedSection: ProfileSection;
  onSelectSection: (section: ProfileSection) => void;
  hasProfessionalProfile: boolean;
}

function ProfileSidebar({
  selectedSection,
  onSelectSection,
  hasProfessionalProfile,
}: ProfileSidebarProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        overflow: "hidden",
        borderColor: "divider",
        position: { md: "sticky" },
        top: { md: 112 },
      }}
    >
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: "0.08em" }}>
          Профиль
        </Typography>
      </Box>

      <Divider />

      <List dense disablePadding>
        <ListItemButton
          selected={selectedSection === "orders"}
          sx={{
            px: 2.5,
            py: 1.5,
            "&.Mui-selected": {
              bgcolor: "action.selected",
              "&:hover": { bgcolor: "action.selected" },
            },
          }}
          onClick={() => onSelectSection("orders")}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <ReceiptLongOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Заказы"
            secondary="Текущие и завершённые"
            primaryTypographyProps={{ fontWeight: selectedSection === "orders" ? 700 : 600 }}
          />
        </ListItemButton>
        <ListItemButton
          selected={selectedSection === "profile"}
          sx={{
            px: 2.5,
            py: 1.5,
            "&.Mui-selected": {
              bgcolor: "action.selected",
              "&:hover": { bgcolor: "action.selected" },
            },
          }}
          onClick={() => onSelectSection("profile")}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <PersonOutlineOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Профиль"
            secondary="Личные данные"
            primaryTypographyProps={{ fontWeight: selectedSection === "profile" ? 700 : 600 }}
          />
        </ListItemButton>
        
      </List>

      <Divider />

      <List dense disablePadding>
        <ListItemButton
          selected={selectedSection === "professionals"}
          sx={{
            px: 2.5,
            py: 1.5,
            "&.Mui-selected": {
              bgcolor: "action.selected",
              "&:hover": { bgcolor: "action.selected" },
            },
          }}
          onClick={() => onSelectSection("professionals")}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <WorkOutlineOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Для профессионалов"
            secondary={hasProfessionalProfile ? "Provider и команда" : "Создание provider-профиля"}
            primaryTypographyProps={{ fontWeight: selectedSection === "professionals" ? 700 : 600 }}
          />
        </ListItemButton>
      </List>
    </Paper>
  );
}

interface ProfileOverviewProps {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
  memberships: AuthMembership[];
  activeMembership: AuthMembership | null;
}

function ProfileOverview({ name, email, image, memberships, activeMembership }: ProfileOverviewProps) {
  return (
    <Stack spacing={3}>
      <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
        <Avatar
          src={image || undefined}
          sx={{
            width: 100,
            height: 100,
            bgcolor: "primary.main",
            fontSize: 40,
            fontWeight: 600,
          }}
        >
          {getInitials(name) || email?.charAt(0)?.toUpperCase() || "U"}
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            {name || "Пользователь"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
            <EmailIcon fontSize="small" />
            <Typography variant="body1">{email || "Email не указан"}</Typography>
          </Box>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Stack spacing={1.5}>
          <Typography variant="h6" fontWeight={700}>
            Данные аккаунта
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Статус: {activeMembership ? "профессионал" : "заказчик"}
          </Typography>
          {activeMembership ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Активный provider: {activeMembership.providerName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Роль: {providerRoleLabel(activeMembership.role)}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Пока вы используете платформу для поиска и оформления заказов.
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Provider-профилей: {memberships.length}
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}

interface OrdersSectionProps {
  tabValue: number;
  onTabChange: (_: SyntheticEvent, newValue: number) => void;
}

function OrdersSection({ tabValue, onTabChange }: OrdersSectionProps) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Заказы
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Здесь будут ваши текущие и завершённые заказы.
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tabValue} onChange={onTabChange} aria-label="Вкладки заказов" variant="fullWidth">
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
    </Stack>
  );
}

interface ProfessionalsSectionProps {
  activeMembership: AuthMembership | null;
  memberships: AuthMembership[];
  switchingProviderId: string | null;
  onActivateProvider: (providerId: string) => void;
  providerMembers: ProviderMembersResponse | null;
  membersLoading: boolean;
  membersError: string | null;
  isActiveOwner: boolean;
  managerEmail: string;
  onManagerEmailChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onAddManager: (event: FormEvent<HTMLFormElement>) => void;
  managerLoading: boolean;
  managerError: string | null;
  managerSuccess: string | null;
  onCreateProvider: () => void;
}

function ProfessionalsSection({
  activeMembership,
  memberships,
  switchingProviderId,
  onActivateProvider,
  providerMembers,
  membersLoading,
  membersError,
  isActiveOwner,
  managerEmail,
  onManagerEmailChange,
  onAddManager,
  managerLoading,
  managerError,
  managerSuccess,
  onCreateProvider,
}: ProfessionalsSectionProps) {
  if (!activeMembership) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Для профессионалов
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Создайте профессиональный профиль, чтобы предлагать услуги как самозанятый или компания.
            </Typography>
          </Box>
          <Box>
            <Button variant="contained" onClick={onCreateProvider}>
              Создать
            </Button>
          </Box>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Для профессионалов
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Управляйте provider-профилем, переключайте роли и добавляйте участников команды.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
            <BusinessCenterOutlinedIcon color="action" />
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                Активный provider
              </Typography>
              <Typography fontWeight={600}>{activeMembership.providerName}</Typography>
              <Typography variant="body2" color="text.secondary">
                Тип: {providerTypeLabel(activeMembership.providerType)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Роль: {providerRoleLabel(activeMembership.role)}
              </Typography>
            </Box>
          </Box>

          {memberships.length > 1 ? (
            <>
              <Divider />
              <Stack spacing={1.25}>
                <Typography variant="subtitle2" fontWeight={800}>
                  Мои provider-профили
                </Typography>
                {memberships.map((membership) => {
                  const isActive = membership.providerId === activeMembership.providerId;
                  return (
                    <Paper key={membership.providerId} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                      >
                        <Box>
                          <Typography fontWeight={600}>{membership.providerName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {providerTypeLabel(membership.providerType)} · {providerRoleLabel(membership.role)}
                          </Typography>
                        </Box>
                        <Button
                          variant={isActive ? "contained" : "outlined"}
                          size="small"
                          disabled={isActive || switchingProviderId === membership.providerId}
                          onClick={() => onActivateProvider(membership.providerId)}
                        >
                          {isActive ? "Активный" : "Сделать активным"}
                        </Button>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </>
          ) : null}

          <Divider />

          <Stack spacing={1.25}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PeopleOutlineOutlinedIcon fontSize="small" color="action" />
              <Typography variant="subtitle2" fontWeight={800}>
                Команда provider
              </Typography>
            </Box>

            {membersError ? <Alert severity="error">{membersError}</Alert> : null}

            {membersLoading ? (
              <Typography variant="body2" color="text.secondary">
                Загрузка участников...
              </Typography>
            ) : providerMembers?.members?.length ? (
              <Stack spacing={1}>
                {providerMembers.members.map((member) => (
                  <Paper key={member.id} variant="outlined" sx={{ p: 1.5 }}>
                    <Stack spacing={0.5}>
                      <Typography fontWeight={600}>{member.user.name || member.user.email}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.user.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {providerRoleLabel(member.role)}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                В этом provider пока нет участников.
              </Typography>
            )}

            {isActiveOwner ? (
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Stack component="form" spacing={1.5} onSubmit={onAddManager}>
                  <Typography fontWeight={700}>Добавить менеджера</Typography>
                  {managerError ? <Alert severity="error">{managerError}</Alert> : null}
                  {managerSuccess ? <Alert severity="success">{managerSuccess}</Alert> : null}
                  <TextField
                    label="Email пользователя"
                    type="email"
                    value={managerEmail}
                    onChange={onManagerEmailChange}
                    disabled={managerLoading}
                    required
                    fullWidth
                    size="small"
                  />
                  <Button type="submit" variant="contained" disabled={managerLoading}>
                    Добавить менеджера
                  </Button>
                </Stack>
              </Paper>
            ) : null}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { status, user } = useAppSelector((state) => state.auth);
  const [selectedSection, setSelectedSection] = useState<ProfileSection>("orders");
  const [tabValue, setTabValue] = useState(0);
  const [providerMembers, setProviderMembers] = useState<ProviderMembersResponse | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [switchingProviderId, setSwitchingProviderId] = useState<string | null>(null);
  const [managerEmail, setManagerEmail] = useState("");
  const [managerError, setManagerError] = useState<string | null>(null);
  const [managerSuccess, setManagerSuccess] = useState<string | null>(null);
  const [managerLoading, setManagerLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const memberships = user?.memberships ?? [];
  const activeMembership = useMemo(
    () =>
    memberships.find((membership) => membership.providerId === user?.activeProviderId) ??
      memberships[0] ??
      null,
    [memberships, user?.activeProviderId]
  );
  const isActiveOwner = activeMembership?.role === "OWNER";

  useEffect(() => {
    if (!activeMembership?.providerId) {
      setProviderMembers(null);
      setMembersError(null);
      return;
    }

    let cancelled = false;

    async function loadProviderMembers() {
      setMembersLoading(true);
      setMembersError(null);

      try {
        const response = await fetch(`/api/providers/${activeMembership.providerId}/members`, {
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as
          | (ProviderMembersResponse & { error?: never })
          | { error?: string }
          | null;

        if (!response.ok) {
          throw new Error(
            payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
              ? payload.error
              : "Не удалось загрузить участников provider"
          );
        }

        if (!cancelled) {
          setProviderMembers(payload as ProviderMembersResponse);
        }
      } catch (error) {
        if (!cancelled) {
          setMembersError(error instanceof Error ? error.message : "Не удалось загрузить участников provider");
          setProviderMembers(null);
        }
      } finally {
        if (!cancelled) {
          setMembersLoading(false);
        }
      }
    }

    void loadProviderMembers();

    return () => {
      cancelled = true;
    };
  }, [activeMembership?.providerId]);

  async function handleActivateProvider(providerId: string) {
    setSwitchingProviderId(providerId);
    setMembersError(null);

    try {
      const response = await fetch(`/api/providers/${providerId}/activate`, {
        method: "POST",
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Не удалось переключить provider");
      }

      router.refresh();
    } catch (error) {
      setMembersError(error instanceof Error ? error.message : "Не удалось переключить provider");
    } finally {
      setSwitchingProviderId(null);
    }
  }

  async function handleAddManager(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeMembership?.providerId) return;

    setManagerLoading(true);
    setManagerError(null);
    setManagerSuccess(null);

    try {
      const response = await fetch(`/api/providers/${activeMembership.providerId}/members`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email: managerEmail }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | ProviderMemberRecord | null;

      if (!response.ok) {
        throw new Error(
          payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "Не удалось добавить менеджера"
        );
      }

      setManagerEmail("");
      setManagerSuccess("Менеджер добавлен в provider");

      const membersResponse = await fetch(`/api/providers/${activeMembership.providerId}/members`, {
        cache: "no-store",
      });
      const membersPayload = (await membersResponse.json()) as ProviderMembersResponse;
      setProviderMembers(membersPayload);
    } catch (error) {
      setManagerError(error instanceof Error ? error.message : "Не удалось добавить менеджера");
    } finally {
      setManagerLoading(false);
    }
  }

  if (status === "unknown" || status === "unauthenticated") {
    return (
      <Container maxWidth="lg" sx={{ py: 4, pt: 14, pb: 10 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">
          <Paper variant="outlined" sx={{ width: { xs: "100%", md: 320 }, p: 3 }}>
            <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={52} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={180} />
          </Paper>
          <Paper sx={{ flex: 1, width: "100%", p: 4 }}>
            <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
              <Skeleton variant="circular" width={100} height={100} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={40} />
                <Skeleton variant="text" width="40%" />
              </Box>
            </Box>
            <Skeleton variant="rectangular" height={200} />
          </Paper>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, pt: 14, pb: 10 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">
        <Box sx={{ width: { xs: "100%", md: 320 }, flexShrink: 0 }}>
          <ProfileSidebar
            selectedSection={selectedSection}
            onSelectSection={setSelectedSection}
            hasProfessionalProfile={Boolean(activeMembership)}
          />
        </Box>

        <Paper sx={{ flex: 1, width: "100%", p: { xs: 3, md: 4 } }}>
          {selectedSection === "profile" ? (
            <ProfileOverview
              name={user?.name}
              email={user?.email}
              image={user?.image}
              memberships={memberships}
              activeMembership={activeMembership}
            />
          ) : null}

          {selectedSection === "orders" ? (
            <OrdersSection tabValue={tabValue} onTabChange={handleTabChange} />
          ) : null}

          {selectedSection === "professionals" ? (
            <ProfessionalsSection
              activeMembership={activeMembership}
              memberships={memberships}
              switchingProviderId={switchingProviderId}
              onActivateProvider={handleActivateProvider}
              providerMembers={providerMembers}
              membersLoading={membersLoading}
              membersError={membersError}
              isActiveOwner={isActiveOwner}
              managerEmail={managerEmail}
              onManagerEmailChange={(event: ChangeEvent<HTMLInputElement>) =>
                setManagerEmail(event.target.value)
              }
              onAddManager={handleAddManager}
              managerLoading={managerLoading}
              managerError={managerError}
              managerSuccess={managerSuccess}
              onCreateProvider={() => router.push("/providers/new")}
            />
          ) : null}
        </Paper>
      </Stack>
    </Container>
  );
}
