import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, defaultValue, ...props }, ref) => {
  const arr = (value ?? defaultValue) as number[] | undefined;
  const isRange = Array.isArray(arr) && arr.length > 1;
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted/60">
        <SliderPrimitive.Range className="absolute h-full bg-gradient-primary" />
      </SliderPrimitive.Track>
      {isRange ? (
        <>
          <SliderPrimitive.Thumb aria-label="Mínimo" className="block h-6 w-6 rounded-full border-2 border-primary bg-background ring-offset-background shadow-md transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:scale-105 disabled:pointer-events-none disabled:opacity-50" />
          <SliderPrimitive.Thumb aria-label="Máximo" className="block h-6 w-6 rounded-full border-2 border-primary bg-background ring-offset-background shadow-md transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:scale-105 disabled:pointer-events-none disabled:opacity-50" />
        </>
      ) : (
        <SliderPrimitive.Thumb aria-label="Valor" className="block h-6 w-6 rounded-full border-2 border-primary bg-background ring-offset-background shadow-md transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:scale-105 disabled:pointer-events-none disabled:opacity-50" />
      )}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
