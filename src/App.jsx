import { useSmoothScroll } from "./lib/motion";
import { ContentProvider } from "./lib/content";
import Cursor from "./components/Cursor";
import Boot from "./components/Boot";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Intro from "./components/Intro";
import Capabilities from "./components/Capabilities";
import Process from "./components/Process";
import Work from "./components/Work";
import Experience from "./components/Experience";
import Certifications from "./components/Certifications";
import Contact from "./components/Contact";

export default function App() {
  useSmoothScroll();

  return (
    <ContentProvider>
      <div className="grain">
        <Boot />
        <Cursor />
        <Nav />
        <div className="site">
          <main>
            <Hero />
            <Intro />
            <Capabilities />
            <Process />
            <Work />
            <Experience />
            <Certifications />
          </main>
          <Contact />
        </div>
      </div>
    </ContentProvider>
  );
}
