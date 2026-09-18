export interface BrandImage {
  id: number;
  name: string;
  url: string;
  isMain: boolean;
  fileType: number;
}

export interface Brand {
  id: number;
  name: string;
  image: BrandImage | null;
}

export interface BrandInput {
  name: string;
}

export interface BrandSaveOutput {
  id: number;
  name: string;
}

export interface BrandImageSaveInput {
  file: File;
  name: string;
  brandId: number;
  imageId?: number;
  fileType: 0 | 3;
}
