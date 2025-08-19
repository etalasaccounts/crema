"use client";

import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { motion, AnimatePresence } from "framer-motion";
import {
  setCountdownState,
  setCountdownPaused,
} from "@/store/slices/mediaSlice";

export function CountdownOverlay() {
  const dispatch = useAppDispatch();
  const { countdownState, isCountdownPaused } = useAppSelector(
    (state) => state.media
  );
  const [visible, setVisible] = useState(false);

  // Handle visibility based on countdown state
  useEffect(() => {
    if (countdownState === "inactive" || countdownState === "recording") {
      setVisible(false);
      dispatch(setCountdownPaused(false));
    } else {
      setVisible(true);
    }
  }, [countdownState, dispatch]);

  // Toggle pause/resume countdown
  const togglePause = () => {
    // Simply toggle the pause state
    // The record-controls component will handle the actual resume logic
    dispatch(setCountdownPaused(!isCountdownPaused));
  };

  // Skip rendering if not visible
  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center cursor-pointer"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.85)",
          }}
          onClick={togglePause}
        >
          <motion.div
            key={isCountdownPaused ? "paused" : countdownState}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="relative flex flex-col items-center justify-center"
          >
            {isCountdownPaused ? (
              <div className="text-center">
                <div className="text-yellow-500 text-5xl md:text-6xl font-bold tracking-tight">
                  PAUSED
                </div>
                <div className="text-white/70 text-lg mt-4">
                  Tap to resume countdown
                </div>
              </div>
            ) : (
              <>
                {countdownState === "standby" && (
                  <div className="text-center">
                    <div className="text-white text-5xl md:text-6xl font-bold tracking-tight">
                      Standby
                    </div>
                  </div>
                )}

                {countdownState === "rolling" && (
                  <div className="text-center">
                    <div className="text-white text-5xl md:text-6xl font-bold tracking-tight">
                      Rolling
                    </div>
                  </div>
                )}

                {countdownState === "action" && (
                  <div className="text-center">
                    <div className="text-red-500 text-5xl md:text-6xl font-bold tracking-tight">
                      Action!
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
