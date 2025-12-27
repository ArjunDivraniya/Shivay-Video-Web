import { useState } from "react";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import HeroSection from "@/components/sections/HeroSection";
import IntroSection from "@/components/sections/IntroSection";
import WeddingStoriesSection from "@/components/sections/WeddingStoriesSection";
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
      
      <main className={`overflow-x-hidden ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}>
        <Header />

        <section id="home">
          <HeroSection />
        </section>

        <IntroSection />

        <section id="stories">
          <WeddingStoriesSection />
        </section>

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
