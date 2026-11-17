import { cn } from "@/app/lib/utilitarios";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

export function Sobreposicao({ className, ...resto }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-0 bg-black/60 backdrop-blur-sm", className)}
      {...resto}
    />
  );
}
