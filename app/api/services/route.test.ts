/** @jest-environment node */

import { GET } from "./route";

jest.mock("@/entities/service/api/service.repository", () => ({
  __esModule: true,
  serviceRepository: {
    getServices: jest.fn(),
  },
}));

import { serviceRepository } from "@/entities/service/api/service.repository";
import { legalService, mainService } from "@/tests/fixtures/services";

const mockedRepository = serviceRepository as unknown as {
  getServices: jest.Mock;
};

describe("GET /api/services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns services", async () => {
    const rows = [mainService, legalService];
    mockedRepository.getServices.mockResolvedValue(rows);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(rows);
    expect(mockedRepository.getServices).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when repository throws", async () => {
    mockedRepository.getServices.mockRejectedValue(new Error("db down"));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to fetch services" });
  });
});
