import { Tree } from "@weborigami/async-tree";
import { basename, extension, format, resize } from "@weborigami/origami";

export const imageFormatRegex =
  /^(?<basename>[^\-\.].*?)?(-w(?<width>\d+))?.(?<type>avif|gif|png|tiff|webp)$/;

/**
 * Given a tree that contains some .jpg/.jpeg images, return a new tree with the
 * additional images in the specified formats.
 *
 * @param {import("@weborigami/async-tree").Treelike} treelike
 * @param {Array<string>} formatsTreelike
 * @returns {AsyncTree}
 */
export default async function imageFormats(treelike, formatsTreelike) {
  const tree = Tree.from(treelike);
  const formats = await Tree.plain(formatsTreelike);

  return {
    //
    // Match the key against the syntax we support: e.g., `image1-w200.avif`.
    // Note that this function can handle arbitrary keys, not just those the
    // keys() method returns; when running locally you can test at various
    // sizes. The build process will only generate the formats that are
    // requested.
    //
    async get(key) {
      const match = key.match(imageFormatRegex);
      if (!match) {
        // Not a generated image file, return directly from the tree
        return tree.get(key);
      } else {
        // Generate the image in the requested format
        const { width, basename, type } = match.groups;

        // Get the original JPEG image
        const jpegBuffer =
          (await tree.get(`${basename}.jpg`)) ??
          (await tree.get(`${basename}.jpeg`));
        if (!jpegBuffer) {
          return undefined;
        }

        // Resize if requested.
        const resized = width
          ? await resize.call(null, jpegBuffer, { width: parseInt(width) })
          : jpegBuffer;

        // If not resizing, use higher quality
        // const quality = width ? 50 : 60;
        // const formatted = resized[type]({ quality });

        // Format if requested
        // TODO: Do resize and format in one step
        const formatted = type
          ? await format.call(null, resized, type)
          : resized;

        return formatted;
      }
    },

    //
    // Return all the files in the original tree. For JPEG images, return any
    // additional keys for it based on the requested formats.
    //
    async keys() {
      const result = new Set();
      for (const key of await tree.keys()) {
        result.add(key);
        const ext = extension.extname(key);
        if (ext === ".jpg" || ext === ".jpeg") {
          const base = basename(key);
          for (const format of formats) {
            result.add(`${base}${format}`);
          }
        }
      }
      return result;
    },
  };
}
