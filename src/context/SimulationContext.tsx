"use client";

import type React from "react";
import { createContext, useContext, useMemo } from "react";
import { type UseSimulationReturn, useSimulation } from "@/hooks/useSimulation";
import { RULE_STRATEGIES } from "@/lib";
import type { RuleStrategy } from "@/types";

export interface SimulationContextValue extends UseSimulationReturn {
  availableRules: RuleStrategy[];
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export interface SimulationProviderProps {
  children: React.ReactNode;
  initialRows?: number;
  initialCols?: number;
}

export const SimulationProvider = ({
  children,
  initialRows = 16,
  initialCols = 32,
}: SimulationProviderProps) => {
  const simulation = useSimulation(initialRows, initialCols);

  const value = useMemo<SimulationContextValue>(
    () => ({
      ...simulation,
      availableRules: RULE_STRATEGIES as RuleStrategy[],
    }),
    [simulation],
  );

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
};

export const useSimulationContext = (): SimulationContextValue => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulationContext must be used within a <SimulationProvider>.");
  }
  return context;
};
