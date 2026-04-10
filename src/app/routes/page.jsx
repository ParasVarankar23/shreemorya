import RouteHero from "@/components/routes/RouteHero";
import RouteScheduleGrid from "@/components/routes/RouteScheduleGrid";
import React from "react";

export const metadata = {
  metadataBase: new URL("https://shreemorya.vercel.app"),
  title: "Bus Routes & Pickup Points | Shree Morya Travels",
  description:
    "Explore Shree Morya Travels bus routes, pickup points, and route schedules across Maharashtra including Shrivardhan, Borli, Borivali, and Virar.",
  keywords: [
    "Shree Morya Travels routes",
    "Morya Travels route schedule",
    "bus routes Maharashtra",
    "Shrivardhan to Borivali bus route",
    "Borli to Virar bus route",
    "Shree Morya Travels pickup points",
    "Maharashtra bus timing",
    "route schedule bus service",
    "bus boarding points Maharashtra",
    "Shree Morya Travels schedule",
  ],
  alternates: {
    canonical: "/routes",
  },
  openGraph: {
    title: "Bus Routes & Pickup Points | Shree Morya Travels",
    description:
      "Explore Shree Morya Travels bus routes, pickup points, and route schedules across Maharashtra.",
    url: "https://shreemorya.vercel.app/routes",
    siteName: "Shree Morya Travels",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Shree Morya Travels Routes",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bus Routes & Pickup Points | Shree Morya Travels",
    description:
      "Explore Shree Morya Travels bus routes and route schedules across Maharashtra.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  const routesPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Bus Routes & Pickup Points | Shree Morya Travels",
    url: "https://shreemorya.vercel.app/routes",
    description:
      "Explore Shree Morya Travels bus routes, pickup points, and route schedules across Maharashtra including Shrivardhan, Borli, Borivali, and Virar.",
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Bus Route and Travel Service",
    name: "Shree Morya Travels Routes and Pickup Points",
    provider: {
      "@type": "TravelAgency",
      name: "Shree Morya Travels",
      url: "https://shreemorya.vercel.app",
    },
    areaServed: [
      "Shrivardhan",
      "Borli",
      "Borivali",
      "Virar",
      "Mumbai",
      "Maharashtra",
    ],
    url: "https://shreemorya.vercel.app/routes",
    description:
      "Shree Morya Travels provides regular bus routes, pickup points, and reliable travel schedules across Maharashtra.",
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Shree Morya Travels",
    url: "https://shreemorya.vercel.app",
    logo: "https://shreemorya.vercel.app/og-image.jpg",
    image: "https://shreemorya.vercel.app/og-image.jpg",
    telephone: "+91 8888157744",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91 8888157744",
      contactType: "customer support",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi", "Marathi"],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    areaServed: [
      "Shrivardhan",
      "Borli",
      "Borivali",
      "Virar",
      "Mumbai",
      "Maharashtra",
    ],
    sameAs: [
      "https://wa.me/918888157744",
      "https://www.instagram.com/shree-morya",
      "https://www.facebook.com/shree-morya",
      "https://www.youtube.com/@shree-morya",
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(routesPageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      <div>
        <RouteHero />
        <RouteScheduleGrid />
      </div>
    </>
  );
}