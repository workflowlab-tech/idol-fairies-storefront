/**
 * Supabase Storage's "public" bucket flag allows anonymous GET-by-path
 * (confirmed working), but NOT anonymous listing — that needs a separate
 * RLS policy on storage.objects, which would mean another SQL step. Rather
 * than ask for one, each product's image folder gets a small
 * `manifest.json` (e.g. ["1.jpg","2.jpg","3.jpg"]) written by this
 * (service-role) script, which the public app can fetch directly by path
 * — the same plain public GET that already works for the images
 * themselves, no listing required.
 *
 * Run once after any image upload run: npx tsx --env-file=.env.local scripts/generate-image-manifests.ts
 */
import { createServiceRoleClient } from "../lib/supabase/server";

const STORAGE_BUCKET = "product-images";

async function main() {
  const supabase = createServiceRoleClient();
  const { data: products, error } = await supabase.from("products").select("slug,image_url");
  if (error) throw new Error(error.message);

  let written = 0;
  for (const product of products) {
    if (!product.image_url || !product.image_url.includes(`/${STORAGE_BUCKET}/`)) continue;

    const { data: files, error: listError } = await supabase.storage.from(STORAGE_BUCKET).list(product.slug);
    if (listError || !files) {
      console.error(`  list failed for ${product.slug}:`, listError?.message);
      continue;
    }

    const imageFiles = files
      .filter((f) => /^\d+\./.test(f.name))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name))
      .map((f) => f.name);
    if (imageFiles.length === 0) continue;

    const manifest = JSON.stringify(imageFiles);
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(`${product.slug}/manifest.json`, Buffer.from(manifest), {
        contentType: "application/json",
        upsert: true,
      });
    if (uploadError) {
      console.error(`  manifest upload failed for ${product.slug}:`, uploadError.message);
      continue;
    }
    written += 1;
  }

  console.log(`Wrote ${written} manifest.json file(s).`);
}

main().catch((err) => {
  console.error("[generate-image-manifests] failed:", err);
  process.exit(1);
});
