import { Navbar } from "@/components/nav/Navbar";
import { Hero } from "@/components/hero/Hero";
import { Work } from "@/components/work/Work";
import { About } from "@/components/about/About";
import { Contact } from "@/components/contact/Contact";
import { Footer } from "@/components/contact/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <Work />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
