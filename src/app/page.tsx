import { LifeApp } from "@/components";
import { SimulationProvider } from "@/context";

export default function Home() {
  return (
    <SimulationProvider initialRows={16} initialCols={32}>
      <LifeApp />
    </SimulationProvider>
  );
}
