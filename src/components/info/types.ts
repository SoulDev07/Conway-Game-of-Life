export type TabKey = "rules" | "controls" | "history" | "faq";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface RuleCardData {
  number: string;
  title: string;
  condition: string;
  description: string;
  type: "death" | "survival" | "birth";
}

export interface ShortcutItemData {
  action: string;
  shortcut: string;
  gesture?: string;
  description: string;
}
