import { MaterialIcons } from "@expo/vector-icons";
import { forwardRef } from "react";
import { TextProps } from "react-native";

export type IconType = keyof typeof MaterialIcons.glyphMap;
export type IconColor = 'primary' | 'secondary' | 'default';
export type IconSize = 'lg' | 'md' | 'base' | 'sm' | 'xs';

export interface IconProps extends Omit<TextProps, 'style'> {
  type: IconType;
  color?: IconColor;
  size?: IconSize;
  className?: string;
}

const Icon = forwardRef<any, IconProps>(
  ({ type, color = 'default', size = 'md', className = "", ...props }, ref) => {
    
    const colorClasses: Record<IconColor, string> = {
      primary: "#3b82f6", // blue-500
      secondary: "#22c55e", // green-500
      default: "#1f2937", // gray-800
    };

    const sizeMapping: Record<IconSize, number> = {
      lg: 24,
      md: 20,
      base: 18,
      sm: 16,
      xs: 14,
    };

    return (
      // @ts-expect-error: Upstream type incompatibility with newer React definition
      <MaterialIcons
        name={type}
        size={sizeMapping[size]}
        color={colorClasses[color]}
        className={className}
        {...props}
      />
    );
  }
);

Icon.displayName = "Icon";

export { Icon };
