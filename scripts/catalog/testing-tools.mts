import type { CatalogTestingTool } from './types.mts';

export const testingTools: Record<string, CatalogTestingTool[]> = {
  applovin: [
    {
      name: 'AppLovin Playable Preview — web and app testing',
      url: 'https://p.applov.in/playablePreview?create=1&qr=1',
    },
  ],
  meta: [
    {
      name: 'Meta Playable Preview — availability requires verification',
      url: 'https://developers.facebook.com/tools/playable-preview/',
    },
  ],
  google: [
    {
      name: 'Google HTML5 Validator',
      url: 'https://h5validator.appspot.com/adwords/asset',
    },
  ],
  liftoff: [
    {
      name: 'Liftoff Creative Lab — dashboard QA guide',
      url: 'https://docs.liftoff.io/creative_lab',
    },
  ],
  mintegral: [
    {
      name: 'Mintegral / Playturbo Playable Testing',
      url: 'https://www.playturbo.com/review',
    },
    {
      name: 'Mintegral testing guide',
      url: 'https://helpcenter.mintegral.com/en/docs/playable-ad-guide',
    },
  ],
  moloco: [
    {
      name: 'Moloco Creative Lab — app setup and account requirements',
      url: 'https://help.moloco.com/hc/en-us/articles/22553113373335-Test-your-creatives',
    },
  ],
  unity: [
    {
      name: 'Unity Ad Testing — Android app',
      url: 'https://play.google.com/store/apps/details?id=com.unity3d.auicreativetestapp',
    },
    {
      name: 'Unity Ad Testing — iOS app',
      url: 'https://apps.apple.com/app/id1463016906',
    },
    {
      name: 'Unity playable testing guide (PDF)',
      url: 'https://storage.googleapis.com/unity-ads-aui-prod-deployments/external-app/UnityAds_Playable_guide.pdf',
    },
  ],
};
