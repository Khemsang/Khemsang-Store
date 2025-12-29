import React from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

import CallToActionSection from "../../components/sections/CallToActionSection/CallToActionSection";
import HeroSection from "../../components/sections/HeroSection/HeroSection";
import LatestItems from "../../components/sections/LatestItems/LatestItems";
import ProductShowcase from "../../components/sections/ProductShowcase/ProductShowcase";
import TestimonialSection from "../../components/sections/TestimonialSection/TestimonialSection";
import BrowseByCategory from "../../components/sections/BrowseByCategory/BrowseByCategory";
import Counterbar from "../../components/sections/Counterbar/Counterbar";
import StoreHighlights from "../../components/sections/StoreHighlights/StoreHighlights";

const fadeUpVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const AnimatedSection: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: false, // change to false to allow multiple animations
    threshold: 0.2,
  });

  React.useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeUpVariant}
    >
      {children}
    </motion.div>
  );
};

const Home = () => {
  return (
    <div className="top-15">
      <AnimatedSection>
        <HeroSection />
      </AnimatedSection>

      <AnimatedSection>
        <BrowseByCategory />
      </AnimatedSection>

      <AnimatedSection>
        <ProductShowcase />
      </AnimatedSection>

      <AnimatedSection>
        <LatestItems />
      </AnimatedSection>

      <AnimatedSection>
        <StoreHighlights />
      </AnimatedSection>

      <AnimatedSection>
        <Counterbar />
      </AnimatedSection>

      <AnimatedSection>
        <TestimonialSection />
      </AnimatedSection>

      <AnimatedSection>
        <CallToActionSection />
      </AnimatedSection>
    </div>
  );
};

export default Home;
