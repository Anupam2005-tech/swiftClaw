"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CORE_LINKS, INSTALL_LINKS } from "@/lib/docs-links";

export function DocPagination() {
  const pathname = usePathname();
  
  const allLinks = [...CORE_LINKS, ...INSTALL_LINKS];
  const currentIndex = allLinks.findIndex(link => link.href === pathname);

  if (currentIndex === -1) return null;

  const prevLink = allLinks[currentIndex - 1];
  const nextLink = allLinks[currentIndex + 1];

  return (
    <div className="flex items-center justify-between mt-12 pt-8 border-t border-[#FFFDF9]/10">
      <div className="flex-1">
        {prevLink ? (
          <Link 
            href={prevLink.href} 
            className="group flex items-center gap-2 text-[#FFFDF9]/50 hover:text-[#FFFDF9] transition-colors duration-300"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider opacity-50 font-mono">Previous</span>
              <span className="text-sm font-medium">{prevLink.label}</span>
            </div>
          </Link>
        ) : (
          <div className="w-32" />
        )}
      </div>
      
      <div className="flex-1 text-right">
        {nextLink ? (
          <Link 
            href={nextLink.href} 
            className="group flex items-center justify-end gap-2 text-[#FFFDF9]/50 hover:text-[#FFFDF9] transition-colors duration-300"
          >
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wider opacity-50 font-mono">Next</span>
              <span className="text-sm font-medium">{nextLink.label}</span>
            </div>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <div className="w-32" />
        )}
      </div>
    </div>
  );
}
