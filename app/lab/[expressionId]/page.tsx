import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getPreset } from "@/lib/presets-db";
import ExpressionEditor from "@/components/playground/ExpressionEditor";

export const metadata = {
  title: "Expression Lab — Nori Robotics",
};

/**
 * Opens a saved preset in the playground for remixing. The preset is fetched
 * at request time (dynamic param + uncached read), so the data access is kept
 * inside a `<Suspense>` boundary per the app's Cache Components setup.
 */
export default function PresetLabPage(props: PageProps<"/lab/[expressionId]">) {
  return (
    <Suspense fallback={<EditorLoading />}>
      <PresetLoader params={props.params} />
    </Suspense>
  );
}

async function PresetLoader({
  params,
}: {
  params: Promise<{ expressionId: string }>;
}) {
  const { expressionId } = await params;
  const preset = await getPreset(expressionId);
  if (!preset) notFound();
  return <ExpressionEditor initialPreset={preset} />;
}

function EditorLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <span className="text-[13px] text-white/40">Loading preset…</span>
    </div>
  );
}
