import { permanentRedirect } from "next/navigation";

export default async function SearchRedirect({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) query.append(key, item);
    } else if (value !== undefined) {
      query.set(key, value);
    }
  }
  permanentRedirect(query.size ? `/shop?${query.toString()}` : "/shop");
}
