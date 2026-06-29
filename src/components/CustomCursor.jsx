import { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);
  
  const outerRef = useRef(null);
  const trailingPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setHidden(false);
    };

    const handleMouseEnter = () => setHidden(false);
    const handleMouseLeave = () => setHidden(true);
    
    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    // Track links and buttons for hover effect
    const addHoverListeners = () => {
      const interactiveElements = document.querySelectorAll(
        "a, button, [role='button'], input, textarea, select, .interactive-hover"
      );
      
      interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", () => setLinkHovered(true));
        el.addEventListener("mouseleave", () => setLinkHovered(false));
      });
    };

    addHoverListeners();

    // Create an observer to watch for dynamically added elements (like modals/popups)
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      observer.disconnect();
    };
  }, []);

  // Animation loop for smooth trailing ring
  useEffect(() => {
    let animId;
    const updateTrailing = () => {
      if (outerRef.current) {
        // Linear interpolation for smooth trailing: trailingPos = trailingPos + (target - trailingPos) * factor
        const dx = position.x - trailingPos.current.x;
        const dy = position.y - trailingPos.current.y;
        trailingPos.current.x += dx * 0.15;
        trailingPos.current.y += dy * 0.15;
        
        outerRef.current.style.transform = `translate3d(${trailingPos.current.x - 20}px, ${trailingPos.current.y - 20}px, 0)`;
      }
      animId = requestAnimationFrame(updateTrailing);
    };
    animId = requestAnimationFrame(updateTrailing);
    
    return () => cancelAnimationFrame(animId);
  }, [position]);

  if (hidden) return null;

  return (
    <>
      {/* Inner Dot */}
      <div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-white z-[9999] pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate3d(-50%, -50%, 0) scale(${clicked ? 0.8 : linkHovered ? 1.5 : 1})`,
          mixBlendMode: "difference"
        }}
      />
      {/* Outer Glowing Ring */}
      <div
        ref={outerRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-amber-500/30 bg-amber-500/5 z-[9999] pointer-events-none transition-all duration-300 ease-out"
        style={{
          transform: `translate3d(${trailingPos.current.x - 20}px, ${trailingPos.current.y - 20}px, 0) scale(${
            clicked ? 0.9 : linkHovered ? 1.4 : 1
          })`,
          borderColor: linkHovered ? "rgba(212, 175, 55, 0.8)" : "rgba(212, 175, 55, 0.3)",
          backgroundColor: linkHovered ? "rgba(212, 175, 55, 0.08)" : "rgba(212, 175, 55, 0.03)",
          boxShadow: linkHovered ? "0 0 15px rgba(212, 175, 55, 0.25)" : "0 0 10px rgba(212, 175, 55, 0.05)"
        }}
      />
    </>
  );
}
