"use client";

import { useEffect, useRef, useState } from "react";

export function IntroAnimation({ onComplete }: { onComplete?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"playing" | "fadeout" | "done">("playing");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // When video ends → start fade-out
    const handleEnded = () => {
      setPhase("fadeout");
      setTimeout(() => {
        setPhase("done");
        onComplete?.();
      }, 500);
    };

    video.addEventListener("ended", handleEnded);
    // Autoplay with muted (required by browsers)
    video.play().catch(() => {
      // If autoplay blocked, still complete after a delay
      setTimeout(() => handleEnded(), 500);
    });

    return () => video.removeEventListener("ended", handleEnded);
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      className={`intro-overlay${phase === "fadeout" ? " intro-fadeout" : ""}`}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="intro-video"
        src="/intro.webm"
        muted
        playsInline
        preload="auto"
      />
    </div>
  );
}
