export type HeroSlide = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

export type FeaturedProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  imageAlt: string;
};

export const heroSlides: HeroSlide[] = [
  {
    title: "Time, styled your way.",
    description: "Considered accessories for every plan, from early starts to late arrivals.",
    image: "/images/home/hero-watch.jpg",
    imageAlt: "Minimal wristwatch displayed on a neutral surface",
  },
  {
    title: "Fresh steps start here.",
    description: "New-season sneakers built to bring comfort and color to every day.",
    image: "/images/home/hero-sneaker.jpg",
    imageAlt: "Bright red sneaker against a matching backdrop",
  },
  {
    title: "Turn up the everyday.",
    description: "Immersive sound and all-day comfort for work, travel, and everything between.",
    image: "/images/home/hero-headphones.jpg",
    imageAlt: "Black over-ear headphones on a warm yellow background",
  },
];

export const featuredProducts: FeaturedProduct[] = [
  {
    id: 1,
    name: "Studio Wireless Headphones",
    category: "Audio",
    price: 189,
    originalPrice: 229,
    image: "/images/home/hero-headphones.jpg",
    imageAlt: "Black wireless over-ear headphones",
  },
  {
    id: 2,
    name: "Everyday Analog Watch",
    category: "Accessories",
    price: 119,
    image: "/images/home/hero-watch.jpg",
    imageAlt: "Minimal analog wristwatch",
  },
  {
    id: 3,
    name: "Street Runner Sneakers",
    category: "Footwear",
    price: 84,
    originalPrice: 105,
    image: "/images/home/product-shoes.jpg",
    imageAlt: "Casual sneakers on a city street",
  },
  {
    id: 4,
    name: "Classic Instant Camera",
    category: "Cameras",
    price: 149,
    image: "/images/home/product-camera.jpg",
    imageAlt: "Classic compact camera held in two hands",
  },
  {
    id: 5,
    name: "Signature Eau de Parfum",
    category: "Beauty",
    price: 72,
    originalPrice: 90,
    image: "/images/home/product-perfume.jpg",
    imageAlt: "Glass perfume bottle on a light surface",
  },
  {
    id: 6,
    name: "Frame One Sunglasses",
    category: "Accessories",
    price: 58,
    image: "/images/home/product-sunglasses.jpg",
    imageAlt: "Black sunglasses on a yellow surface",
  },
  {
    id: 7,
    name: "Court Low Sneakers",
    category: "Footwear",
    price: 96,
    image: "/images/home/hero-sneaker.jpg",
    imageAlt: "Red low-top sneaker",
  },
];
