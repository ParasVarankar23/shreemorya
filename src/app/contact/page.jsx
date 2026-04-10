import ContactSection from "@/components/home/ContactSection";
import React from "react";

export const metadata = {
  metadataBase: new URL("https://shreemorya.vercel.app"),
  title: "Contact Shree Morya Travels | Bus Booking & Travel Support in Maharashtra",
  description:
    "Contact Shree Morya Travels for bus booking, route schedules, pickup points, and travel support across Maharashtra including Shrivardhan, Borli, Borivali, and Virar.",
  keywords: [
    "Shree Morya Travels contact",
    "Morya Travels contact number",
    "Shree Morya Travels booking",
    "bus booking Maharashtra",
    "Shrivardhan to Borivali bus contact",
    "Borli to Borivali bus booking",
    "Virar bus service contact",
    "Maharashtra travel support",
    "Shree Morya Travels WhatsApp",
    "Shree Morya Travels Instagram",
    "Shree Morya Travels Facebook",
    "Shree Morya Travels YouTube",
    "bus route enquiry Maharashtra",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Shree Morya Travels | Bus Booking & Travel Support",
    description:
      "Get in touch with Shree Morya Travels for bus bookings, route schedules, pickup points, and customer support across Maharashtra.",
    url: "https://shreemorya.vercel.app/contact",
    siteName: "Shree Morya Travels",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Shree Morya Travels",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Shree Morya Travels | Bus Booking & Support",
    description:
      "Contact Shree Morya Travels for bus bookings and travel support in Maharashtra.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Shree Morya Travels",
    url: "https://shreemorya.vercel.app/contact",
    description:
      "Contact Shree Morya Travels for bus booking, route schedules, pickup points, and travel support across Maharashtra.",
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
          __html: JSON.stringify(contactPageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      <div>
        <ContactSection />
      </div>
    </>
  );
}