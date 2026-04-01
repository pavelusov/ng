import MapRoundedIcon from "@mui/icons-material/MapRounded";
import ElectricBoltRoundedIcon from "@mui/icons-material/ElectricBoltRounded";
import ArchitectureRoundedIcon from "@mui/icons-material/ArchitectureRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import SentimentSatisfiedAltRoundedIcon from "@mui/icons-material/SentimentSatisfiedAltRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";

export type AchievementItem = {
  value: string;
  label: string;
  Icon: typeof MapRoundedIcon;
};

export const achievements: readonly AchievementItem[] = [
  {
    value: "5+",
    label: "лет на рынке",
    Icon: WorkspacePremiumRoundedIcon,
  },
  {
    value: "47+",
    label: "участков перераспределено",
    Icon: MapRoundedIcon,
  },
  {
    value: "100+",
    label: "подключений электричества",
    Icon: ElectricBoltRoundedIcon,
  },
  {
    value: "100+",
    label: "выполненных кадастровых работ",
    Icon: ArchitectureRoundedIcon,
  },
  {
    value: "100+",
    label: "довольных клиентов",
    Icon: SentimentSatisfiedAltRoundedIcon,
  },
  {
    value: "50+",
    label: "выигранных судов",
    Icon: GavelRoundedIcon,
  },
];
