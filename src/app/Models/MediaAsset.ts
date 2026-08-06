
export enum AssetType {
  FEATURE_VIDEO = 'FEATURE_VIDEO',
  TRAILER = 'TRAILER',
  TEASER = 'TEASER',
  POSTER_IMAGE = 'POSTER_IMAGE',
  SUBTITLE = 'SUBTITLE'
}

export enum VideoQuality {
  SD_480P = 'SD_480P',
  HD_720P = 'HD_720P',
  FHD_1080P = 'FHD_1080P',
  UHD_4K = 'UHD_4K',
  NOT_APPLICABLE = 'NOT_APPLICABLE'
}

export interface MediaAsset {
  id?: number;
  title: string;
  url: string;
  assetType: AssetType;
  quality?: VideoQuality;
  languageCode?: string;
  fileSizeBytes?: number;
  durationSeconds?: number;
  createdAt?: string;
  contentId: number;
}