export enum SellerStatus {
  Pending = 0,
  Active = 1,
  Suspended = 2,
  Rejected = 3,
}

export interface SellerImage {
  id: number;
  name: string;
  url: string;
  isMain: boolean;
  fileType: number;
}

export interface SellerCreateInput {
  name: string;
  description: string;
}

export interface SellerUpdateInput {
  name: string;
  description: string | null;
  status: SellerStatus;
}

export interface SellerImageSaveInput {
  file: File;
  name: string;
  sellerId: number;
  imageId?: number;
  fileType: 0 | 3;
}

export interface SellerImageOutput extends SellerImage {
  tableName: 1;
  targetId: number;
  targetName: 1;
}

export interface SellerListOutput {
  id: number;
  name: string;
  description: string | null;
  status: SellerStatus;
  image: SellerImage | null;
}

export interface SellerGetOutput extends Omit<SellerListOutput, "image"> {
  images: SellerImage[];
}

export interface SellerCreateOutput extends Omit<SellerListOutput, "image"> {}
export interface SellerUpdateOutput extends SellerCreateOutput {}
