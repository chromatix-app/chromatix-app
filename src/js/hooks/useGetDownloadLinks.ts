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

interface DownloadLinkDivider {
  kind: 'divider';
}

type DownloadLink = DownloadLinkAsset | DownloadLinkNote | DownloadLinkDivider;

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

interface DownloadLinkConfigDivider {
  kind: 'divider';
}

type DownloadLinkConfig = DownloadLinkConfigAsset | DownloadLinkConfigNote | DownloadLinkConfigDivider;

const DOWNLOAD_CONFIGS: DownloadLinkConfig[] = [
  // macOS
  {
    kind: 'link',
    icon: 'AppleSiteIcon',
    label: 'Download for macOS (Apple Silicon)',
    assetMatcher: (name) => name.endsWith('-mac-arm64.dmg'),
  },
  {
    kind: 'link',
    icon: 'AppleSiteIcon',
    label: 'Download for macOS (Universal)',
    assetMatcher: (name) => name.endsWith('-mac-universal.dmg'),
  },

  // Windows
  {
    kind: 'divider',
  },
  {
    kind: 'link',
    icon: 'WindowsSiteIcon',
    label: 'Download for Windows',
    assetMatcher: (name) => name.endsWith('-windows.exe'),
  },

  // Linux
  {
    kind: 'divider',
  },
  {
    kind: 'link',
    icon: 'LinuxSiteIcon',
    label: 'Download for Linux (AppImage, arm64)',
    assetMatcher: (name) => name.endsWith('-linux-arm64.AppImage'),
  },
  {
    kind: 'link',
    icon: 'LinuxSiteIcon',
    label: 'Download for Linux (AppImage, x86_64)',
    assetMatcher: (name) => name.endsWith('-linux-x86_64.AppImage'),
  },

  // Linux — .deb (Debian, Ubuntu, etc.)
  {
    kind: 'link',
    icon: 'LinuxSiteIcon',
    label: 'Download for Linux (.deb, arm64)',
    assetMatcher: (name) => name.endsWith('-linux-arm64.deb'),
  },
  {
    kind: 'link',
    icon: 'LinuxSiteIcon',
    label: 'Download for Linux (.deb, amd64)',
    assetMatcher: (name) => name.endsWith('-linux-amd64.deb'),
  },

  // Linux — .rpm (Fedora, RHEL, etc.)
  {
    kind: 'link',
    icon: 'LinuxSiteIcon',
    label: 'Download for Linux (.rpm, aarch64)',
    assetMatcher: (name) => name.endsWith('-linux-aarch64.rpm'),
  },
  {
    kind: 'link',
    icon: 'LinuxSiteIcon',
    label: 'Download for Linux (.rpm, x86_64)',
    assetMatcher: (name) => name.endsWith('-linux-x86_64.rpm'),
  },

  // Coming Soon
  // {
  //   kind: 'note',
  //   icon: 'LinuxSiteIcon',
  //   label: 'Linux coming soon',
  // },
];

const getDownloadLink = (config: DownloadLinkConfig, assets?: GitHubAsset[]): DownloadLink => {
  if (config.kind === 'divider') {
    return { kind: 'divider' };
  }

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
