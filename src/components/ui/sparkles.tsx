
"use client";
import React, { useEffect, useState } from "react";
import { tsParticles } from "@tsparticles/engine";
import type { Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export const SparklesCore = (props: {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
}) => {
  const {
    id,
    background,
    minSize,
    maxSize,
    particleDensity,
    className,
    particleColor,
  } = props;

  const [init, setInit] = useState(false);

  useEffect(() => {
    const initParticles = async (engine: Engine) => {
      await loadSlim(engine);
      setInit(true);
    };
    if (!init) {
        initParticles(tsParticles);
    }
  }, [init]);

  useEffect(() => {
    if (init) {
      tsParticles.load(id || "tsparticles", {
        background: {
          color: {
            value: background || "transparent",
          },
        },
        fullScreen: {
          enable: false,
          zIndex: 1,
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: "push",
            },
            onHover: {
              enable: false,
              mode: "repulse",
            },
          },
          modes: {
            push: {
              quantity: 4,
            },
            repulse: {
              distance: 200,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: particleColor || "#ffffff",
          },
          links: {
            color: "#ffffff",
            distance: 150,
            enable: false,
            opacity: 0.5,
            width: 1,
          },
          collisions: {
            enable: true,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: 1,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: particleDensity || 800,
            },
            value: particleDensity || 80,
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: minSize || 1, max: maxSize || 3 },
          },
        },
        detectRetina: true,
      });
    }
  }, [
    init,
    id,
    background,
    minSize,
    maxSize,
    particleDensity,
    particleColor,
  ]);

  return <div className={className} id={id || "tsparticles"} />;
};
