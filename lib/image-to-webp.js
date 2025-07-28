import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Array of paired source and output directories
const directories = [
  {
    input: './public/images/original',
    output: './public/images/compressed',
  },
];

function convertImagesToWebp(inputDir, outputDir) {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Check if input directory exists
  if (!fs.existsSync(inputDir)) {
    console.warn(`Input directory does not exist: ${inputDir}`);
    return;
  }

  fs.readdirSync(inputDir).forEach((file) => {
    const ext = path.extname(file).toLowerCase();

    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, path.basename(file, ext) + '.webp');

      // Configure WebP options based on file type
      const webpOptions = {
        quality: 80,
        effort: 6, // 0-6, where 6 is the slowest but best quality
      };

      // For PNG files, preserve transparency
      if (ext === '.png') {
        webpOptions.lossless = false; // Set to true if you want lossless compression for PNGs
        webpOptions.alphaQuality = 80; // Quality for alpha channel
      }

      sharp(inputPath)
        .webp(webpOptions)
        .toFile(outputPath)
        .then(() => console.log(`${file} converted to WebP in ${outputDir}`))
        .catch((err) => console.error(`Error converting ${file}:`, err));
    }
  });
}

// Process each directory pair
directories.forEach(({ input, output }) => {
  console.log(`Processing: ${input} -> ${output}`);
  convertImagesToWebp(input, output);
});
