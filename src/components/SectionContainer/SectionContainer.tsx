import React, { memo, type ElementType, type PropsWithChildren } from "react";

type Display = "block" | "flex" | "inline-flex" | "grid" | "inline-block";
type Space = "none" | "sm" | "md" | "lg" | "xl";
type Radius = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";

type SectionContainerProps<T extends ElementType = "section"> = PropsWithChildren<{
  /** HTML tag (e.g., 'div', 'section', 'article') */
  as?: T;
  /** Tailwind display utility */
  display?: Display;
  /** All-around margin (m-*) */
  margin?: Space;
  /** All-around padding (p-*) */
  padding?: Space;
  /** Corner radius (rounded-*) */
  rounded?: Radius;
  /** Extra classes for anything else (bg, border, shadow, etc.) */
  className?: string;
}> & Omit<React.ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

const displayMap: Record<Display, string> = {
  "block": "block",
  "flex": "flex",
  "inline-flex": "inline-flex",
  "grid": "grid",
  "inline-block": "inline-block",
};

const marginMap: Record<Space, string> = {
  none: "m-0",
  sm: "m-2",
  md: "m-4",
  lg: "m-6",
  xl: "m-8",
};

const paddingMap: Record<Space, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-12",
};

const roundedMap: Record<Radius, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

function SectionContainer<T extends ElementType = "section">({
  as,
  display = "block",
  margin = "none",
  padding = "md",
  rounded = "lg",
  className,
  children,
  ...rest
}: SectionContainerProps<T>) {
  const Comp: ElementType = as ?? "section";

  // Build classes without any helper libs
  const classes =
    [
      displayMap[display],
      marginMap[margin],
      paddingMap[padding],
      roundedMap[rounded],
      className, // allow overrides: e.g., "bg-white border shadow"
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <Comp className={classes} {...rest}>
      {children}
    </Comp>
  );
}

export default memo(SectionContainer);
