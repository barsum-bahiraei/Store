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

export type CreateCartItemInput = {
  productId: number;
  productCount: 1;
};

export type UpdateCartItemInput = {
  productCount: number;
};

export type CartAction = "increase" | "decrease" | "remove";
