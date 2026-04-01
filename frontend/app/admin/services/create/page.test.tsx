import ServicesAdminCreatePage from "./page";

const notFoundMock = jest.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

jest.mock("next/navigation", () => ({
  notFound: () => notFoundMock(),
}));

jest.mock("@/core/auth/server-authorization", () => ({
  __esModule: true,
  getServiceManagementContext: jest.fn(),
}));

import { getServiceManagementContext } from "@/core/auth/server-authorization";

const mockedGetServiceManagementContext = getServiceManagementContext as jest.Mock;

function setNodeEnv(value: "development" | "production" | "test") {
  process.env = { ...process.env, NODE_ENV: value } as NodeJS.ProcessEnv;
}

describe("Admin services create page", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetServiceManagementContext.mockResolvedValue({
      context: {
        actorUserId: "user-1",
        providerId: "provider-1",
        isPlatformAdmin: false,
      },
    });
  });

  afterAll(() => {
    setNodeEnv((originalNodeEnv as "development" | "production" | "test" | undefined) ?? "test");
  });

  it("calls notFound in production", async () => {
    setNodeEnv("production");
    await expect(ServicesAdminCreatePage()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("renders client in non-production mode", async () => {
    setNodeEnv("test");
    const element = await ServicesAdminCreatePage();

    expect(element).toBeTruthy();
  });
});
