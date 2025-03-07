
import React from "react";
import { cn } from "@/lib/utils";
import Footer from "@/components/layout/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
  containerClassName?: string;
  withoutPadding?: boolean;
}

const MainLayout = ({
  children,
  containerClassName,
  withoutPadding = false,
}: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Sidebar removed temporarily to fix errors */}
      <main
        className={cn(
          "flex-1",
          !withoutPadding && "pt-16",
          containerClassName
        )}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
