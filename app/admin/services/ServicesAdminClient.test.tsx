import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ServicesAdminClient } from "./ServicesAdminClient";
import { legalService, mainService } from "../../../tests/fixtures/services";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("ServicesAdminClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    global.confirm = jest.fn(() => true);
  });

  it("creates a service and redirects in create mode", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "new-id" }),
    });

    render(<ServicesAdminClient mode="create" />);

    await user.click(screen.getByLabelText("category"));
    await user.click(screen.getByRole("option", { name: "legal" }));
    await user.type(screen.getByLabelText("title"), "Новая услуга");
    await user.type(screen.getByLabelText("price"), "2500 ₽");
    await user.clear(screen.getByLabelText("ctaText"));
    await user.type(screen.getByLabelText("ctaText"), "Оставить заявку");
    await user.clear(screen.getByLabelText("ctaHref"));
    await user.type(screen.getByLabelText("ctaHref"), "   ");
    await user.click(screen.getByRole("button", { name: "Создать" }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0];
    const payload = JSON.parse((requestInit as RequestInit).body as string) as {
      ctaHref: string | null;
      title: string;
      price: string;
      ctaText: string;
    };

    expect(payload.title).toBe("Новая услуга");
    expect(payload.price).toBe("2500 ₽");
    expect(payload.ctaText).toBe("Оставить заявку");
    expect(payload.ctaHref).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/admin/services/list");
  });

  it("deletes service in list mode and refreshes list", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mainService, legalService],
      });

    render(
      <ServicesAdminClient
        mode="list"
        initialServices={[mainService, legalService]}
      />
    );

    const deleteButtons = screen.getAllByRole("button", { name: "Удалить" });
    await user.click(deleteButtons[0]);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    const [deleteUrl, deleteInit] = (global.fetch as jest.Mock).mock.calls[0];
    expect(deleteUrl).toBe(`/api/admin/services/${mainService.id}`);
    expect(deleteInit).toEqual({ method: "DELETE" });
    expect(global.confirm).toHaveBeenCalled();
  });

  it("deletes legal service row path", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mainService, legalService],
      });

    render(
      <ServicesAdminClient
        mode="list"
        initialServices={[mainService, legalService]}
      />
    );

    await user.click(screen.getAllByRole("button", { name: "Удалить" })[1]);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    const [deleteUrl, deleteInit] = (global.fetch as jest.Mock).mock.calls[0];
    expect(deleteUrl).toBe(`/api/admin/services/${legalService.id}`);
    expect(deleteInit).toEqual({ method: "DELETE" });
  });

  it("edits service and sends PATCH payload", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...mainService }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ ...mainService, title: "Обновленный title" }, legalService],
      });

    render(
      <ServicesAdminClient
        mode="list"
        initialServices={[mainService, legalService]}
      />
    );

    await user.click(screen.getAllByRole("button", { name: "Редактировать" })[0]);
    const dialog = await screen.findByRole("dialog", { name: "Редактировать услугу" });

    await user.clear(within(dialog).getByLabelText("title"));
    await user.type(within(dialog).getByLabelText("title"), "Обновленный title");
    await user.click(within(dialog).getByRole("button", { name: "Сохранить" }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    const [url, patchInit] = (global.fetch as jest.Mock).mock.calls[0];

    expect(url).toBe(`/api/admin/services/${mainService.id}`);
    expect((patchInit as RequestInit).method).toBe("PATCH");

    const body = JSON.parse((patchInit as RequestInit).body as string) as {
      title: string;
    };
    expect(body.title).toBe("Обновленный title");
  });

  it("shows API error when create fails", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "category, title, price, ctaText are required" }),
    });

    render(<ServicesAdminClient mode="create" />);

    await user.click(screen.getByRole("button", { name: "Создать" }));

    expect(
      await screen.findByText("category, title, price, ctaText are required")
    ).toBeInTheDocument();
  });

  it("does not call delete API when user cancels confirm", async () => {
    const user = userEvent.setup();
    global.confirm = jest.fn(() => false);

    render(
      <ServicesAdminClient
        mode="list"
        initialServices={[mainService, legalService]}
      />
    );

    await user.click(screen.getAllByRole("button", { name: "Удалить" })[0]);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("shows delete error when delete request fails", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    render(
      <ServicesAdminClient
        mode="list"
        initialServices={[mainService, legalService]}
      />
    );

    await user.click(screen.getAllByRole("button", { name: "Удалить" })[0]);

    expect(await screen.findByText("Failed to delete service")).toBeInTheDocument();
  });

  it("sends normalized nullable and numeric fields from edit form", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...mainService }) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mainService, legalService],
      });

    render(
      <ServicesAdminClient
        mode="list"
        initialServices={[mainService, legalService]}
      />
    );

    await user.click(screen.getAllByRole("button", { name: "Редактировать" })[0]);
    const dialog = await screen.findByRole("dialog", { name: "Редактировать услугу" });

    await user.clear(within(dialog).getByLabelText("ctaHref (null = empty)"));
    await user.type(within(dialog).getByLabelText("ctaHref (null = empty)"), "   ");

    await user.clear(within(dialog).getByLabelText("image (null = empty)"));
    await user.type(within(dialog).getByLabelText("image (null = empty)"), "  ");

    await user.clear(within(dialog).getByLabelText("rating (null = empty)"));
    await user.type(within(dialog).getByLabelText("rating (null = empty)"), "abc");
    await user.clear(within(dialog).getByLabelText("reviewCount (null = empty)"));
    await user.type(within(dialog).getByLabelText("reviewCount (null = empty)"), "12");

    await user.click(within(dialog).getByRole("button", { name: "Сохранить" }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    const [, patchInit] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse((patchInit as RequestInit).body as string) as {
      ctaHref: string | null;
      image: string | null;
      rating: number | null;
      reviewCount: number | null;
    };

    expect(body.ctaHref).toBeNull();
    expect(body.image).toBeNull();
    expect(body.rating).toBeNull();
    expect(body.reviewCount).toBe(12);
  });

  it("shows API error when edit fails", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Failed to update service from API" }),
    });

    render(
      <ServicesAdminClient
        mode="list"
        initialServices={[mainService, legalService]}
      />
    );

    await user.click(screen.getAllByRole("button", { name: "Редактировать" })[0]);
    const dialog = await screen.findByRole("dialog", { name: "Редактировать услугу" });
    await user.click(within(dialog).getByRole("button", { name: "Сохранить" }));

    expect(await screen.findByText("Failed to update service from API")).toBeInTheDocument();
  });

  it("supports extended legal edit fields and closes dialog on cancel", async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [mainService, legalService],
    });

    render(
      <ServicesAdminClient
        mode="list"
        initialServices={[mainService, legalService]}
      />
    );

    await user.click(screen.getAllByRole("button", { name: "Редактировать" })[1]);
    const dialog = await screen.findByRole("dialog", { name: "Редактировать услугу" });

    await user.click(within(dialog).getByLabelText("category"));
    await user.click(screen.getByRole("option", { name: "main" }));
    await user.clear(within(dialog).getByLabelText("price"));
    await user.type(within(dialog).getByLabelText("price"), "4500 ₽");
    await user.clear(within(dialog).getByLabelText("ctaText"));
    await user.type(within(dialog).getByLabelText("ctaText"), "Связаться");

    await user.clear(within(dialog).getByLabelText("stockBadge (null = empty)"));
    await user.type(within(dialog).getByLabelText("stockBadge (null = empty)"), "Осталось 5");
    await user.clear(within(dialog).getByLabelText("badge (null = empty)"));
    await user.type(within(dialog).getByLabelText("badge (null = empty)"), "Хит");
    await user.clear(within(dialog).getByLabelText("highlight (null = empty)"));
    await user.type(within(dialog).getByLabelText("highlight (null = empty)"), "договор");
    await user.clear(within(dialog).getByLabelText("description (null = empty)"));
    await user.type(within(dialog).getByLabelText("description (null = empty)"), "Подробности");
    await user.clear(within(dialog).getByLabelText("paletteColor (null = empty)"));
    await user.type(within(dialog).getByLabelText("paletteColor (null = empty)"), "info");
    await user.clear(within(dialog).getByLabelText("icon (null = empty)"));
    await user.type(within(dialog).getByLabelText("icon (null = empty)"), "map");

    await user.click(within(dialog).getByRole("button", { name: "Сохранить" }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    const [, patchInit] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse((patchInit as RequestInit).body as string) as {
      category: "main" | "legal";
      price: string;
      ctaText: string;
      stockBadge: string | null;
      badge: string | null;
      highlight: string | null;
      description: string | null;
      paletteColor: string | null;
      icon: string | null;
    };

    expect(body.category).toBe("main");
    expect(body.price).toBe("4500 ₽");
    expect(body.ctaText).toBe("Связаться");
    expect(body.stockBadge).toBe("Осталось5");
    expect(body.badge).toBe("Хит");
    expect(body.highlight).toBe("договор");
    expect(body.description).toBe("Подробности");
    expect(body.paletteColor).toBe("info");
    expect(body.icon).toBe("map");

  });

  it("closes edit dialog on cancel", async () => {
    const user = userEvent.setup();

    render(
      <ServicesAdminClient
        mode="list"
        initialServices={[mainService, legalService]}
      />
    );

    await user.click(screen.getAllByRole("button", { name: "Редактировать" })[0]);
    const dialog = await screen.findByRole("dialog", { name: "Редактировать услугу" });
    await user.click(within(dialog).getByRole("button", { name: "Отмена" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Редактировать услугу" })).not.toBeInTheDocument();
    });
  });
});
