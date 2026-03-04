import { render, screen, waitFor } from "@testing-library/react";
import { Services } from "./Services";
import { legalService, mainService } from "../../../tests/fixtures/services";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Services widget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("shows error when API request fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    render(<Services />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch services")).toBeInTheDocument();
    });
  });

  it("renders categories and cards from API", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [mainService, legalService],
    });

    render(<Services />);

    await waitFor(() => {
      expect(screen.getByText("Основные услуги")).toBeInTheDocument();
      expect(screen.getByText("Юридические услуги")).toBeInTheDocument();
      expect(screen.getByText(mainService.title)).toBeInTheDocument();
      expect(screen.getByText(legalService.title)).toBeInTheDocument();
    });
  });
});
