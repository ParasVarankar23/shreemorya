import RouteSchedule from "@/components/services/RouteSchedule";
import ServiceHero from "@/components/services/ServiceHero";
import WhyChooseService from "@/components/services/WhyChooseService";
import React from "react";

export const metadata = {
  metadataBase: new URL("https://shreemorya.vercel.app"),
  title: "Our Bus Services & Route Schedule | Shree Morya Travels",
  description:
    "Explore Shree Morya Travels bus services, route schedules, pickup points, and why passengers trust our safe, comfortable, and reliable travel services across Maharashtra.",
  keywords: [
    "Shree Morya Travels services",
    "Morya Travels route schedule",
    "bus service Maharashtra",
    "Shrivardhan to Borivali bus service",
    "Borli to Virar bus service",
    "Shree Morya Travels routes",
    "bus timing Maharashtra",
    "travel services Maharashtra",
    "comfortable bus travel Maharashtra",
    "pickup points Shree Morya Travels",
  ],
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Our Bus Services & Route Schedule | Shree Morya Travels",
    description:
      "Explore Shree Morya Travels services, route schedules, and trusted bus travel across Maharashtra.",
    url: "https://shreemorya.vercel.app/services",
    siteName: "Shree Morya Travels",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Shree Morya Travels Services",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Bus Services & Route Schedule | Shree Morya Travels",
    description:
      "Explore Shree Morya Travels services, route schedules, and travel support across Maharashtra.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  const servicesPageSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Bus Travel Service",
    name: "Shree Morya Travels Bus Services",
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
    url: "https://shreemorya.vercel.app/services",
    description:
      "Shree Morya Travels provides safe, comfortable, and reliable bus travel services with regular route schedules across Maharashtra.",
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
          __html: JSON.stringify(servicesPageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      <div>
        <ServiceHero />
        <RouteSchedule />
        <WhyChooseService />
      </div>
    </>
  );
}