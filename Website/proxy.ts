import { NextRequest, NextResponse } from "next/server";

type ProductSearchItem = {
  id: number;
  name: string;
};

type ProductSearchResponse = {
  isSuccess: boolean;
  data: {
    items: ProductSearchItem[];
  } | null;
};

type CategoryRedirect = {
  id: number;
  label: string;
  needles: string[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://5.10.248.182:8080/api";

const LEGACY_PAGE_REDIRECTS: Record<string, string> = {
  "dashboard": "/account",
  "my-account": "/account",
  "my-orders": "/account?tab=orders",
  "likes": "/account?tab=bookmarks",
  "wishlist": "/account?tab=bookmarks",
  "store-listing": "/shop",
  "brands": "/shop",
  "brands-2": "/shop",
  "affiliate-dashboard": "/cooperation",
  "app-checkout": "/checkout",
  "application-checkout": "/checkout",
  "blog-2": "/blog-1",
  "login-2": "/login",
  "تماس-باما": "/contact",
};

const LEGACY_ARTICLE_REDIRECTS: Record<string, string> = {
  "کوهنوردی-چیست؟": "/blog-1/what-is-mountaineering",
  "صخره-نوردی": "/blog-1/rock-climbing",
  "آموزش-مقدماتی-صخره-نوردی": "/blog-1/beginner-rock-climbing",
  "تفاوت-کوهنوردی،-کوهپیمایی-و-پیمایش": "/blog-1/mountaineering-vs-hiking",
  "شب-مانی-در-طبیعت": "/blog-1/camping-overnight",
  "صفات-کوله-پشتی-کوهنوردی": "/blog-1/hiking-backpack",
  "فاکتورهای-آمادگی-جسمانی": "/blog-1/physical-fitness",
  "کفش-مناسب-کوهنوردی": "/blog-1/hiking-shoes",
  "طناب-در-کوهنوردی-بسیار-مهم-است": "/blog-1/climbing-rope",
  "چادر-مناسب-کوهنوردی": "/blog-1/mountain-tent",
};

const LEGACY_BRAND_REDIRECTS: Record<string, { id: number; label: string }> = {
  "beal": { id: 1, label: "Beal" },
  "ex2": { id: 2, label: "Ex2" },
  "snow-hawk-اسنوهاک": { id: 3, label: "اسنوهاک" },
  "petzl-پتزل": { id: 4, label: "پتزل" },
  "pekynew-پکینیو": { id: 5, label: "پکینیو" },
  "sunree-سانری": { id: 6, label: "سانری" },
  "kailas-کایلاس": { id: 8, label: "کایلاس" },
  "هومتو-humtto": { id: 10, label: "هومتو" },
};

// More-specific rules must come before their parent category rules.
const LEGACY_CATEGORY_REDIRECTS: CategoryRedirect[] = [
  { id: 42, label: "ابزار حمایت و فرود", needles: ["support-and-landing-tools"] },
  { id: 41, label: "ابزار صعود", needles: ["climbing-tool"] },
  { id: 50, label: "اسلک‌لاین", needles: ["slack-line"] },
  { id: 45, label: "اسلینگ و کوییک‌دراو", needles: ["اسلینگ-و-کوییک-دراو"] },
  { id: 27, label: "بخاری سفری", needles: ["بخاری-جیبی"] },
  { id: 25, label: "اجاق و سرشعله", needles: ["stove-burner-and-gas-capsule"] },
  { id: 66, label: "دستکش", needles: ["/دستکش", "clothing-پوشاک/دستکش"] },
  { id: 57, label: "شلوار", needles: ["clothing-پوشاک/شلوار"] },
  { id: 53, label: "کاپشن و بادگیر", needles: ["clothing-پوشاک/کاپشن"] },
  { id: 52, label: "پوشاک", needles: ["clothing-پوشاک", "women-s-dress"] },
  { id: 79, label: "تبر و اره", needles: ["محصولات-چوبی-wooden-products/تبر"] },
  { id: 72, label: "روشنایی و تجهیزات برقی", needles: ["lighting-equipment"] },
  { id: 3, label: "چادر", needles: ["mountaineering-tent"] },
  { id: 10, label: "زیرانداز", needles: ["زیر-انداز-چادر"] },
  { id: 14, label: "میز و صندلی سفری", needles: ["travel-chair"] },
  { id: 43, label: "طناب", needles: ["rope-طناب"] },
  { id: 32, label: "فلاسک و قمقمه", needles: ["cooking-utensils-ظروف-پخت-و-پز/فلاسک"] },
  { id: 28, label: "ظروف", needles: ["cooking-utensils"] },
  { id: 46, label: "قرقره", needles: ["pulley-قرقره"] },
  { id: 44, label: "کارابین", needles: ["carabiner-کارابین"] },
  { id: 38, label: "کرامپون و یخ‌شکن", needles: ["کرامپون-و-یخشکن"] },
  { id: 60, label: "کفش", needles: ["کفش-و-صندل"] },
  { id: 68, label: "کلاه", needles: ["/کلاه"] },
  { id: 20, label: "کیسه آب و کمل‌بک", needles: ["water-bag"] },
  { id: 49, label: "کیسه پودر", needles: ["powder-bag"] },
  { id: 5, label: "خواب و استراحت", needles: ["sleeping-bags-and-sleeping-accessories"] },
  { id: 18, label: "کیف دوچرخه", needles: ["/کیف-دوچرخه"] },
  { id: 39, label: "گتر", needles: ["/گتر"] },
  { id: 71, label: "لوازم جانبی", needles: ["mountaineering-and-hiking-accessories"] },
  { id: 78, label: "بقا و ابزار", needles: ["محصولات-چوبی-wooden-products"] },
  { id: 47, label: "هارنس صعود", needles: ["harns-هارنس"] },
  { id: 37, label: "باتوم و عصا", needles: ["/باتوم"] },
  { id: 15, label: "حمل و نگهداری تجهیزات", needles: ["کوله-پشتی-و-کیف-کمری"] },
  { id: 40, label: "تجهیزات سنگنوردی و کار در ارتفاع", needles: ["sports-climbing-equipment"] },
];

let productListPromise: Promise<ProductSearchItem[]> | null = null;

function safelyDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeProductName(value: string) {
  return safelyDecode(value)
    .toLocaleLowerCase("fa")
    .replaceAll("ي", "ی")
    .replaceAll("ك", "ک")
    .replaceAll("ة", "ه")
    .replaceAll("ۀ", "ه")
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "");
}

function bigrams(value: string) {
  const result = new Set<string>();
  for (let index = 0; index < value.length - 1; index += 1) {
    result.add(value.slice(index, index + 2));
  }
  return result;
}

function similarity(left: string, right: string) {
  if (left === right) return 1;
  if (left.length < 4 || right.length < 4) return 0;

  const leftBigrams = bigrams(left);
  const rightBigrams = bigrams(right);
  let intersection = 0;

  for (const pair of leftBigrams) {
    if (rightBigrams.has(pair)) intersection += 1;
  }

  return (2 * intersection) / (leftBigrams.size + rightBigrams.size);
}

async function getProducts() {
  if (!productListPromise) {
    productListPromise = fetch(`${API_BASE_URL}/Product/Search`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page: 1, pageSize: 2000, isIdDec: true }),
      signal: AbortSignal.timeout(10_000),
    })
      .then(async (response) => {
        if (!response.ok) return [];
        const payload = (await response.json()) as ProductSearchResponse;
        return payload.isSuccess && payload.data ? payload.data.items : [];
      })
      .catch(() => {
        productListPromise = null;
        return [];
      });
  }

  return productListPromise;
}

