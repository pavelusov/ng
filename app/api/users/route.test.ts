/** @jest-environment node */

import type { NextRequest } from "next/server";
import { GET, POST } from "./route";

jest.mock("../../../lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import prisma from "../../../lib/prisma";

const mockedPrisma = prisma as unknown as {
  user: {
    findMany: jest.Mock;
    create: jest.Mock;
  };
};

describe("Users API /api/users", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns users list in GET", async () => {
    mockedPrisma.user.findMany.mockResolvedValue([{ id: "u1", email: "a@a.com" }]);

    const response = await GET({} as NextRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual([{ id: "u1", email: "a@a.com" }]);
  });

  it("validates required email in POST", async () => {
    const request = new Request("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test" }),
    }) as unknown as NextRequest;

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ error: "email is required" });
    expect(mockedPrisma.user.create).not.toHaveBeenCalled();
  });

  it("creates user in POST", async () => {
    mockedPrisma.user.create.mockResolvedValue({ id: "u1", email: "mail@test.com" });

    const request = new Request("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "mail@test.com", name: "User" }),
    }) as unknown as NextRequest;

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json).toEqual({ id: "u1", email: "mail@test.com" });
    expect(mockedPrisma.user.create).toHaveBeenCalledWith({
      data: {
        email: "mail@test.com",
        name: "User",
      },
    });
  });

  it("returns 500 when GET fails", async () => {
    mockedPrisma.user.findMany.mockRejectedValue(new Error("db down"));

    const response = await GET({} as NextRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to fetch users" });
  });

  it("returns 500 when POST fails", async () => {
    mockedPrisma.user.create.mockRejectedValue(new Error("insert fail"));

    const request = new Request("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "mail@test.com" }),
    }) as unknown as NextRequest;

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to create user" });
  });
});
