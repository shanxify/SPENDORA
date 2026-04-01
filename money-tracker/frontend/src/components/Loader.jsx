import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Loader({ onFinish }) {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 900);

    const finishTimer = setTimeout(() => {
      onFinish && onFinish();
    }, 1800);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#060010] flex items-center justify-center z-[9999]">
      
      <div className="flex flex-col items-center gap-6">

        {/* X Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="relative w-[60px] h-[60px]"
        >
          <motion.span
            className="absolute w-full h-[4px] bg-[#7c3aed] rounded"
            style={{ transform: "rotate(45deg)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          <motion.span
            className="absolute w-full h-[4px] bg-[#7c3aed] rounded"
            style={{ transform: "rotate(-45deg)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        </motion.div>

        {/* Text */}
        {showText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-semibold tracking-wide"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span className="text-gray-300">spend</span>
            <span className="text-[#7c3aed] text-3xl ml-1">X</span>
          </motion.div>
        )}

      </div>
    </div>
  );
}
