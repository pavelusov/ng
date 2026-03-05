/** @jest-environment node */

import type { NextRequest } from "next/server";
import { GET, POST } from "./route";

jest.mock("@/entities/service/api/service.repository", () => ({
  __esModule: true,
  serviceRepository: {
    getServices: jest.fn(),
    createService: jest.fn(),
  },
}));

import { serviceRepository } from "@/entities/service/api/service.repository";
import { mainService } from "@/tests/fixtures/services";

const mockedRepository = serviceRepository as unknown as {
  getServices: jest.Mock;
  createService: jest.Mock;
};

const originalNodeEnv = process.env.NODE_ENV;

describe("Admin services API /api/admin/services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "test";
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("returns 404 in production mode for GET", async () => {
    process.env.NODE_ENV = "production";

    const response = await GET({} as NextRequest);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({ error: "Not found" });
    expect(mockedRepository.getServices).not.toHaveBeenCalled();
  });

  it("returns services for GET in non-production mode", async () => {
    const rows = [{ ...mainService, id: "svc-1" }];
    mockedRepository.getServices.mockResolvedValue(rows);

    const response = await GET({} as NextRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(rows);
    expect(mockedRepository.getServices).toHaveBeenCalledTimes(1);
  });

  it("returns 404 in production mode for POST", async () => {
    process.env.NODE_ENV = "production";

    const request = new Request("http://localhost/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }) as unknown as NextRequest;
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({ error: "Not found" });
    expect(mockedRepository.createService).not.toHaveBeenCalled();
  });

  it("validates required POST fields", async () => {
    const request = new Request("http://localhost/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: "main", title: "", price: "", ctaText: "" }),
    }) as unknown as NextRequest;

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual(expect.objectContaining({ error: "Invalid payload" }));
    expect(mockedRepository.createService).not.toHaveBeenCalled();
  });

  it("trims required values and creates service", async () => {
    mockedRepository.createService.mockResolvedValue({
      ...mainService,
      id: "new-service",
    });

    const request = new Request("http://localhost/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "main",
        title: "  Test title ",
        price: " 1000 ₽ ",
        ctaText: " Записаться ",
        image: "/img.jpg",
        ctaHref: "/contacts",
      }),
    }) as unknown as NextRequest;

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json).toEqual(expect.objectContaining({ id: "new-service" }));
    expect(mockedRepository.createService).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "main",
        title: "Test title",
        price: "1000 ₽",
        ctaText: "Записаться",
        image: "/img.jpg",
        ctaHref: "/contacts",
      })
    );
  });

  it("returns 500 when repository create throws", async () => {
    mockedRepository.createService.mockRejectedValue(new Error("db error"));

    const request = new Request("http://localhost/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "main",
        title: "Service",
        price: "1000",
        ctaText: "CTA",
      }),
    }) as unknown as NextRequest;

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to create service" });
  });
});
