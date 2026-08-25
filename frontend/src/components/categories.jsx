import {
  Construction,
  Trash2,
  Lightbulb,
  Waves,
  Droplet,
  Building2,
  TreePine,
  Zap,
  HelpCircle,
} from "lucide-react";

export const CATEGORIES = [
  {
    name: "Roads & Potholes",
    icon: Construction,
    desc: "Potholes, broken footpaths, damaged road surfaces",
  },
  { name: "Garbage", icon: Trash2, desc: "Uncollected waste, overflowing bins, black spots" },
  { name: "Streetlights", icon: Lightbulb, desc: "Non-working lamps, flickering poles, dark stretches" },
  { name: "Drainage", icon: Waves, desc: "Blocked drains, stagnant water, open manholes" },
  { name: "Water Supply", icon: Droplet, desc: "Leakages, contamination, no supply" },
  { name: "Public Facilities", icon: Building2, desc: "Public toilets, bus shelters, community halls" },
  { name: "Parks", icon: TreePine, desc: "Unkempt parks, broken play equipment" },
  { name: "Electricity", icon: Zap, desc: "Hanging wires, transformer faults" },
  { name: "Other", icon: HelpCircle, desc: "Anything else affecting your neighbourhood" },
];

export function CategoryIcon({ category, className = "h-5 w-5" }) {
  const found = CATEGORIES.find((c) => c.name === category);
  const Icon = found ? found.icon : HelpCircle;
  return <Icon className={className} />;
}
