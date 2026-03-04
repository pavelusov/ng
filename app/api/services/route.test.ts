/** @jest-environment node */

import { GET } from "./route";

jest.mock("../../../lib/prisma", () => ({
  __esModule: true,
  default: {
    service: {
      findMany: jest.fn(),
    },
  },
}));

import prisma from "../../../lib/prisma";

const mockedPrisma = prisma as unknown as {
  service: {
    findMany: jest.Mock;
  };
};

describe("GET /api/services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns services ordered by category and title", async () => {
    const rows = [{ id: "1", category: "main", title: "A" }];
    mockedPrisma.service.findMany.mockResolvedValue(rows);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(rows);
    expect(mockedPrisma.service.findMany).toHaveBeenCalledWith({
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });
  });

  it("returns 500 when prisma throws", async () => {
    mockedPrisma.service.findMany.mockRejectedValue(new Error("db down"));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to fetch services" });
  });
});
