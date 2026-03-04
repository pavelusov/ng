/** @jest-environment node */

import type { NextRequest } from "next/server";
import { DELETE, PATCH } from "./route";

jest.mock("../../../../../lib/prisma", () => ({
  __esModule: true,
  default: {
    service: {
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import prisma from "../../../../../lib/prisma";

const mockedPrisma = prisma as unknown as {
  service: {
    update: jest.Mock;
    delete: jest.Mock;
  };
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
    expect(mockedPrisma.service.update).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid category in PATCH", async () => {
    const request = new Request("http://localhost/api/admin/services/1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: "other" }),
    }) as unknown as NextRequest;

    const response = await PATCH(request, { params: Promise.resolve({ id: "1" }) });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: "Invalid category" });
    expect(mockedPrisma.service.update).not.toHaveBeenCalled();
  });

  it("updates service with nullable fields in PATCH", async () => {
    mockedPrisma.service.update.mockResolvedValue({ id: "1", title: "Updated" });

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
    expect(json).toEqual({ id: "1", title: "Updated" });
    expect(mockedPrisma.service.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: expect.objectContaining({
        category: "legal",
        title: "Updated",
        ctaHref: null,
        image: null,
        rating: null,
      }),
    });
  });

  it("returns 500 when PATCH fails", async () => {
    mockedPrisma.service.update.mockRejectedValue(new Error("db error"));

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
    mockedPrisma.service.delete.mockResolvedValue({ id: "1" });

    const response = await DELETE({} as NextRequest, { params: Promise.resolve({ id: "1" }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(mockedPrisma.service.delete).toHaveBeenCalledWith({ where: { id: "1" } });
  });

  it("returns 404 in production mode for DELETE", async () => {
    process.env.NODE_ENV = "production";

    const response = await DELETE({} as NextRequest, { params: Promise.resolve({ id: "1" }) });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({ error: "Not found" });
  });
});
