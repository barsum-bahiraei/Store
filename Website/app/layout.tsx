import type { Metadata } from "next";
import localFont from "next/font/local";
import "material-symbols/rounded.css";
import "./globals.css";
import { Providers } from "./providers";

const iranSans = localFont({
  variable: "--font-iran-sans",
  display: "swap",
  src: [
    { path: "../assets/fonts/iran-sans/woff2/IRANSansWebFaNum_Light.woff2", weight: "300" },
    { path: "../assets/fonts/iran-sans/woff2/IRANSansWebFaNum.woff2", weight: "400" },
    { path: "../assets/fonts/iran-sans/woff2/IRANSansWebFaNum_Medium.woff2", weight: "500" },
    { path: "../assets/fonts/iran-sans/woff2/IRANSansWebFaNum_Bold.woff2", weight: "700" },
    { path: "../assets/fonts/iran-sans/woff2/IRANSansWebFaNum_Black.woff2", weight: "900" },
  ],
});

export const metadata: Metadata = {
  title: "فروشگاه",
  description: "محصولات منتخب برای زندگی روزمره را پیدا کنید.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${iranSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
