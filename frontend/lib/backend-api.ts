import "server-only";
import { NextResponse } from "next/server";
import { createInternalAuthTokenForUserId } from "@/lib/internal-backend-auth";

function getBackendBaseUrl() {
  return process.env.BACKEND_API_URL ?? "http://localhost:3003";
}

function buildBackendUrl(path: string) {
  return new URL(path, getBackendBaseUrl()).toString();
}

async function parseBackendBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text.length > 0 ? text : null;
}

export class BackendApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
  }
}

export function createInternalAuthHeaders(userId: string) {
  return {
    "x-internal-auth": createInternalAuthTokenForUserId(userId),
  };
}

export async function fetchBackend(path: string, init?: RequestInit) {
  return fetch(buildBackendUrl(path), {
    cache: "no-store",
    ...init,
  });
}

export async function fetchBackendAsUser(
  path: string,
  userId: string,
  init?: RequestInit,
) {
  const headers = new Headers(init?.headers);
  headers.set("x-internal-auth", createInternalAuthTokenForUserId(userId));

  return fetchBackend(path, {
    ...init,
    headers,
  });
}

export async function fetchBackendJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetchBackend(path, init);
  const body = await parseBackendBody(response);

  if (!response.ok) {
    const message =
      typeof body === "object" && body && "error" in body && typeof body.error === "string"
        ? body.error
        : `Backend request failed with status ${response.status}`;

    throw new BackendApiError(message, response.status, body);
  }

  return body as T;
}

export async function fetchBackendJsonAsUser<T>(
  path: string,
  userId: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetchBackendAsUser(path, userId, init);
  const body = await parseBackendBody(response);

  if (!response.ok) {
    const message =
      typeof body === "object" && body && "error" in body && typeof body.error === "string"
        ? body.error
        : `Backend request failed with status ${response.status}`;

    throw new BackendApiError(message, response.status, body);
  }

  return body as T;
}

export async function proxyBackendResponse(path: string, init?: RequestInit) {
  const response = await fetchBackend(path, init);
  const body = await parseBackendBody(response);
  return NextResponse.json(body, { status: response.status });
}

export async function proxyBackendResponseAsUser(
  path: string,
  userId: string,
  init?: RequestInit,
) {
  const response = await fetchBackendAsUser(path, userId, init);
  const body = await parseBackendBody(response);
  return NextResponse.json(body, { status: response.status });
}
