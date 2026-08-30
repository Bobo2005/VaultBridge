import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hoverable = true,
  ...props
}) => {
  return (
    <div
      className={`
        bg-surface
        border border-border
        rounded-card
        p-5 sm:p-6
        shadow-card
        ${hoverable ? "transition-all duration-150 ease hover:-translate-y-[2px] hover:shadow-cardHover" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};