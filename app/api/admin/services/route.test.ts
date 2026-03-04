/** @jest-environment node */

import type { NextRequest } from "next/server";
import { GET, POST } from "./route";

jest.mock("../../../../lib/prisma", () => ({
  __esModule: true,
  default: {
    service: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import prisma from "../../../../lib/prisma";

const mockedPrisma = prisma as unknown as {
  service: {
    findMany: jest.Mock;
    create: jest.Mock;
  };
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
    expect(mockedPrisma.service.findMany).not.toHaveBeenCalled();
  });

  it("returns ordered services for GET in non-production mode", async () => {
    const rows = [{ id: "svc-1" }];
    mockedPrisma.service.findMany.mockResolvedValue(rows);

    const response = await GET({} as NextRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(rows);
    expect(mockedPrisma.service.findMany).toHaveBeenCalledWith({
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });
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
    expect(mockedPrisma.service.create).not.toHaveBeenCalled();
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
    expect(json).toEqual({ error: "category, title, price, ctaText are required" });
    expect(mockedPrisma.service.create).not.toHaveBeenCalled();
  });

  it("trims required values and creates service", async () => {
    mockedPrisma.service.create.mockResolvedValue({ id: "new-service" });

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
    expect(json).toEqual({ id: "new-service" });
    expect(mockedPrisma.service.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        category: "main",
        title: "Test title",
        price: "1000 ₽",
        ctaText: "Записаться",
        image: "/img.jpg",
        ctaHref: "/contacts",
      }),
    });
  });

  it("returns 500 when prisma create throws", async () => {
    mockedPrisma.service.create.mockRejectedValue(new Error("db error"));

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
