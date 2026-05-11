import * as React from "react";
import { TouchableOpacity, Text, View, ActivityIndicator, TouchableOpacityProps } from "react-native";

export type ButtonVariant = 'primary' | 'success' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'md' | 'sm' | 'lg' | 'icon';
export type ButtonShape = 'default' | 'circle';

export interface ButtonProps extends TouchableOpacityProps {
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
}

const Button = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, ButtonProps>(({
  className = "",
  variant = "primary",
  size = "md",
  shape = "default",
  icon,
  isLoading = false,
  asChild = false,
  label,
  children,
  disabled,
  ...props
}, ref) => {
  const isEffectivelyDisabled = isLoading || disabled;
  const hasContent = !!label || !!children;
  const isIconOnly = size === "icon" || (!hasContent && !!(icon?.left || icon?.right));

  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-blue-500",
    success: "bg-green-500",
    destructive: "bg-red-500",
    outline: "bg-transparent border border-gray-300",
    secondary: "bg-gray-500",
    ghost: "bg-transparent",
    link: "bg-transparent p-0",
  };

  const textClasses: Record<ButtonVariant, string> = {
    primary: "text-white",
    success: "text-white",
    destructive: "text-white",
    outline: "text-gray-700",
    secondary: "text-white",
    ghost: "text-gray-700",
    link: "text-blue-500 underline",
  };

  const sizeClasses: Record<ButtonSize, string> = {
    md: "py-3 px-6",
    sm: "py-2 px-4",
    lg: "py-4 px-8",
    icon: "h-11 w-11 p-2",
  };

  const textSizeClasses: Record<ButtonSize, string> = {
    md: "text-base",
    sm: "text-sm",
    lg: "text-lg",
    icon: "text-base",
  };

  const shapeClasses: Record<ButtonShape, string> = {
    default: "rounded-xl",
    circle: "rounded-full",
  };

  const baseClasses = "flex-row items-center justify-center shrink-0";

  const combinedClassName = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${shapeClasses[shape]}
    ${isIconOnly ? "aspect-square" : ""}
    ${isEffectivelyDisabled ? "opacity-50" : "opacity-100"}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const content = (
    <View className={`flex-row items-center justify-center gap-2 ${isLoading ? "opacity-0" : ""}`}>
      {icon?.left}
      {!isIconOnly && (
        <Text className={`font-semibold ${textClasses[variant]} ${textSizeClasses[size]}`}>
          {label || children}
        </Text>
      )}
      {isIconOnly && children}
      {icon?.right}
    </View>
  );

  return (
    <TouchableOpacity
      ref={ref}
      className={combinedClassName}
      disabled={isEffectivelyDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {content}
      {isLoading && (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#374151' : '#ffffff'} />
        </View>
      )}
    </TouchableOpacity>
  );
});

Button.displayName = "Button";

export { Button };
export default Button;
