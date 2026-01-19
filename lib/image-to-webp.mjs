import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Get skip flag from command line arguments
const skipExisting = process.argv.includes('--skip-existing');

// Array of paired source and output directories
const directories = [
  {
    input: './public/images/original',
    output: './public/images/webp',
  },
];

// Compression options
const imgOptions = {
  quality: 80,
  effort: 6, // 0-6, where 6 is the slowest but best quality
};
const alphaOptions = {
  lossless: false,
  quality: 80, // Quality for alpha channel
};

// Counters
let totalFiles = 0;
let totalOriginalSize = 0;
let totalSizeSaved = 0;

async function convertImagesToWebp(inputDir, outputDir) {
  // Check if input directory exists
  if (!fs.existsSync(inputDir)) {
    console.warn(chalk.red(`✗ Input doesn't exist: ${inputDir}`));
    return;
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(chalk.cyan(`▶ ${inputDir} => ${outputDir}`));

  const files = fs.readdirSync(inputDir);
  const conversionPromises = [];

  files.forEach((file) => {
    const ext = path.extname(file).toLowerCase();

    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, path.basename(file, ext) + '.webp');

      // Skip if file already exists and skip flag is set
      if (skipExisting && fs.existsSync(outputPath)) {
        return;
      }

      // Get original file size
      const originalSize = fs.statSync(inputPath).size;

      // Configure WebP options based on file type
      const webpOptions = { ...imgOptions };

      // For PNG files, preserve transparency
      if (ext === '.png') {
        Object.assign(webpOptions, alphaOptions);
      }

      const conversionPromise = sharp(inputPath)
        .webp(webpOptions)
        .toFile(outputPath)
        .then(() => {
          // Get output file size and calculate savings
          const outputSize = fs.statSync(outputPath).size;
          const savings = ((originalSize - outputSize) / originalSize) * 100;

          // Update counters
          totalFiles += 1;
          totalOriginalSize += originalSize;
          totalSizeSaved += originalSize - outputSize;

          console.log(`✓ ${file} (${savings.toFixed(1)}% smaller)`);
        })
        .catch((error) => console.error(`✗ Error converting ${file}:`, error.message));

      conversionPromises.push(conversionPromise);
    }
  });

  // Wait for all conversions to complete
  await Promise.all(conversionPromises);
}

// Helper - pretty units
const prettyUnits = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} kB`;
  else return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Process each directory pair
async function processDirectories() {
  console.log(chalk.bgCyan(`# Converting images to WebP`));

  for (const { input, output } of directories) {
    await convertImagesToWebp(input, output);
  }

  const percentSaved = totalOriginalSize > 0 ? ((totalSizeSaved / totalOriginalSize) * 100).toFixed(1) : 0;

  console.log(
    chalk.bgCyan(`✓ Converted ${totalFiles} images to WebP and saved ${prettyUnits(totalSizeSaved)} (${percentSaved}%)`)
  );
}

processDirectories();
