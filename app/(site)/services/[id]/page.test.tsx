import ServicePage, { generateMetadata } from "./page";

const notFoundMock = jest.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

jest.mock("next/navigation", () => ({
  notFound: () => notFoundMock(),
}));

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    service: {
      findUnique: jest.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";

const mockedPrisma = prisma as unknown as {
  service: {
    findUnique: jest.Mock;
  };
};

describe("Service details page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns fallback metadata when service is missing", async () => {
    mockedPrisma.service.findUnique.mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "missing" }),
    });

    expect(metadata).toEqual({ title: "Услуга" });
  });

  it("returns service metadata when service exists", async () => {
    mockedPrisma.service.findUnique.mockResolvedValue({
      title: "Межевание участка",
      description: "Полное сопровождение",
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "svc-1" }),
    });

    expect(metadata).toEqual({
      title: "Межевание участка — Новые горизонты",
      description: "Полное сопровождение",
    });
  });

  it("calls notFound when page service is missing", async () => {
    mockedPrisma.service.findUnique.mockResolvedValue(null);

    await expect(
      ServicePage({
        params: Promise.resolve({ id: "missing" }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("renders page when service exists", async () => {
    mockedPrisma.service.findUnique.mockResolvedValue({
      id: "svc-1",
      category: "main",
      title: "Межевание участка",
      description: "Описание",
      price: "1000 ₽",
      ctaText: "Записаться",
      ctaHref: "#contacts",
      image: null,
    });

    const element = await ServicePage({
      params: Promise.resolve({ id: "svc-1" }),
    });

    expect(element).toBeTruthy();
  });
});
