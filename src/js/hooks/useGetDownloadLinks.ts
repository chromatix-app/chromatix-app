import { useEffect, useState } from 'react';
import axios from 'axios';

interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

interface GitHubRelease {
  assets: GitHubAsset[];
}

interface DownloadLink {
  icon: string;
  label: string;
  url: string | null;
}

const FALLBACK_URL = 'https://github.com/chromatix-app/chromatix-release/releases/latest';

interface DownloadLinkConfig {
  icon: string;
  label: string;
  assetMatcher: ((name: string) => boolean) | null;
}

const DOWNLOAD_CONFIGS: DownloadLinkConfig[] = [
  // macOS
  {
    icon: 'AppleSiteIcon',
    label: 'Download for macOS (Apple Silicon)',
    assetMatcher: (name) => name.endsWith('arm64.dmg'),
  },
  {
    icon: 'AppleSiteIcon',
    label: 'Download for macOS (Intel)',
    assetMatcher: (name) => name.endsWith('universal.dmg'),
  },
  // Windows
  {
    icon: 'WindowsSiteIcon',
    label: 'Download for Windows',
    assetMatcher: (name) => name.endsWith('.exe'),
  },
  // Linux
  {
    icon: 'LinuxSiteIcon',
    label: 'Linux coming soon',
    assetMatcher: null,
  },
  // {
  //   icon: 'LinuxSiteIcon',
  //   label: 'Download for Linux (AppImage, ARM64)',
  //   assetMatcher: (name) => name.endsWith('arm64.AppImage'),
  // },
  // {
  //   icon: 'LinuxSiteIcon',
  //   label: 'Download for Linux (AppImage, x64)',
  //   assetMatcher: (name) => name.endsWith('x86_64.AppImage'),
  // },
  // // Linux — .deb (Debian, Ubuntu, etc.)
  // {
  //   icon: 'LinuxSiteIcon',
  //   label: 'Download for Linux (.deb, ARM64)',
  //   assetMatcher: (name) => name.endsWith('arm64.deb'),
  // },
  // {
  //   icon: 'LinuxSiteIcon',
  //   label: 'Download for Linux (.deb, x64)',
  //   assetMatcher: (name) => name.endsWith('amd64.deb'),
  // },
  // // Linux — .rpm (Fedora, RHEL, etc.)
  // {
  //   icon: 'LinuxSiteIcon',
  //   label: 'Download for Linux (.rpm, ARM64)',
  //   assetMatcher: (name) => name.endsWith('aarch64.rpm'),
  // },
  // {
  //   icon: 'LinuxSiteIcon',
  //   label: 'Download for Linux (.rpm, x64)',
  //   assetMatcher: (name) => name.endsWith('x86_64.rpm'),
  // },
];

const DEFAULT_LINKS: DownloadLink[] = DOWNLOAD_CONFIGS.map(({ icon, label, assetMatcher }) => ({
  icon,
  label,
  url: assetMatcher ? FALLBACK_URL : null,
}));

const useGetDownloadLinks = (): DownloadLink[] => {
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>(DEFAULT_LINKS);

  useEffect(() => {
    axios
      .get<GitHubRelease>('https://api.github.com/repos/chromatix-app/chromatix-release/releases/latest')
      .then((response) => {
        const assets = response.data.assets;
        setDownloadLinks(
          DOWNLOAD_CONFIGS.map(({ icon, label, assetMatcher }) => ({
            icon,
            label,
            url: assetMatcher
              ? (assets.find((asset) => assetMatcher(asset.name))?.browser_download_url ?? FALLBACK_URL)
              : null,
          }))
        );
      });
  }, []);

  return downloadLinks;
};

export default useGetDownloadLinks;
