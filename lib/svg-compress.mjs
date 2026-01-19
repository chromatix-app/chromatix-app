import { optimize } from 'svgo';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

// Get skip flag from command line arguments
const skipExisting = process.argv.includes('--skip-existing');

// Array of paired source and output directories
const directories = [
  {
    input: './src/js/components/Icon/icons/general-original',
    output: './src/js/components/Icon/icons/general-compressed',
  },
  {
    input: './src/js/components/Icon/icons/site-original',
    output: './src/js/components/Icon/icons/site-compressed',
  },
];

// Configuration for SVGO
const svgoConfig = {
  plugins: [
    // Keep most plugins for lossless compression
    'preset-default',
    {
      name: 'removeViewBox',
      active: false, // Keep viewBox for responsive SVGs
    },
    {
      name: 'removeDimensions',
      active: false, // Keep width/height attributes
    },
    {
      name: 'removeTitle',
      active: false, // Keep titles for accessibility
    },
    {
      name: 'removeDesc',
      active: false, // Keep descriptions for accessibility
    },
  ],
};

// Counters
let totalFiles = 0;
let totalOriginalSize = 0;
let totalSizeSaved = 0;

function compressSvg(inputDir, outputDir) {
  // Check if input directory exists
  if (!fs.existsSync(inputDir)) {
    console.warn(chalk.red(`✗ Input doesn't exist: ${inputDir}`));
    return;
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get all SVG files recursively
  function getSvgFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Recursively get SVG files from subdirectories
        files.push(...getSvgFiles(fullPath));
      } else if (path.extname(item).toLowerCase() === '.svg') {
        files.push(fullPath);
      }
    });

    return files;
  }

  const svgFiles = getSvgFiles(inputDir);

  if (svgFiles.length === 0) {
    console.warn(chalk.red(`✗ No SVG files found: ${inputDir}`));
    return;
  }

  console.log(chalk.cyan(`▶ ${inputDir} => ${outputDir}`));

  svgFiles.forEach((filePath) => {
    try {
      // Create relative path structure in output directory
      const relativePath = path.relative(inputDir, filePath);
      const outputPath = path.join(outputDir, relativePath);
      const outputDirPath = path.dirname(outputPath);

      // Skip if file already exists and skip flag is set
      if (skipExisting && fs.existsSync(outputPath)) {
        return;
      }

      const svgContent = fs.readFileSync(filePath, 'utf8');
      const originalSize = Buffer.byteLength(svgContent, 'utf8');

      const result = optimize(svgContent, {
        path: filePath,
        ...svgoConfig,
      });

      const optimizedSize = Buffer.byteLength(result.data, 'utf8');
      const savings = ((originalSize - optimizedSize) / originalSize) * 100;

      // Create output subdirectories if they don't exist
      if (!fs.existsSync(outputDirPath)) {
        fs.mkdirSync(outputDirPath, { recursive: true });
      }

      // Write optimized SVG to output directory
      fs.writeFileSync(outputPath, result.data, 'utf8');

      // Increment counts
      totalFiles += 1;
      totalOriginalSize += originalSize;
      totalSizeSaved += originalSize - optimizedSize;

      // Log compression result
      console.log(`✓ ${relativePath} (${savings.toFixed(1)}% smaller)`);
    } catch (error) {
      console.error(`✗ Error converting ${filePath}:`, error.message);
    }
  });
}

// Helper - pretty units
const prettyUnits = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} kB`;
  else return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Process each directory pair
console.log(chalk.bgCyan(`# Optimising SVG files`));
directories.forEach(({ input, output }) => {
  compressSvg(input, output);
});
const percentSaved = totalOriginalSize > 0 ? ((totalSizeSaved / totalOriginalSize) * 100).toFixed(1) : 0;
console.log(
  chalk.bgCyan(`✓ Optimised ${totalFiles} SVG files and saved ${prettyUnits(totalSizeSaved)} (${percentSaved}%)`)
);
