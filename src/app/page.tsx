import { Suspense } from "react";
import { LifeApp } from "@/components";
import { SimulationProvider } from "@/context";
import styles from "./page.module.css";

export default function Home() {
  return (
    <Suspense fallback={<main className={styles.main} />}>
      <SimulationProvider initialRows={16} initialCols={32}>
        <LifeApp />
      </SimulationProvider>
    </Suspense>
  );
}
