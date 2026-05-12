import * as React from "react";
import { Text, TextProps } from "react-native";

export type LabelProps = TextProps & {
  className?: string;
};

function Label({
  className = "",
  children,
  ...props
}: LabelProps) {
  return (
    <Text
      className={`text-sm leading-none font-medium text-dark dark:text-light ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}

export { Label };
