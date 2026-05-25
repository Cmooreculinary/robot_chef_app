import React from "react";

export default function OrnamentDivider({ children, className = "" }) {
  return (
    <div className={`cck-ornament my-6 sm:my-8 ${className}`} data-testid="ornament-divider">
      {children && <span>{children}</span>}
    </div>
  );
}
