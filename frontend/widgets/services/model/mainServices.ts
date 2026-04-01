import MapRoundedIcon from "@mui/icons-material/MapRounded";
import ElectricBoltRoundedIcon from "@mui/icons-material/ElectricBoltRounded";
import ArchitectureRoundedIcon from "@mui/icons-material/ArchitectureRounded";
import type { ServiceIconKey } from "@/entities/service";
import type { ServicePaletteColor } from "@/entities/service/types";

export type MainServiceItem = {
  title: string;
  description: string;
  badge?: string;
  highlight?: string;
  paletteColor: ServicePaletteColor;
  Icon: typeof MapRoundedIcon;
};

export const SERVICE_ICON_MAP: Record<
  ServiceIconKey,
  typeof MapRoundedIcon
> = {
  map: MapRoundedIcon,
  electric: ElectricBoltRoundedIcon,
  architecture: ArchitectureRoundedIcon,
};
