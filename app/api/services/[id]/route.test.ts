/** @jest-environment node */

import type { NextRequest } from "next/server";
import { GET } from "./route";

jest.mock("@/entities/service/api/service.repository", () => ({
  __esModule: true,
  serviceRepository: {
    getServiceById: jest.fn(),
  },
}));

import { serviceRepository } from "@/entities/service/api/service.repository";
import { mainService } from "@/tests/fixtures/services";

const mockedRepository = serviceRepository as unknown as {
  getServiceById: jest.Mock;
};

describe("GET /api/services/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns service by id", async () => {
    const row = { ...mainService, id: "svc-1" };
    mockedRepository.getServiceById.mockResolvedValue(row);

    const response = await GET({} as NextRequest, {
      params: Promise.resolve({ id: "svc-1" }),
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(row);
    expect(mockedRepository.getServiceById).toHaveBeenCalledWith("svc-1");
  });

  it("returns 404 when service is missing", async () => {
    mockedRepository.getServiceById.mockResolvedValue(null);

    const response = await GET({} as NextRequest, {
      params: Promise.resolve({ id: "missing" }),
    });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({ error: "Not found" });
  });

  it("returns 500 when repository throws", async () => {
    mockedRepository.getServiceById.mockRejectedValue(new Error("db error"));

    const response = await GET({} as NextRequest, {
      params: Promise.resolve({ id: "svc-1" }),
    });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to fetch service" });
  });
});