async function resolveLegacyProduct(slug: string) {
  const legacyName = normalizeProductName(slug);
  if (!legacyName) return null;

  const products = await getProducts();
  const exactMatch = products.find((product) => normalizeProductName(product.name) === legacyName);
  if (exactMatch) return exactMatch;

  let bestMatch: ProductSearchItem | null = null;
  let bestScore = 0;
  let secondBestScore = 0;

  for (const product of products) {
    const score = similarity(legacyName, normalizeProductName(product.name));
    if (score > bestScore) {
      secondBestScore = bestScore;
      bestScore = score;
      bestMatch = product;
    } else if (score > secondBestScore) {
      secondBestScore = score;
    }
  }

  // A strict threshold and score gap prevent redirects to merely similar products.
  return bestScore >= 0.9 && bestScore - secondBestScore >= 0.04 ? bestMatch : null;
}

function redirect(request: NextRequest, destination: string) {
  return NextResponse.redirect(new URL(destination, request.url), 301);
}

export async function proxy(request: NextRequest) {
  const pathname = safelyDecode(request.nextUrl.pathname).replace(/\/+$/, "") || "/";

  if (pathname.startsWith("/product/")) {
    const slug = pathname.slice("/product/".length);
    const product = await resolveLegacyProduct(slug);
    return product ? redirect(request, `/products/${product.id}`) : NextResponse.next();
  }

  if (pathname.startsWith("/product_brand/")) {
    const slug = pathname.slice("/product_brand/".length);
    const brand = LEGACY_BRAND_REDIRECTS[slug];
    if (!brand) return NextResponse.next();

    const params = new URLSearchParams({
      productBrandId: String(brand.id),
    });
    return redirect(request, `/shop?${params.toString()}`);
  }

  if (pathname.startsWith("/product-category/")) {
    const legacyCategoryPath = pathname.slice("/product-category".length);
    const category = LEGACY_CATEGORY_REDIRECTS.find((item) =>
      item.needles.some((needle) => legacyCategoryPath.includes(needle)),
    );

    if (!category) {
      const isGeneralMountaineeringCategory = legacyCategoryPath.includes("mountaineering-and-nature-tourism");
      return isGeneralMountaineeringCategory ? redirect(request, "/shop") : NextResponse.next();
    }

    const params = new URLSearchParams({
      category: String(category.id),
    });
    return redirect(request, `/shop?${params.toString()}`);
  }

  const rootSlug = pathname.slice(1);
  const destination = LEGACY_ARTICLE_REDIRECTS[rootSlug] ?? LEGACY_PAGE_REDIRECTS[rootSlug];
  return destination ? redirect(request, destination) : NextResponse.next();
}

export const config = {
  matcher: [
    "/product/:path*",
    "/product-category/:path*",
    "/product_brand/:path*",
    "/:legacySlug",
  ],
};
