// components/ui/card.tsx
import * as React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className || ""}`}
      {...props}
    />
  );
}

type CardContentProps = React.HTMLAttributes<HTMLDivElement>

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={`p-6 ${className || ""}`} {...props} />;
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={`p-6 pb-3 ${className || ""}`} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-lg font-semibold ${className || ""}`} {...props} />;
}

export function CardFooter({ className, ...props }: CardProps) {
  return <div className={`p-6 pt-0 ${className || ""}`} {...props} />;
}