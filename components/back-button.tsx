"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "@/components/icons";

export function BackButton() {
  const router = useRouter();
  return <button className="icon-button" onClick={() => router.back()} aria-label="Go back"><ArrowLeft size={22} /></button>;
}
