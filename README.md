This demonstrates generating responsive images in an Origami site.

# Background

Responsive images require you to two things — both of which are tedious to do by hand:

1. For each original image you've got, say foo.jpeg, generate copies of that image at different sizes and possibly different formats: `foo-w500.webp`, `foo-w1000.webp`, etc. For best results, you may also need to crop them differently so that smaller images focus on the important details, although that's generally beyond the scope of this level of tool.
2. Everywhere you have an `<img>` tag that shows an image like foo.jpeg, add a `srcset` attribute that lists all the image file variations along with their widths or pixel densities.

Most tools for automating these steps for a static site run in a post-build step, i.e., after the static files are generated. The tools are generally opaque and directly modify the HTML you've authored. Such tools can do their job properly, but they can also lead to complexity:

- If you have multiple post-build steps to run, your build process can become unwieldy.
- By their nature they typically conceal how exactly they do what they do, which can easily lead to problems when their output isn't what you expected.
- Everyone's needs for such tools can vary. In response tools offer a range of configuration options -- but that leads to additional complexity.
- You have to learn proprietary answers to problems that are already solved by the underlying universal standard.

# Approach

Origami encourages you to understand how your site is built. As a dialect of JavaScript expressions, it's a general programming language, so with a bit of code you can implement responsive images in a more flexible way.

This project uses Origami to address the two needs described above:

1. To generate the images, map the folder of original images to a new, virtual folder that contains the copies of the originals in the desired sizes and formats.
2. For each `<img>` tag, invoke a helper function that generates an appropriate `srcset` attribute for it.

Both tasks are accomplished with functions that you call yourself. Since you control where and when those functions are called, you can adapt this solution if you need something different.

# Formats

We will need to identify the sizes and formats we want for our responsive images. This can be done in array of strings that encode the size and format. In this demo, the strings look like: `.webp` or `w500.avif`.

In order to share the same array of size/format strings across the project, this array is stored in YAML format in the file `src/formats.yaml`:

```yaml
- w200.avif
- w1000.avif
- w2000.avif
```

# Generating the images

The original images are stored in the `src/originals` folder. The `src/site.ori` site definition includes a line that maps this `originals` folder to a virtual `images` folder:

```
{
  // Expand the original images folder with our desired formats
  images/ = imageFormats.js(originals/, formats.yaml)
}
```

When the site is run locally or built, this line will define an `/images` route. For each original image `originals/image1.jpeg`, the virtual `images` folder will contain `/images/image1-w200.avif`, `/images/image1-w1000.avif`, and `/images/image1-w2000.avif`.

When run locally, the virtual set of images is actually infinite in size; it will respond to any appropriately-formatted URL. If you navigate to a URL like `/images/image1-w1500.webp`, that image will be generated on demand.

# Generating the srcset attribute

To reference the generated images in the virtual `/images` folder, an `<img>` tag can invoke a helper function:

```html
<img
  srcset="${ srcset.js(`/images/${imageName}`, formats.yaml) }"
  sizes="100vw"
/>
```

If passed the image name `image1.jpeg`, the helper function generates an appropriate `srcset` value, so the final HTML will be:

```html
<img
  srcset="
    /images/image1-w200.avif   200w,
    /images/image1-w1000.avif 1000w,
    /images/image1-w2000.avif 2000w
  "
  sizes="100vw"
/>
```

These paths reference the generated images.

The helper function only generates the `srcset` attribute, so that you can use standard HTML to specify other `<img>` tag attributes like `sizes`.

# Build

In Origami a build is just a copy operation: it copies the virtual tree defined by `site.ori` into a local `build` folder.

The build process will ask the virtual `images` folder what files it contains, and it will respond with all combinations of the original images and the formats specified in `formats.yaml`. This will result in the generation of a full set of image files at all the desired sizes and formats. These can then be deployed to a static site host or CDN.

# Demo

You can open the [demo](https://origami-srcset-demo.netlify.app) and click on a thumbnail to load a large version of that image. If you bring up your browser's developer tools and switch to the Network tab, you can verify that the browser loads a different image depending on the width of the window.

- If the window is narrow and you hit Reload, the browser loads the `w1000` image.
- If you make the window wider and reload, the browser loads the `w2000` image.
