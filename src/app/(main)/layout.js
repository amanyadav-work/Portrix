'use client';
import { Outfit } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Footer from "@/components/Footer";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import OfflineBanner from "@/components/ui/OfflineBanner";


export default function MainLayout({ children }) {
    const isOnline = useOnlineStatus();
  return (
    <div className="flex flex-col overflow-hidden bg-background text-foreground h-screen no-scrollbar">
           {!isOnline && <OfflineBanner />}
      <Header className='!relative '/>
      <div className=" mx-auto w-full overflow-auto border-t no-scrollbar">
        <div className=" my-container mx-auto ">
        {children}
        </div>
      </div>

    </div>
  );
}