import MapRoundedIcon from "@mui/icons-material/MapRounded";
import ElectricBoltRoundedIcon from "@mui/icons-material/ElectricBoltRounded";
import ArchitectureRoundedIcon from "@mui/icons-material/ArchitectureRounded";

export type ServicePaletteColor = "primary" | "secondary" | "info" | "success" | "warning" | "error";

export type MainServiceItem = {
  title: string;
  description: string;
  /**
   * Optional small label in the top-right corner.
   * Example: "90% выгода"
   */
  badge?: string;
  /**
   * Substring inside `description` to highlight.
   */
  highlight?: string;
  paletteColor: ServicePaletteColor;
  Icon: typeof MapRoundedIcon;
};

export const mainServices = [
  {
    title: "Перераспределение земельного участка",
    description: "Увеличение площади земельного участка за счет прилегающей территории.",
    highlight: "за счет прилегающей территории",
    paletteColor: "secondary",
    Icon: MapRoundedIcon,
  },
  {
    title: "Подключение электричества",
    description:
      "Подача заявок на подключение электричества для физических и юридических лиц. Льготное подключение с выгодой до 90% от цены рынка.",
    badge: "90% выгода",
    highlight: "выгодой до 90% от цены рынка",
    paletteColor: "primary",
    Icon: ElectricBoltRoundedIcon,
  },
  {
    title: "Кадастровые работы",
    description:
      "Межевание и подготовка технических/межевых планов, постановка на кадастровый учёт и внесение изменений в ЕГРН.",
    highlight: "ЕГРН",
    paletteColor: "error",
    Icon: ArchitectureRoundedIcon,
  },
] as const satisfies ReadonlyArray<MainServiceItem>;

