import ServicesAdminListPage from "./page";

const notFoundMock = jest.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

jest.mock("next/navigation", () => ({
  notFound: () => notFoundMock(),
}));

jest.mock("../../../../lib/prisma", () => ({
  __esModule: true,
  default: {
    service: {
      findMany: jest.fn(),
    },
  },
}));

import prisma from "../../../../lib/prisma";

const mockedPrisma = prisma as unknown as {
  service: { findMany: jest.Mock };
};

describe("Admin services list page", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("calls notFound in production", async () => {
    process.env.NODE_ENV = "production";
    await expect(ServicesAdminListPage()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("loads services with expected ordering", async () => {
    process.env.NODE_ENV = "test";
    mockedPrisma.service.findMany.mockResolvedValue([]);

    const element = await ServicesAdminListPage();

    expect(element).toBeTruthy();
    expect(mockedPrisma.service.findMany).toHaveBeenCalledWith({
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });
  });
});
