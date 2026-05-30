const MAX_PX   = 1200;
const QUALITY  = 0.85;
const MIME_OUT = "image/jpeg";

export async function compressImageFile(file: File): Promise<File> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img  = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width <= MAX_PX && height <= MAX_PX) {
        // Already small enough — return original to avoid re-encoding artefacts
        resolve(file);
        return;
      }

      if (width > height) {
        height = Math.round((height / width) * MAX_PX);
        width  = MAX_PX;
      } else {
        width  = Math.round((width / height) * MAX_PX);
        height = MAX_PX;
      }

      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // Compressed is larger — keep original
            resolve(file);
          } else {
            const name = file.name.replace(/\.[^.]+$/, ".jpg");
            resolve(new File([blob], name, { type: MIME_OUT, lastModified: Date.now() }));
          }
        },
        MIME_OUT,
        QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Not a valid image — pass through unchanged
    };

    img.src = url;
  });
}

/** Process a batch of picked files: compress images, pass other types through. */
export async function compressPickedFiles(files: File[]): Promise<File[]> {
  return Promise.all(
    files.map((f) => (f.type.startsWith("image/") ? compressImageFile(f) : Promise.resolve(f))),
  );
}
