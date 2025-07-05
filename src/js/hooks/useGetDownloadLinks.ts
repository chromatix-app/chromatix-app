import { useEffect, useState } from 'react';
import axios from 'axios';

interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

interface GitHubRelease {
  assets: GitHubAsset[];
}

interface DownloadLinks {
  macSiliconDownloadUrl: string;
  macUniversalDownloadUrl: string;
  windowsDownloadUrl: string;
}

/**
 * Custom hook that fetches the latest download links for Chromatix releases from GitHub.
 * Retrieves platform-specific download URLs for macOS (Silicon/Universal) and Windows.
 * @returns Object containing download URLs for different platforms
 */

const useGetDownloadLinks = (): DownloadLinks => {
  const [macSiliconDownloadUrl, setMacSiliconDownloadUrl] = useState(
    'https://github.com/chromatix-app/chromatix-release/releases/latest'
  );
  const [macUniversalDownloadUrl, setMacUniversalDownloadUrl] = useState(
    'https://github.com/chromatix-app/chromatix-release/releases/latest'
  );
  const [windowsDownloadUrl, setWindowsDownloadUrl] = useState(
    'https://github.com/chromatix-app/chromatix-release/releases/latest'
  );

  useEffect(() => {
    axios
      .get<GitHubRelease>('https://api.github.com/repos/chromatix-app/chromatix-release/releases/latest')
      .then((response) => {
        const assets = response.data.assets;

        // console.log(assets);

        const macSiliconAsset = assets.find((asset) => asset.name.endsWith('arm64.dmg'));
        const macUniversalAsset = assets.find((asset) => asset.name.endsWith('universal.dmg'));
        const windowsAsset = assets.find((asset) => asset.name.endsWith('.exe'));

        if (macSiliconAsset) {
          setMacSiliconDownloadUrl(macSiliconAsset.browser_download_url);
        }
        if (macUniversalAsset) {
          setMacUniversalDownloadUrl(macUniversalAsset.browser_download_url);
        }
        if (windowsAsset) {
          setWindowsDownloadUrl(windowsAsset.browser_download_url);
        }
      });
  }, []);

  return {
    macSiliconDownloadUrl,
    macUniversalDownloadUrl,
    windowsDownloadUrl,
  };
};

export default useGetDownloadLinks;
