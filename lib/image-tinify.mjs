import chalk from 'chalk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import tinify from 'tinify';

// Load environment variables from .env
dotenv.config({ path: '.env' });

// Tinify API key
tinify.key = process.env.TINIFY_API_KEY;

// Get skip flag from command line arguments
const skipExisting = process.argv.includes('--skip-existing');

// Array of paired source and output directories
const directories = [
  {
    input: './public/images/original',
    output: './public/images/compressed',
  },
];

// Counters
let totalFiles = 0;
let totalOriginalSize = 0;
let totalSizeSaved = 0;

async function compressImages(inputDir, outputDir) {
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
  const compressionPromises = [];

  files.forEach((file) => {
    const ext = path.extname(file).toLowerCase();

    // Tinify supports PNG and JPEG files
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);

      // Skip if file already exists and skip flag is set
      if (skipExisting && fs.existsSync(outputPath)) {
        return;
      }

      // Get original file size
      const originalSize = fs.statSync(inputPath).size;

      const compressionPromise = (async () => {
        try {
          const source = tinify.fromFile(inputPath);
          await source.toFile(outputPath);

          // Get output file size and calculate savings
          const outputSize = fs.statSync(outputPath).size;
          const savings = ((originalSize - outputSize) / originalSize) * 100;

          // Update counters
          totalFiles += 1;
          totalOriginalSize += originalSize;
          totalSizeSaved += originalSize - outputSize;

          console.log(`✓ ${file} (${savings.toFixed(1)}% smaller)`);
        } catch (error) {
          // Error handling
          if (error instanceof tinify.AccountError) {
            console.error(chalk.red('✗ Account error (verify your API key and account status):'));
            console.error(error.message);
          } else if (error instanceof tinify.ClientError) {
            console.error(chalk.red('✗ Client error (check your source image and request options):'));
            console.error(error.message);
          } else if (error instanceof tinify.ServerError) {
            console.error(chalk.red('✗ Server error (temporary issue with the Tinify API):'));
            console.error(error.message);
          } else if (error instanceof tinify.ConnectionError) {
            console.error(chalk.red('✗ Connection error (network issue):'));
            console.error(error.message);
          } else {
            console.error(chalk.red(`✗ Error compressing ${file}:`));
            console.error(error.message);
          }
        }
      })();

      compressionPromises.push(compressionPromise);
    }
  });

  // Wait for all compressions to complete
  await Promise.all(compressionPromises);
}

// Helper - pretty units
const prettyUnits = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} kB`;
  else return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Helper - display API usage info
async function displayUsage() {
  try {
    await tinify.validate();
    console.log(chalk.cyan(`! Compressions this month: ${tinify.compressionCount}`));
  } catch (_error) {
    console.warn(chalk.cyan('! Could not retrieve compression count'));
  }
}

// Process each directory pair
async function processDirectories() {
  console.log(chalk.bgCyan(`# Tinifying images`));

  for (const { input, output } of directories) {
    await compressImages(input, output);
  }

  await displayUsage();

  const percentSaved = totalOriginalSize > 0 ? ((totalSizeSaved / totalOriginalSize) * 100).toFixed(1) : 0;

  console.log(
    chalk.bgCyan(`✓ Tinified ${totalFiles} images and saved ${prettyUnits(totalSizeSaved)} (${percentSaved}%)`)
  );
}

processDirectories();
