import Image from "next/image"

import { cn } from "@/lib/utils"

type StackedImageCardProps = {
  src: string
  alt: string
  className?: string
  imageClassName?: string
  priority?: boolean
  sizes?: string
}

export function StackedImageCard({
  src,
  alt,
  className,
  imageClassName,
  priority = false,
  sizes = "(min-width: 1024px) 480px, 90vw",
}: StackedImageCardProps) {
  return (
    <div
      className={cn(
        "relative aspect-[4/5] w-full max-w-[30rem] overflow-visible",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[14%] right-[10%] top-[62%] h-[28%] rounded-full bg-black/18 blur-3xl"
      />

      <div className="absolute inset-0 translate-x-5 translate-y-3 rotate-[5deg] overflow-hidden rounded-[1.75rem] shadow-[0_26px_52px_-24px_rgba(15,23,42,0.45)] [backface-visibility:hidden]">
        <div className="relative h-full w-full">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className={cn("object-cover", imageClassName)}
          />
        </div>
      </div>
    </div>
  )
}
