'use client';
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-red-500 text-white py-2 text-sm font-medium shadow-md">
      <WifiOff className="w-4 h-4" />
      <span>You are currently offline. Some features may not be available.</span>
    </div>
  );
}
