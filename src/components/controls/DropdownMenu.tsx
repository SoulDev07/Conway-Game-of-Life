import type { Theme } from "@/types";
import styles from "./SimulationControls.module.css";

export interface DropdownOption<T extends string | number> {
  key: T;
  label: string;
  dotColor?: string;
}

export interface DropdownMenuProps<T extends string | number> {
  id: string;
  label: string;
  value: T;
  options: DropdownOption<T>[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (key: T) => void;
  theme: Theme;
  textColor?: string;
}

export const DropdownMenu = <T extends string | number>({
  id,
  label,
  value,
  options,
  isOpen,
  onToggle,
  onClose,
  onSelect,
  theme,
  textColor,
}: DropdownMenuProps<T>) => {
  return (
    <div className={styles.dropdownWrap}>
      <button
        type="button"
        className={styles.btn}
        onClick={onToggle}
        style={{
          borderColor: theme.borderSubtle,
          color: textColor ?? theme.textPrimary,
        }}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={id}
      >
        {label} ▾
      </button>

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
          <div
            id={id}
            className={styles.menu}
            role="listbox"
            aria-label={label}
            style={{
              background: theme.bgSecondary,
              borderColor: theme.borderSubtle,
            }}
          >
            {options.map((opt) => {
              const isSelected = opt.key === value;
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={styles.menuOption}
                  onClick={() => {
                    onSelect(opt.key);
                    onClose();
                  }}
                  style={{
                    color: isSelected ? theme.accentColor : theme.textPrimary,
                    fontWeight: isSelected ? 700 : 400,
                  }}
                >
                  {opt.dotColor && (
                    <span
                      className={styles.themePreviewDot}
                      style={{ background: opt.dotColor }}
                      aria-hidden="true"
                    />
                  )}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
