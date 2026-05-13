import { useEffect, useState } from 'react';
import axios from 'axios';

interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

interface GitHubRelease {
  assets: GitHubAsset[];
}

interface DownloadLinkAsset {
  kind: 'link';
  icon: string;
  label: string;
  url: string;
}

interface DownloadLinkNote {
  kind: 'note';
  icon: string;
  label: string;
}

type DownloadLink = DownloadLinkAsset | DownloadLinkNote;

const FALLBACK_URL = 'https://github.com/chromatix-app/chromatix-release/releases/latest';

interface DownloadLinkConfigBase {
  icon: string;
  label: string;
}

interface DownloadLinkConfigAsset extends DownloadLinkConfigBase {
  kind: 'link';
  assetMatcher: (name: string) => boolean;
}

interface DownloadLinkConfigNote extends DownloadLinkConfigBase {
  kind: 'note';
}

type DownloadLinkConfig = DownloadLinkConfigAsset | DownloadLinkConfigNote;

const DOWNLOAD_CONFIGS: DownloadLinkConfig[] = [
  // macOS
  {
    kind: 'link',
    icon: 'AppleSiteIcon',
    label: 'Download for macOS (Apple Silicon)',
    assetMatcher: (name) => name.endsWith('arm64.dmg'),
  },
  {
    kind: 'link',
    icon: 'AppleSiteIcon',
    label: 'Download for macOS (Universal)',
    assetMatcher: (name) => name.endsWith('universal.dmg'),
  },
  // Windows
  {
    kind: 'link',
    icon: 'WindowsSiteIcon',
    label: 'Download for Windows',
    assetMatcher: (name) => name.endsWith('.exe'),
  },
  // Linux
  {
    kind: 'note',
    icon: 'LinuxSiteIcon',
    label: 'Linux coming soon',
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

const getDownloadLink = (config: DownloadLinkConfig, assets?: GitHubAsset[]): DownloadLink => {
  if (config.kind === 'note') {
    return {
      kind: 'note',
      icon: config.icon,
      label: config.label,
    };
  }

  return {
    kind: 'link',
    icon: config.icon,
    label: config.label,
    url: assets?.find((asset) => config.assetMatcher(asset.name))?.browser_download_url ?? FALLBACK_URL,
  };
};

const DEFAULT_LINKS: DownloadLink[] = DOWNLOAD_CONFIGS.map((config) => getDownloadLink(config));

const useGetDownloadLinks = (): DownloadLink[] => {
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>(DEFAULT_LINKS);

  useEffect(() => {
    let isMounted = true;

    axios
      .get<GitHubRelease>('https://api.github.com/repos/chromatix-app/chromatix-release/releases/latest')
      .then((response) => {
        if (!isMounted) {
          return;
        }

        const assets = response.data.assets;
        setDownloadLinks(DOWNLOAD_CONFIGS.map((config) => getDownloadLink(config, assets)));
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setDownloadLinks(DEFAULT_LINKS);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return downloadLinks;
};

export default useGetDownloadLinks;
