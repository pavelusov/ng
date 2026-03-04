import { render, screen, waitFor } from "@testing-library/react";
import { LegalServicesPaper } from "./LegalServicesPaper";
import { legalService, mainService } from "../../../tests/fixtures/services";

describe("LegalServicesPaper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("renders only legal service titles", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [mainService, legalService],
    });

    render(<LegalServicesPaper />);

    await waitFor(() => {
      expect(screen.getByText("Юридические услуги")).toBeInTheDocument();
      expect(screen.getByText(legalService.title)).toBeInTheDocument();
      expect(screen.queryByText(mainService.title)).not.toBeInTheDocument();
    });
  });

  it("shows fallback error text on failed request", async () => {
    (global.fetch as jest.Mock).mockRejectedValue("network issue");

    render(<LegalServicesPaper />);

    await waitFor(() => {
      expect(screen.getByText("Ошибка загрузки")).toBeInTheDocument();
    });
  });

  it("shows explicit error when response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    render(<LegalServicesPaper />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch services")).toBeInTheDocument();
    });
  });
});
