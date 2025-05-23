"use client";

import React, { createContext, useContext, useState } from "react";

interface WealthContextType {
  triggerRefetch: () => void;
  lastUpdate: number;
}

const WealthContext = createContext<WealthContextType | undefined>(undefined);

export const useWealthContext = () => {
  const context = useContext(WealthContext);
  if (!context) {
    throw new Error("useWealthContext must be used within a WealthProvider");
  }
  return context;
};

export const WealthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  const triggerRefetch = () => {
    setLastUpdate(Date.now());
  };

  return (
    <WealthContext.Provider value={{ triggerRefetch, lastUpdate }}>
      {children}
    </WealthContext.Provider>
  );
};
