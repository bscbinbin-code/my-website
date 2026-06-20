import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = path.join(root, "Photos", "photoext");
const outputDir = path.join(root, "public", "portfolio", "more");
const manifestPath = path.join(root, "src", "data", "more-photos.json");

const sourceFiles = (await fs.readdir(sourceDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => /\.(jpe?g|png|webp)$/i.test(name))
  .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

await fs.mkdir(outputDir, { recursive: true });

const photos = [];

for (const [index, fileName] of sourceFiles.entries()) {
  const id = index + 1;
  const sourcePath = path.join(sourceDir, fileName);
  const outputName = `more-${String(id).padStart(2, "0")}.webp`;
  const outputPath = path.join(outputDir, outputName);

  await sharp(sourcePath, { failOn: "none" })
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82, effort: 5 })
    .toFile(outputPath);

  const metadata = await sharp(outputPath).metadata();
  const width = metadata.width ?? 1;
  const height = metadata.height ?? 1;
  const ratio = width / height;

  photos.push({
    id,
    title: `More photo ${String(id).padStart(2, "0")}`,
    originalName: fileName,
    src: `/portfolio/more/${outputName}`,
    width,
    height,
    orientation: ratio > 1.08 ? "landscape" : ratio < 0.92 ? "portrait" : "square",
    ratio: Number(ratio.toFixed(4)),
  });
}

await fs.writeFile(manifestPath, `${JSON.stringify(photos, null, 2)}\n`, "utf8");

console.log(`Generated ${photos.length} more photos in ${outputDir}`);
