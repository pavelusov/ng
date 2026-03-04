import ServicesAdminPage from "./page";

const notFoundMock = jest.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

jest.mock("next/navigation", () => ({
  notFound: () => notFoundMock(),
}));

describe("Admin services page", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("calls notFound in production", async () => {
    process.env.NODE_ENV = "production";
    await expect(ServicesAdminPage()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("renders in non-production mode", async () => {
    process.env.NODE_ENV = "test";
    const element = await ServicesAdminPage();

    expect(element).toBeTruthy();
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});
