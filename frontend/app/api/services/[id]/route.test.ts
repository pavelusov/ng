/** @jest-environment node */

import type { NextRequest } from "next/server";
import { GET, POST } from "./route";

jest.mock("@/lib/backend-api", () => ({
  __esModule: true,
  fetchBackend: jest.fn(),
  fetchBackendAsUser: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  __esModule: true,
  getServerAuthSession: jest.fn(),
}));

import { fetchBackend, fetchBackendAsUser } from "@/lib/backend-api";
import { getServerAuthSession } from "@/lib/auth";
import { mainService } from "@/tests/fixtures/services";

const mockedFetchBackend = fetchBackend as jest.Mock;
const mockedFetchBackendAsUser = fetchBackendAsUser as jest.Mock;
const mockedGetServerAuthSession = getServerAuthSession as jest.Mock;

describe("GET /api/services/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetServerAuthSession.mockResolvedValue(null);
  });

  it("returns service by id", async () => {
    const row = { ...mainService, id: "svc-1" };
    mockedFetchBackend.mockResolvedValue(
      new Response(JSON.stringify(row), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const response = await GET({} as NextRequest, {
      params: Promise.resolve({ id: "svc-1" }),
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(row);
    expect(mockedFetchBackend).toHaveBeenCalledWith("/services/svc-1");
  });

  it("returns 404 when service is missing", async () => {
    mockedFetchBackend.mockResolvedValue(
      new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    );

    const response = await GET({} as NextRequest, {
      params: Promise.resolve({ id: "missing" }),
    });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({ error: "Not found" });
  });

  it("returns 500 when repository throws", async () => {
    mockedFetchBackend.mockRejectedValue(new Error("backend error"));

    const response = await GET({} as NextRequest, {
      params: Promise.resolve({ id: "svc-1" }),
    });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to fetch service" });
  });

  it("creates anonymous service lead", async () => {
    const leadPayload = { customerEmail: "user@example.com", message: "Хочу узнать детали" };
    const createdLead = { id: "lead-1", status: "NEW" };
    mockedFetchBackend.mockResolvedValue(
      new Response(JSON.stringify(createdLead), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      })
    );

    const response = await POST(
      {
        json: async () => leadPayload,
      } as unknown as NextRequest,
      {
        params: Promise.resolve({ id: "svc-1" }),
      }
    );
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json).toEqual(createdLead);
    expect(mockedFetchBackend).toHaveBeenCalledWith("/services/svc-1/leads", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(leadPayload),
    });
  });

  it("creates authenticated service lead as user", async () => {
    const leadPayload = { customerPhone: "+79990000000" };
    const createdLead = { id: "lead-2", status: "NEW" };
    mockedGetServerAuthSession.mockResolvedValue({
      user: { id: "user-1" },
    });
    mockedFetchBackendAsUser.mockResolvedValue(
      new Response(JSON.stringify(createdLead), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      })
    );

    const response = await POST(
      {
        json: async () => leadPayload,
      } as unknown as NextRequest,
      {
        params: Promise.resolve({ id: "svc-1" }),
      }
    );
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json).toEqual(createdLead);
    expect(mockedFetchBackendAsUser).toHaveBeenCalledWith("/services/svc-1/leads", "user-1", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(leadPayload),
    });
  });
});
