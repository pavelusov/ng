import ServicesAdminPage from "./page";

describe("Admin services page", () => {
  it("renders hub links", async () => {
    const element = await ServicesAdminPage();

    expect(element).toBeTruthy();
  });
});
