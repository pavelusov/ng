import ServicesAdminListPage from "./page";

const notFoundMock = jest.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

jest.mock("next/navigation", () => ({
  notFound: () => notFoundMock(),
}));

jest.mock("@/lib/auth", () => ({
  __esModule: true,
  getServerAuthSession: jest.fn(),
}));

jest.mock("@/lib/backend-api", () => ({
  __esModule: true,
  fetchBackendJsonAsUser: jest.fn(),
}));

import { fetchBackendJsonAsUser } from "@/lib/backend-api";
import { getServerAuthSession } from "@/lib/auth";

const mockedFetchBackendJsonAsUser = fetchBackendJsonAsUser as jest.Mock;
const mockedGetServerAuthSession = getServerAuthSession as jest.Mock;

function setNodeEnv(value: "development" | "production" | "test") {
  process.env = { ...process.env, NODE_ENV: value } as NodeJS.ProcessEnv;
}

describe("Admin services list page", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetServerAuthSession.mockResolvedValue({
      user: {
        id: "user-1",
      },
    });
  });

  afterAll(() => {
    setNodeEnv((originalNodeEnv as "development" | "production" | "test" | undefined) ?? "test");
  });

  it("calls notFound in production", async () => {
    setNodeEnv("production");
    await expect(ServicesAdminListPage()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("loads services with expected ordering", async () => {
    setNodeEnv("test");
    mockedFetchBackendJsonAsUser.mockResolvedValue([]);

    const element = await ServicesAdminListPage();

    expect(element).toBeTruthy();
    expect(mockedFetchBackendJsonAsUser).toHaveBeenCalledWith("/admin/services", "user-1");
  });
});
