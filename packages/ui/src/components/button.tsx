import * as React from "react";

const Spinner = ({ className = "" }: { className?: string }) => (
  <svg 
    className={`animate-spin h-4 w-4 ${className}`} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export type ButtonVariant = 'primary' | 'success' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'md' | 'sm' | 'lg' | 'icon';
export type ButtonShape = 'default' | 'circle';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  isLoading?: boolean;
  icon?: {
    left?: React.ReactNode;
    right?: React.ReactNode;
  };
  label?: string;
  asChild?: boolean;
  href?: string;
  target?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className = "",
  variant = "primary",
  size = "md",
  shape = "default",
  icon,
  isLoading = false,
  asChild = false,
  label,
  children,
  href,
  ...props
}, ref) => {
  const isEffectivelyDisabled = isLoading || props.disabled;
  const hasContent = !!label || !!children;
  const isIconOnly = size === "icon" || (!hasContent && !!(icon?.left || icon?.right));

  const variantClasses: Record<ButtonVariant, string> = {
    primary: "text-white bg-blue-500 hover:bg-blue-600",
    success: "text-white bg-green-500 hover:bg-green-600",
    destructive: "text-white bg-red-500 hover:bg-red-600",
    outline: "text-gray-700 border border-gray-300 hover:bg-gray-50",
    secondary: "text-white bg-gray-500 hover:bg-gray-600",
    ghost: "text-gray-700 hover:bg-gray-100",
    link: "text-blue-500 p-0 rounded-none hover:underline",
  };

  const sizeClasses: Record<ButtonSize, string> = {
    md: "py-2 px-6",
    sm: "py-1 px-3 text-sm",
    lg: "py-3 px-8 text-lg",
    icon: "h-9 w-9 p-2",
  };

  const shapeClasses: Record<ButtonShape, string> = {
    default: "rounded-xl",
    circle: "rounded-full",
  };

  const baseClasses = "relative inline-flex items-center justify-center gap-2 h-fit whitespace-nowrap text-base font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shrink-0 cursor-pointer ease-out";

  const combinedClassName = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${shapeClasses[shape]}
    ${isIconOnly ? "aspect-square" : ""}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const content = (
    <div className={`flex items-center justify-center gap-2 transition-opacity duration-200 ${isLoading ? "opacity-0" : ""}`}>
      {icon?.left}
      {isIconOnly ? children : label || children}
      {icon?.right}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className={combinedClassName}
        {...props as any}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      className={combinedClassName}
      disabled={isEffectivelyDisabled}
      {...props}
    >
      {content}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
    </button>
  );
});

Button.displayName = "Button";

export { Button };
export default Button;
