import type { RuleStrategy } from "@/types";

/**
 * Cellular Automata Rulesets.
 * Bitmasks are precomputed for fast bitwise evaluations: (mask & (1 << neighbors)) !== 0
 */
export function createRuleStrategy(
  id: string,
  name: string,
  notation: string,
  description: string,
  birth: readonly number[],
  survival: readonly number[],
): RuleStrategy {
  const birthMask = birth.reduce((acc, n) => acc | (1 << n), 0);
  const survivalMask = survival.reduce((acc, n) => acc | (1 << n), 0);

  return {
    id,
    name,
    notation,
    description,
    birth,
    survival,
    birthMask,
    survivalMask,
    evaluate: (isAlive: boolean, neighbors: number) => {
      const bit = 1 << neighbors;
      return isAlive ? (survivalMask & bit) !== 0 : (birthMask & bit) !== 0;
    },
  };
}

export const CONWAY_RULE: RuleStrategy = createRuleStrategy(
  "conway",
  "Conway's Life",
  "B3/S23",
  "The classic standard: balanced chaos, gliders, and emergent computation.",
  [3],
  [2, 3],
);

export const RULE_STRATEGIES: RuleStrategy[] = [CONWAY_RULE];

export const RULE_MAP = new Map<string, RuleStrategy>(
  RULE_STRATEGIES.map((rule) => [rule.id, rule]),
);

export function getRuleStrategy(id: string): RuleStrategy {
  return RULE_MAP.get(id) || CONWAY_RULE;
}
