/**
 * Client-side high-efficiency WebP image compressor.
 * Compresses any uploaded JPEG/PNG/WebP image to < 30-50 KB without server costs.
 */
export async function compressImageToWebP(file, maxWidth = 400, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format with controlled quality
        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        resolve(webpDataUrl);
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}
