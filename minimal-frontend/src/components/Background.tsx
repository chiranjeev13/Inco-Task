"use client";

import React from "react";

export const Background = () => {
  return (
    <>
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute inset-0 animated-gradient opacity-10" />

        {/* Animated Orbs */}
        <div
          className="absolute -top-20 -left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl opacity-20"
          style={{
            animation: "pulse 8s ease-in-out infinite",
            animationDelay: "-2s",
          }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl opacity-20"
          style={{
            animation: "pulse 8s ease-in-out infinite",
          }}
        />
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.3;
          }
        }
      `}</style>
    </>
  );
};
