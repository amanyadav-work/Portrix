    import JSZip from 'jszip';

    // Define extensions for classification
    const TEXT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.html', '.md'];
    const BINARY_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'];

    /**
     * Get file extension from filename
     */
    const getExtension = (filename) => {
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts.pop().toLowerCase()}` : '';
    };

    /**
     * Converts base64 zipData into extracted files and image URLs
     * @param {string} base64Zip - base64-encoded zip string
     * @returns {Promise<{ files: Record<string, string | Uint8Array>, imageUrls: Record<string, string> }>}
     */
    export const extractFilesFromZipData = async (base64Zip) => {
    const binaryString = atob(base64Zip);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const zip = await JSZip.loadAsync(bytes);
    const files = {};
    const imageUrls = {};

    await Promise.all(
        Object.keys(zip.files).map(async (filename) => {
        const file = zip.files[filename];
        if (!file.dir) {
            let shortName = filename;

            // Optional: strip top-level folder
            const parts = filename.split('/');
            if (parts.length > 1 && parts[0].includes('repo')) {
            shortName = parts.slice(1).join('/');
            }

            const ext = getExtension(shortName);

            if (TEXT_EXTENSIONS.includes(ext)) {
            files[shortName] = await file.async('string');
            } else if (BINARY_EXTENSIONS.includes(ext)) {
            const binary = await file.async('uint8array');
            files[shortName] = binary;
            imageUrls[shortName] = URL.createObjectURL(new Blob([binary]));
            } else {
            files[shortName] = await file.async('string');
            }
        }
        })
    );

    return { files, imageUrls };
    };



    /**
     * Converts a files object back into a base64 zip string
     * @param {Record<string, string | Uint8Array>} files - files object to zip
     * @returns {Promise<string>} base64-encoded zip string
     */
   export const convertFilesToZipData = async (files) => {
  const zip = new JSZip();

  for (const [filename, content] of Object.entries(files)) {
    if (typeof content === 'string' || content instanceof Uint8Array) {
      zip.file(filename, content);
    } else {
      console.warn(`Skipping unsupported file type for "${filename}"`);
    }
  }

  const uint8Array = await zip.generateAsync({ type: 'uint8array' });

  // Convert Uint8Array to base64 safely without spreading
  const base64Zip = uint8ToBase64(uint8Array);

  return base64Zip;
};

function uint8ToBase64(u8Arr) {
  let CHUNK_SIZE = 0x8000; // arbitrary chunk size for large arrays
  let index = 0;
  let length = u8Arr.length;
  let result = '';
  let slice;

  while (index < length) {
    slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
    result += String.fromCharCode.apply(null, slice);
    index += CHUNK_SIZE;
  }

  return btoa(result);
}

