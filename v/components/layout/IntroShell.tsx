"use client";

import { useState, useEffect } from "react";
import { IntroAnimation } from "./IntroAnimation";

const SESSION_KEY = "supplysync_intro_v4"; // bump version to force replay after video change

export function IntroShell() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const alreadyPlayed = sessionStorage.getItem(SESSION_KEY);
    if (!alreadyPlayed) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <IntroAnimation
      onComplete={() => {
        sessionStorage.setItem(SESSION_KEY, "1");
        setShow(false);
      }}
    />
  );
}
