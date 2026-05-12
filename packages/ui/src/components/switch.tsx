import * as React from "react";
import { useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { Label } from "./label";

export type SwitchProps = {
  id?: string;
  label?: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export const Switch = ({
  label,
  hideLabel,
  hint,
  error,
  checked,
  defaultChecked,
  onChange,
  disabled,
  className = "",
}: SwitchProps) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const displayChecked = isControlled ? checked : internalChecked;

  const [animatedValue] = useState(new Animated.Value(displayChecked ? 1 : 0));

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: displayChecked ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [displayChecked]);

  const handleClick = () => {
    if (disabled) return;
    const newState = !displayChecked;
    if (!isControlled) {
      setInternalChecked(newState);
    }
    onChange?.(newState);
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 20],
  });

  return (
    <View className={`${(label && !hideLabel) ? "w-full" : "w-11"} ${disabled ? "opacity-50" : ""} ${className}`}>
      <View className={`flex-row items-center ${(label && !hideLabel) ? "justify-between" : ""}`}>
        {label && !hideLabel && (
          <TouchableOpacity activeOpacity={0.7} onPress={handleClick} disabled={disabled} className="flex-1 pr-4">
            <Label className={`text-[16px] font-bold ${disabled ? "text-gray-400" : "text-dark dark:text-light"}`}>
              {label}
            </Label>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleClick}
          disabled={disabled}
          className={`w-11 h-6 rounded-full flex justify-center ${displayChecked ? "bg-green-200" : "bg-gray-500"} transition-colors`}
        >
          <Animated.View
            className="h-5 w-5 rounded-full bg-white shadow-sm"
            style={{ transform: [{ translateX }] }}
          />
        </TouchableOpacity>
      </View>

      {hint && (
        <Text className="text-dark dark:text-light font-normal text-xs mt-1 opacity-70">{hint}</Text>
      )}
      {error && (
        <Text className="text-red-200 text-xs mt-1 font-medium">{error}</Text>
      )}
    </View>
  );
};

Switch.displayName = "Switch";
