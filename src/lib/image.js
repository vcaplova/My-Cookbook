// Resizes and compresses a locally-picked image file entirely in the
// browser, returning a compact JPEG data URL. Nothing is uploaded anywhere —
// this just keeps embedded recipe photos from eating the localStorage quota.

const MAX_WIDTH = 900;
const JPEG_QUALITY = 0.75;

export function compressImageFile(file, maxWidth = MAX_WIDTH, quality = JPEG_QUALITY) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not open that image.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (e) {
          reject(e);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function approxKB(dataUrl) {
  // Base64 is ~4/3 the size of the raw bytes.
  return Math.round((dataUrl.length * 0.75) / 1024);
}
