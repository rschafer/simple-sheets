"use client";

import { useNavigation } from "@/context/NavigationContext";
import ProductAreaSummary from "./ProductAreaSummary";
import ProgramDashboard from "./ProgramDashboard";

export default function MainContent() {
  const { currentView } = useNavigation();

  if (currentView.type === "product-area") {
    return <ProductAreaSummary />;
  }

  return <ProgramDashboard />;
}
