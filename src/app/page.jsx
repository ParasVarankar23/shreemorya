"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import HeroSection from "@/components/home/HeroSection";
import BlogsSection from "@/components/home/BlogsSection";
import EasySteps from "@/components/home/EasySteps";
import PackagesSection from "@/components/home/PackagesSection";
import TestimonialSection from "@/components/home/TestimonalsSection";
import ContactSection from "@/components/home/ContactSection";
import NewsSection from "@/components/home/NewsSection";
import CallUsSection from "@/components/home/CallUsSection";
import ExperienceSection from "@/components/home/ExperienceSection";

export default function Page() {
  const heroTitleRef = useRef(null);
  const heroTextRef = useRef(null);
  const heroButtonsRef = useRef(null);
  const bookingRef = useRef(null);
  const rightVisualRef = useRef(null);
  const busCardRef = useRef(null);
  const ladyCardRef = useRef(null);
  const discountRef = useRef(null);
  const heroTiltRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(heroTitleRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.9,
    })
      .from(
        heroTextRef.current,
        {
          y: 20,
          opacity: 0,
          duration: 0.7,
        },
        "-=0.45"
      )
      .from(
        heroButtonsRef.current,
        {
          y: 18,
          opacity: 0,
          duration: 0.6,
        },
        "-=0.35"
      )
      .from(
        bookingRef.current,
        {
          y: 25,
          opacity: 0,
          scale: 0.97,
          duration: 0.7,
        },
        "-=0.25"
      )
      .from(
        rightVisualRef.current,
        {
          x: 50,
          opacity: 0,
          duration: 0.9,
        },
        "-=0.55"
      )
      .from(
        ladyCardRef.current,
        {
          y: 25,
          opacity: 0,
          rotate: -6,
          duration: 0.6,
        },
        "-=0.45"
      )
      .from(
        busCardRef.current,
        {
          x: -20,
          opacity: 0,
          duration: 0.6,
        },
        "-=0.35"
      )
      .from(
        discountRef.current,
        {
          scale: 0.8,
          opacity: 0,
          duration: 0.45,
        },
        "-=0.35"
      );

    if (busCardRef.current) {
      gsap.to(busCardRef.current, {
        y: -10,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    if (discountRef.current) {
      gsap.to(discountRef.current, {
        y: -7,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    if (ladyCardRef.current) {
      gsap.to(ladyCardRef.current, {
        y: -10,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }, []);

  const handleHeroMouseMove = (e) => {
    const card = heroTiltRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = (x / rect.width - 0.5) * 8;
    const rotateX = -((y / rect.height - 0.5) * 8);

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 1200,
      transformOrigin: "center",
      duration: 0.35,
      ease: "power2.out",
    });
  };

  const resetHeroTilt = () => {
    const card = heroTiltRef.current;
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  const refs = {
    heroTitleRef,
    heroTextRef,
    heroButtonsRef,
    bookingRef,
    rightVisualRef,
    busCardRef,
    ladyCardRef,
    discountRef,
    heroTiltRef,
  };

  return (
    <main className="min-h-screen bg-[#f8fbfa] text-[#123b3a] overflow-x-hidden">
      <HeroSection
        refs={refs}
        handleHeroMouseMove={handleHeroMouseMove}
        resetHeroTilt={resetHeroTilt}
      />

      <EasySteps />
      <PackagesSection />
      <CallUsSection />
      <TestimonialSection />
      <ExperienceSection />
      <ContactSection />
      <BlogsSection />
      <NewsSection />
    </main>
  );
}