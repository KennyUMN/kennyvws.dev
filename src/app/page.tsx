import { Navbar } from "@/components/nav/Navbar";
import { Hero } from "@/components/sections/Hero";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
      </main>
    </>
  );
}
