import { Tree } from "@weborigami/async-tree";
import path from "node:path";

const imageFormatRegex = /(w(?<width>\d+))?.(?<type>avif|gif|png|tiff|webp)$/;

/**
 * Generate a `srcset` attribute for a responsive image HTML tag for the given
 * image path and formats.
 *
 * @param {string} imagePath
 * @param {import("@weborigami/async-tree").Treelike} formatsTreelike
 */
export default async function srcset(imagePath, formatsTreelike) {
  const imageDir = path.dirname(imagePath);
  const imageBasename = path.basename(imagePath, path.extname(imagePath));
  const formats = await Tree.plain(formatsTreelike);
  const candidates = formats.map((format) => {
    const match = format.match(imageFormatRegex);
    if (!match) {
      return `${imagePath}-${format}`;
    } else {
      const { width } = match?.groups;
      let candidate = `${imageDir}/${imageBasename}-${format}`;
      if (width) {
        candidate += ` ${width}w`;
      }
      return candidate;
    }
  });
  return candidates.join(", ");
}
