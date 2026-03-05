/** @jest-environment node */

import type { NextRequest } from "next/server";
import { DELETE, PATCH } from "./route";

jest.mock("@/entities/service/api/service.repository", () => ({
  __esModule: true,
  serviceRepository: {
    updateService: jest.fn(),
    deleteService: jest.fn(),
  },
}));

import { serviceRepository } from "@/entities/service/api/service.repository";
import { mainService } from "@/tests/fixtures/services";

const mockedRepository = serviceRepository as unknown as {
  updateService: jest.Mock;
  deleteService: jest.Mock;
};

const originalNodeEnv = process.env.NODE_ENV;

describe("Admin services API /api/admin/services/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "test";
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("returns 404 in production mode for PATCH", async () => {
    process.env.NODE_ENV = "production";
    const request = new Request("http://localhost/api/admin/services/1", {
      method: "PATCH",
      body: JSON.stringify({ title: "New title" }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, { params: Promise.resolve({ id: "1" }) });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({ error: "Not found" });
    expect(mockedRepository.updateService).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid payload in PATCH", async () => {
    const request = new Request("http://localhost/api/admin/services/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: "other" }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, { params: Promise.resolve({ id: "1" }) });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual(expect.objectContaining({ error: "Invalid payload" }));
    expect(mockedRepository.updateService).not.toHaveBeenCalled();
  });

  it("updates service with nullable fields in PATCH", async () => {
    mockedRepository.updateService.mockResolvedValue({
      ...mainService,
      id: "1",
      title: "Updated",
      category: "legal",
      ctaHref: null,
      image: null,
      rating: null,
    });

    const request = new Request("http://localhost/api/admin/services/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "legal",
        title: "Updated",
        ctaHref: null,
        image: null,
        rating: null,
      }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, { params: Promise.resolve({ id: "1" }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(expect.objectContaining({ id: "1", title: "Updated" }));
    expect(mockedRepository.updateService).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({
        category: "legal",
        title: "Updated",
        ctaHref: null,
        image: null,
        rating: null,
      })
    );
  });

  it("returns 500 when PATCH fails", async () => {
    mockedRepository.updateService.mockRejectedValue(new Error("db error"));

    const request = new Request("http://localhost/api/admin/services/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated" }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, { params: Promise.resolve({ id: "1" }) });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to update service" });
  });

  it("deletes service in DELETE", async () => {
    mockedRepository.deleteService.mockResolvedValue({ ...mainService, id: "1" });

    const response = await DELETE({} as NextRequest, { params: Promise.resolve({ id: "1" }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(mockedRepository.deleteService).toHaveBeenCalledWith("1");
  });

  it("returns 404 in production mode for DELETE", async () => {
    process.env.NODE_ENV = "production";

    const response = await DELETE({} as NextRequest, { params: Promise.resolve({ id: "1" }) });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({ error: "Not found" });
  });
});
