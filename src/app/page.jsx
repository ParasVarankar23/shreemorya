export const metadata = {
  title:
    "Shree Morya Travels | Safe, Comfortable & Reliable Bus Travel in Maharashtra",
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
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "Shree Morya Travels | Safe, Comfortable & Reliable Bus Travel in Maharashtra",
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
};

import HomePageClient from "./HomePageClient";

export default function Page() {
  return <HomePageClient />;
}