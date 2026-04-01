import { useAnimate, motion } from "framer-motion";
import { useEffect } from "react";

export default function IntroLoader({ onFinish }) {
  const [xScope, animateX] = useAnimate();
  const [textScope, animateText] = useAnimate();
  const [screenScope, animateScreen] = useAnimate();

  useEffect(() => {
    const run = async () => {

      // Wait for Space Grotesk font to fully load
      // This prevents font-swap stutter during animation
      try {
        await document.fonts.load("700 846px 'Space Grotesk'");
      } catch (e) {
        // font load failed — continue anyway
      }

      // Phase 1 — Large X fades in (already filling screen)
      await animateX(
        xScope.current,
        { opacity: 1 },
        { duration: 0.35, ease: "easeOut", type: "tween" }
      );

      await new Promise(r => setTimeout(r, 150));

      // Phase 2 — X shrinks from fullscreen down to logo size
      await animateX(
        xScope.current,
        { scale: 0.052 },
        { duration: 0.75, ease: [0.16, 1, 0.3, 1], type: "tween" }
      );

      await new Promise(r => setTimeout(r, 60));

      // Phase 3 — SPEND slides in from left
      await animateText(
        textScope.current,
        { opacity: 1, x: 0 },
        { duration: 0.4, ease: [0.16, 1, 0.3, 1], type: "tween" }
      );

      // Hold logo visible
      await new Promise(r => setTimeout(r, 400));

      // Phase 4 — Fade out everything
      await animateScreen(
        screenScope.current,
        { opacity: 0 },
        { duration: 0.4, ease: "easeOut", type: "tween" }
      );

      onFinish && onFinish();
    };

    run();
  }, []);

  // Logo size X for reference = 44px
  // Full screen X = 44px / 0.052 = ~846px font size
  // This fills any screen without any scaling up

  return (
    <div
      ref={screenScope}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#060010",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        overflow: "hidden",
        opacity: 1,
        willChange: "opacity"
      }}
    >
      {/* Container for logo — centered */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative"
        }}
      >

        {/* SPEND text — hidden until phase 3 */}
        <motion.span
          ref={textScope}
          initial={{ opacity: 0, x: -40 }}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "44px",
            fontWeight: "700",
            color: "#e2e8f0",
            letterSpacing: "0.04em",
            marginRight: "2px",
            display: "inline-block",
            willChange: "transform, opacity",
            lineHeight: 1,
            whiteSpace: "nowrap",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden"
          }}
        >
          SPEND
        </motion.span>

        {/*
          X rendered at 846px font size — already fills the screen
          Scale starts at 1 (full size) then shrinks to 0.052 (logo size)
          Scaling DOWN never causes blur — always sharp
          transformOrigin center center keeps it centered while shrinking
        */}
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          {/* Invisible placeholder to reserve the exact final layout space for X aligned next to SPEND */}
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "44px", fontWeight: "700", opacity: 0, lineHeight: 1 }}>X</span>
          
          {/* 
            GPU Texture Hack: We wrap the text in a motion.div to scale the wrapper,
            and apply blur(0)+translateZ to the inner text so the browser rasterizes it into 
            a stable bitmap layer first. This completely eliminates font-scaling engine stutter! 
          */}
          <motion.div
            ref={xScope}
            initial={{ opacity: 0, x: "-50%", y: "-50%", z: 0, scale: 1 }}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transformOrigin: "center center",
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            }}
          >
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "846px",
                fontWeight: "700",
                color: "#7c3aed",
                display: "block",
                lineHeight: 0.9,
                textRendering: "geometricPrecision",
                WebkitFontSmoothing: "antialiased",
                filter: "blur(0px)",
                transform: "translateZ(0)"
              }}
            >
              X
            </span>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
