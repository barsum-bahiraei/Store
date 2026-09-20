export type CartItem = {
  id: number;
  productCount: number;
  product: {
    id: number;
    name: string;
    price: number;
    discount: number;
    image: {
      id: number;
      name: string;
      url: string;
      isMain: boolean;
      fileType: number;
    } | null;
  };
};

export type CartCreateInput = {
  productId: number;
  productVariantId: number;
  productCount: number;
};

export type CartUpdateInput = {
  productCount: number;
};

export type CartAction = "increase" | "decrease" | "remove";
