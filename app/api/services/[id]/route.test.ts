/** @jest-environment node */

import type { NextRequest } from "next/server";
import { GET } from "./route";

jest.mock("../../../../lib/prisma", () => ({
  __esModule: true,
  default: {
    service: {
      findUnique: jest.fn(),
    },
  },
}));

import prisma from "../../../../lib/prisma";

const mockedPrisma = prisma as unknown as {
  service: {
    findUnique: jest.Mock;
  };
};

describe("GET /api/services/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns service by id", async () => {
    const row = { id: "svc-1", title: "Service" };
    mockedPrisma.service.findUnique.mockResolvedValue(row);

    const response = await GET({} as NextRequest, {
      params: Promise.resolve({ id: "svc-1" }),
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(row);
    expect(mockedPrisma.service.findUnique).toHaveBeenCalledWith({
      where: { id: "svc-1" },
    });
  });

  it("returns 404 when service is missing", async () => {
    mockedPrisma.service.findUnique.mockResolvedValue(null);

    const response = await GET({} as NextRequest, {
      params: Promise.resolve({ id: "missing" }),
    });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({ error: "Not found" });
  });

  it("returns 500 when prisma throws", async () => {
    mockedPrisma.service.findUnique.mockRejectedValue(new Error("db error"));

    const response = await GET({} as NextRequest, {
      params: Promise.resolve({ id: "svc-1" }),
    });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to fetch service" });
  });
});
