"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Bridges the lab header (rendered by the layout) to the editor's handlers,
 * which live in `ExpressionEditor`'s state. The editor registers on mount; the
 * header renders its buttons disabled until it does.
 */

/** Returns true on success so the header can show a transient result. */
export type ExportHandler = () => boolean;

interface LabActionsValue {
  exportPack: ExportHandler | null;
  registerExport: (fn: ExportHandler | null) => void;
}

const LabActionsContext = createContext<LabActionsValue | null>(null);

export function LabActionsProvider({ children }: { children: ReactNode }) {
  const [exportPack, setExportPack] = useState<ExportHandler | null>(null);

  // Wrapped in a thunk so React does not treat the handler as a state updater.
  const registerExport = useCallback((fn: ExportHandler | null) => {
    setExportPack(() => fn);
  }, []);

  const value = useMemo(() => ({ exportPack, registerExport }), [exportPack, registerExport]);

  return <LabActionsContext.Provider value={value}>{children}</LabActionsContext.Provider>;
}

export function useLabActions(): LabActionsValue {
  const ctx = useContext(LabActionsContext);
  if (!ctx) throw new Error("useLabActions must be used inside a LabActionsProvider");
  return ctx;
}
