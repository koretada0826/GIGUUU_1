import dynamic from "next/dynamic";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import CursorLight from "@/components/CursorLight";
import ProgressNav from "@/components/ProgressNav";
import HeaderMark from "@/components/HeaderMark";

const ShaderAtmosphere = dynamic(
  () => import("@/components/three/ShaderAtmosphere"),
  { ssr: false }
);
import Intro from "@/components/Intro";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import SignaturePiece from "@/components/SignaturePiece";
import HorizontalCollection from "@/components/HorizontalCollection";
import MacroDetail from "@/components/MacroDetail";
import Craftsmanship from "@/components/Craftsmanship";
import ViewingRoom from "@/components/ViewingRoom";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <SmoothScrollProvider>
      <ShaderAtmosphere />
      <Intro />
      <CursorLight />
      <ProgressNav />

      <HeaderMark />

      <main className="relative">
        <Hero />
        <Manifesto />
        <SignaturePiece />
        <HorizontalCollection />
        <MacroDetail />
        <Craftsmanship />
        <ViewingRoom />
        <FinalCTA />
      </main>

      <Footer />
    </SmoothScrollProvider>
  );
}
