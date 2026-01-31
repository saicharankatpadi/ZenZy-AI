
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import Provider from "./Provider";

// Use process.env directly for Next.js environment variables
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export function ConvexClientProvider({ children }) {
  return (
    <ConvexProvider client={convex}>
     <Provider>{children}</Provider> 
    </ConvexProvider>
  );
}