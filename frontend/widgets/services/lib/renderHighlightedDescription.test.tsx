import { render, screen } from "@testing-library/react";
import { renderHighlightedDescription } from "./renderHighlightedDescription";
import type { MainServiceItem } from "@/widgets/services/model/mainServices";
import MapRoundedIcon from "@mui/icons-material/MapRounded";

function makeItem(overrides: Partial<MainServiceItem> = {}): MainServiceItem {
  return {
    title: "Service",
    description: "Работаем с земельными участками",
    highlight: "земельными",
    paletteColor: "primary",
    Icon: MapRoundedIcon,
    ...overrides,
  };
}

describe("renderHighlightedDescription", () => {
  it("returns plain description if highlight is missing", () => {
    const item = makeItem({ highlight: undefined });
    const rendered = renderHighlightedDescription(item);
    expect(rendered).toBe("Работаем с земельными участками");
  });

  it("returns plain description if highlight not found", () => {
    const item = makeItem({ highlight: "несуществующий" });
    const rendered = renderHighlightedDescription(item);
    expect(rendered).toBe("Работаем с земельными участками");
  });

  it("wraps matching fragment in span", () => {
    const item = makeItem();
    render(<>{renderHighlightedDescription(item)}</>);

    expect(screen.getByText("земельными")).toBeInTheDocument();
    expect(screen.getByText("земельными").tagName.toLowerCase()).toBe("span");
  });
});
