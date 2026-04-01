import { render, screen, waitFor } from "@testing-library/react";
import { MainServices } from "./MainServices";
import { legalService, mainService } from "../../../tests/fixtures/services";

describe("MainServices widget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("shows error message on failed request", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    render(<MainServices />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch services")).toBeInTheDocument();
    });
  });

  it("renders only main category services", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [mainService, legalService],
    });

    render(<MainServices />);

    await waitFor(() => {
      expect(screen.getByText("Основные услуги")).toBeInTheDocument();
      expect(screen.getByText(mainService.title)).toBeInTheDocument();
      expect(screen.queryByText(legalService.title)).not.toBeInTheDocument();
    });
  });

  it("falls back to default icon for unknown icon key", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [{ ...mainService, icon: "unknown-icon" }],
    });

    render(<MainServices />);

    await waitFor(() => {
      expect(screen.getByText(mainService.title)).toBeInTheDocument();
    });
  });
});
