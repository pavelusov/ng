/** @jest-environment node */

import { GET } from "./route";

jest.mock("@/lib/backend-api", () => ({
  __esModule: true,
  fetchBackendAsUser: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  __esModule: true,
  getServerAuthSession: jest.fn(),
}));

import { fetchBackendAsUser } from "@/lib/backend-api";
import { getServerAuthSession } from "@/lib/auth";

const mockedFetchBackendAsUser = fetchBackendAsUser as jest.Mock;
const mockedGetServerAuthSession = getServerAuthSession as jest.Mock;

describe("GET /api/pro/orders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 without session", async () => {
    mockedGetServerAuthSession.mockResolvedValue(null);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("returns provider orders for authenticated user", async () => {
    const payload = [{ id: "order-1", status: "ACTIVE" }];
    mockedGetServerAuthSession.mockResolvedValue({
      user: { id: "user-1" },
    });
    mockedFetchBackendAsUser.mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(payload);
    expect(mockedFetchBackendAsUser).toHaveBeenCalledWith("/admin/orders", "user-1");
  });
});
