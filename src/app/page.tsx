import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Sobre from "./components/Sobre";
import Servicos from "./components/Servicos";
import Footer from "./components/Footer";

export default function HomePage() {
  return (
    <main className="bg-neutral-900">
      <Navbar />
      <Hero />
      <Sobre />
      <Servicos />
      <Footer />
    </main>
  );
}
