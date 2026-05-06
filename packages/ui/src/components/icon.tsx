import type { MaterialSymbol } from "material-symbols";
import { forwardRef } from "react";

export type IconType = MaterialSymbol;
export type IconColor = 'primary' | 'secondary' | 'default';
export type IconSize = 'lg' | 'md' | 'base' | 'sm' | 'xs';

export interface IconProps extends React.ComponentPropsWithoutRef<"i"> {
  type: IconType;
  color?: IconColor;
  size?: IconSize;
}

const Icon = forwardRef<HTMLElement, IconProps>(
  ({ type, color = 'default', size = 'md', className = "", ...props }, ref) => {
    
    const colorClasses: Record<IconColor, string> = {
      primary: "text-blue-500",
      secondary: "text-green-500",
      default: "",
    };

    const sizeClasses: Record<IconSize, string> = {
      lg: "text-xl",
      md: "text-lg",
      base: "text-base",
      sm: "text-sm",
      xs: "text-xs",
    };

    const baseClasses = "material-symbols-outlined leading-none";

    const combinedClassName = `
      ${baseClasses}
      ${colorClasses[color]}
      ${sizeClasses[size]}
      ${props.onClick ? "cursor-pointer" : ""}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <i
        ref={ref}
        className={combinedClassName}
        {...props}
      >
        {type}
      </i>
    );
  }
);

Icon.displayName = "Icon";

export { Icon };
