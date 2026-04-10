import "./globals.css";
import { Poppins, Kaushan_Script } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/home/FloatingButtons";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const kaushan = Kaushan_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-kaushan",
});

export const metadata = {
  metadataBase: new URL("https://shreemorya.vercel.app"),
  title: {
    default: "Shree Morya Travels | Safe, Comfortable & Reliable Bus Travel in Maharashtra",
    template: "%s | Shree Morya Travels",
  },
  description:
    "Shree Morya Travels offers safe, comfortable, and reliable bus travel services across Maharashtra including Shrivardhan, Borli, Borivali, and Virar. Book your journey with trusted travel support.",
  keywords: [
    "Shree Morya Travels",
    "Morya Travels",
    "bus service Maharashtra",
    "Shrivardhan to Borivali bus",
    "Borli to Virar bus",
    "Maharashtra travel service",
    "comfortable bus travel",
    "safe bus booking Maharashtra",
    "travel agency Maharashtra",
    "bus booking Shree Morya Travels",
    "Shree Morya Travels contact",
    "Shree Morya Travels routes",
    "Shree Morya Travels services",
  ],
  applicationName: "Shree Morya Travels",
  creator: "Shree Morya Travels",
  publisher: "Shree Morya Travels",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Shree Morya Travels | Safe, Comfortable & Reliable Bus Travel in Maharashtra",
    description:
      "Travel across Maharashtra with Shree Morya Travels. Safe, comfortable, and reliable bus services with trusted routes and support.",
    url: "https://shreemorya.vercel.app",
    siteName: "Shree Morya Travels",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Shree Morya Travels",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shree Morya Travels | Safe, Comfortable & Reliable Bus Travel",
    description:
      "Book your journey with Shree Morya Travels for trusted bus travel services across Maharashtra.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f766e",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${kaushan.variable} font-sans`}>
        <Navbar />
        <FloatingButtons />
        {children}
        <Footer />
      </body>
    </html>
  );
}