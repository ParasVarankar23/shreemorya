import TestimonialSection from "@/components/home/TestimonalsSection";
import React from "react";

export const metadata = {
    metadataBase: new URL("https://shreemorya.vercel.app"),
    title: "Customer Reviews & Testimonials | Shree Morya Travels",
    description:
        "Read genuine customer reviews and testimonials for Shree Morya Travels. See what passengers say about our safe, comfortable, and reliable bus travel services across Maharashtra.",
    keywords: [
        "Shree Morya Travels testimonials",
        "Shree Morya Travels reviews",
        "Morya Travels customer reviews",
        "bus service reviews Maharashtra",
        "Shrivardhan to Borivali bus reviews",
        "Borli to Virar bus testimonials",
        "Shree Morya Travels feedback",
        "Maharashtra bus travel reviews",
        "customer testimonials bus service",
    ],
    alternates: {
        canonical: "/testimonials",
    },
    openGraph: {
        title: "Customer Reviews & Testimonials | Shree Morya Travels",
        description:
            "Read customer reviews and testimonials for Shree Morya Travels and see why passengers trust our bus travel services across Maharashtra.",
        url: "https://shreemorya.vercel.app/testimonials",
        siteName: "Shree Morya Travels",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Shree Morya Travels Testimonials",
            },
        ],
        locale: "en_IN",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Customer Reviews & Testimonials | Shree Morya Travels",
        description:
            "See what customers say about Shree Morya Travels bus services across Maharashtra.",
        images: ["/og-image.jpg"],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function Page() {
    const testimonialsPageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Customer Reviews & Testimonials | Shree Morya Travels",
        url: "https://shreemorya.vercel.app/testimonials",
        description:
            "Read genuine customer reviews and testimonials for Shree Morya Travels bus services across Maharashtra.",
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
                    __html: JSON.stringify(testimonialsPageSchema),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(organizationSchema),
                }}
            />

            <div>
                <TestimonialSection />
            </div>
        </>
    );
}