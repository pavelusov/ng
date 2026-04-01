import { render, screen } from "@testing-library/react";
import { ServiceCard } from "./ServiceCard";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ServiceCard", () => {
  it("builds correct link and shows singular review label", () => {
    render(
      <ServiceCard
        item={{
          id: "svc-1",
          title: "Услуга 1",
          price: "1000 ₽",
          ctaText: "Записаться",
          rating: 4.8,
          reviewCount: 1,
        }}
      />
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/services/svc-1");
    expect(screen.getByText("1 отзыв")).toBeInTheDocument();
  });

  it("shows plural review labels", () => {
    const { rerender } = render(
      <ServiceCard
        item={{
          id: "svc-2",
          title: "Услуга 2",
          price: "2000 ₽",
          ctaText: "Записаться",
          reviewCount: 3,
        }}
      />
    );

    expect(screen.getByText("3 отзыва")).toBeInTheDocument();

    rerender(
      <ServiceCard
        item={{
          id: "svc-3",
          title: "Услуга 3",
          price: "3000 ₽",
          ctaText: "Записаться",
          reviewCount: 7,
        }}
      />
    );

    expect(screen.getByText("7 отзывов")).toBeInTheDocument();
  });
});
