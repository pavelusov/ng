"use client";

export const SERVICE_LEAD_INTENT = "service-lead";
export const SERVICE_LEADS_PROFILE_URL = "/profile?section=leads";
export const SERVICE_LEADS_PROFILE_RESUME_URL = "/profile?section=leads&leadResume=1";

const STORAGE_KEY = "pending-service-lead";
const SUBMITTING_TTL_MS = 15_000;

export type PendingServiceLeadDraft = {
  serviceId: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  message: string | null;
  state: "pending" | "submitting";
  updatedAt: number;
  lastError: string | null;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function normalizeNullableString(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

export function createPendingServiceLeadDraft(input: {
  serviceId: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  message?: string | null;
}): PendingServiceLeadDraft {
  return {
    serviceId: input.serviceId,
    customerName: normalizeNullableString(input.customerName),
    customerEmail: normalizeNullableString(input.customerEmail),
    customerPhone: normalizeNullableString(input.customerPhone),
    message: normalizeNullableString(input.message),
    state: "pending",
    updatedAt: Date.now(),
    lastError: null,
  };
}

export function readPendingServiceLeadDraft(): PendingServiceLeadDraft | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PendingServiceLeadDraft>;
    if (typeof parsed.serviceId !== "string" || parsed.serviceId.length === 0) {
      return null;
    }

    return {
      serviceId: parsed.serviceId,
      customerName: normalizeNullableString(parsed.customerName ?? null),
      customerEmail: normalizeNullableString(parsed.customerEmail ?? null),
      customerPhone: normalizeNullableString(parsed.customerPhone ?? null),
      message: normalizeNullableString(parsed.message ?? null),
      state: parsed.state === "submitting" ? "submitting" : "pending",
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
      lastError: normalizeNullableString(parsed.lastError ?? null),
    };
  } catch {
    return null;
  }
}

export function writePendingServiceLeadDraft(draft: PendingServiceLeadDraft) {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function savePendingServiceLeadDraft(input: {
  serviceId: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  message?: string | null;
}) {
  const nextDraft = createPendingServiceLeadDraft(input);
  writePendingServiceLeadDraft(nextDraft);
  return nextDraft;
}

export function clearPendingServiceLeadDraft() {
  if (!canUseStorage()) return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function markPendingServiceLeadSubmitting() {
  const draft = readPendingServiceLeadDraft();
  if (!draft) return null;

  const nextDraft: PendingServiceLeadDraft = {
    ...draft,
    state: "submitting",
    updatedAt: Date.now(),
    lastError: null,
  };
  writePendingServiceLeadDraft(nextDraft);
  return nextDraft;
}

export function markPendingServiceLeadFailed(errorMessage: string) {
  const draft = readPendingServiceLeadDraft();
  if (!draft) return null;

  const nextDraft: PendingServiceLeadDraft = {
    ...draft,
    state: "pending",
    updatedAt: Date.now(),
    lastError: errorMessage,
  };
  writePendingServiceLeadDraft(nextDraft);
  return nextDraft;
}

export function isPendingServiceLeadSubmitting(draft: PendingServiceLeadDraft | null) {
  if (!draft || draft.state !== "submitting") {
    return false;
  }

  return Date.now() - draft.updatedAt < SUBMITTING_TTL_MS;
}

export function buildServiceLeadAuthHref(mode: "signin" | "signup", serviceId: string) {
  const url = new URL(mode === "signin" ? "/signin" : "/signup", "http://local");
  url.searchParams.set("intent", SERVICE_LEAD_INTENT);
  url.searchParams.set("serviceId", serviceId);
  url.searchParams.set("returnTo", SERVICE_LEADS_PROFILE_RESUME_URL);
  return `${url.pathname}${url.search}`;
}
