import { useState } from "react";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import AlbumIntroOverlay from "@/components/AlbumIntroOverlay";
import HeroSection from "@/components/sections/HeroSection";
import IntroSection from "@/components/sections/IntroSection";
import WeddingStoriesSection from "@/components/sections/WeddingStoriesSection";
import DualMarqueeGallerySection from "@/components/sections/DualMarqueeGallerySection";
import ServicesSection from "@/components/sections/ServicesSection";
import GallerySection from "@/components/sections/GallerySection";
import FilmsSection from "@/components/sections/FilmsSection";
import ProcessSection from "@/components/sections/ProcessSection";
import AboutSection from "@/components/sections/AboutSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContactSection from "@/components/sections/ContactSection";
import FooterSection from "@/components/sections/FooterSection";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}

      {/* Storybook / album opening intro (plays once per session) */}
      <AlbumIntroOverlay isReady={!isLoading} />
      
      <main className={`overflow-x-hidden ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}>
        <Header />

        <section id="home">
          <HeroSection />
        </section>

        <IntroSection />

        <section id="stories">
          <WeddingStoriesSection />
        </section>

        {/* Dual Marquee Gallery - Auto-scrolling category showcase */}
        <DualMarqueeGallerySection />

        <section id="services">
          <ServicesSection />
        </section>

        <section id="gallery">
          <GallerySection />
        </section>

        <section id="films">
          <FilmsSection />
        </section>

        <ProcessSection />

        <section id="about">
          <AboutSection />
        </section>

        <TestimonialsSection />

        <section id="contact">
          <ContactSection />
        </section>

        <FooterSection />

        <WhatsAppButton />
      </main>
    </>
  );
};

export default Index;
