import { FacePackError, presetToPack } from "@/lib/face-pack";
import { getPreset } from "@/lib/presets-db";

/**
 * Serves a saved preset as a face pack, so the SDK can `nori-face pull <id>`.
 *
 * Reads go through the same RLS-bound client as the library, so this only ever
 * returns a public preset or one owned by the signed-in caller.
 */
export async function GET(_request: Request, ctx: RouteContext<"/api/packs/[id]">) {
  const { id } = await ctx.params;

  const preset = await getPreset(id);
  if (!preset) {
    return Response.json({ error: "No such pack." }, { status: 404 });
  }

  try {
    return Response.json(presetToPack(preset), {
      headers: { "Cache-Control": "public, max-age=0, must-revalidate" },
    });
  } catch (err) {
    if (err instanceof FacePackError) {
      return Response.json({ error: err.message }, { status: 422 });
    }
    throw err;
  }
}
