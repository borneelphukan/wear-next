import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Alert,
  View,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Image,
  Modal,
  TouchableOpacity,
  TextInput,
  Text,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Calendar, DateData } from "react-native-calendars";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type FieldType =
  | "text"
  | "dropdown"
  | "number"
  | "email"
  | "phone"
  | "date"
  | "autocomplete"
  | "checkbox"
  | "tags"
  | "dynamic-list"
  | "time"
  | "image";

export type FormField = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  halfWidth?: boolean;
  icon?: string;
  items?: string[];
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  disabled?: boolean;
  subFields?: FormField[];
};

type BottomDrawerProps = {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  fields?: FormField[];
  initialValues?: Record<string, any>;
  onSubmit: (data: any) => Promise<void>;
  submitButtonText?: string;
  isSubmitting?: boolean;
  headerSubmit?: boolean;
  onDelete?: () => Promise<void>;
  children?: React.ReactNode;
};

/* ─── Custom Dropdown ─── */
const FormDropdown = ({
  label,
  items,
  selectedValue,
  onSelect,
  error,
  leftIcon,
  disabled,
}: {
  label: string;
  items: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  error?: string;
  leftIcon?: string;
  disabled?: boolean;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <View className="mb-3">
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => !disabled && setVisible(!visible)}
        disabled={disabled}
        className={`flex-row items-center h-[52px] bg-bg border rounded-xl px-3 ${
          error ? "border-red-500" : "border-border-brand"
        } ${disabled ? "opacity-60" : ""}`}
      >
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon as any}
            size={18}
            color="#5e5ce6"
            style={{ marginRight: 10 }}
          />
        )}
        <View className="flex-1">
          <Text className="text-[11px] font-bold text-text-muted">{label}</Text>
          <Text className={`text-[14px] font-semibold ${selectedValue ? "text-text" : "text-text-faint"}`}>
            {selectedValue || `Select ${label}`}
          </Text>
        </View>
        <MaterialCommunityIcons 
          name={visible ? "chevron-up" : "chevron-down"} 
          size={18} 
          color="#656475" 
        />
      </TouchableOpacity>

      {visible && (
        <View
          className="bg-surface border border-border rounded-xl mt-1 overflow-hidden"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}
        >
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
            {items.map((item) => (
              <TouchableOpacity
                key={item}
                className={`py-3.5 px-4 border-b border-[#f5f5f8] ${selectedValue === item ? "bg-brand-light" : ""}`}
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                }}
              >
                <View className="flex-row items-center justify-between">
                  <Text className={`text-[14px] font-bold ${selectedValue === item ? "text-brand" : "text-text"}`}>
                    {item}
                  </Text>
                  {selectedValue === item && (
                    <MaterialIcons name="check" size={16} color="#5e5ce6" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {error ? <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text> : null}
    </View>
  );
};

/* ─── Custom Autocomplete ─── */
const FormAutocomplete = ({
  label,
  value,
  onSelect,
  items,
  error,
  leftIcon,
  placeholder,
}: {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  items: string[];
  error?: string;
  leftIcon?: string;
  placeholder?: string;
}) => {
  const [visible, setVisible] = useState(false);
  const suggestions = useMemo(
    () => (value ? items.filter((i) => i.toLowerCase().includes(value.toLowerCase())) : items),
    [value, items]
  );

  return (
    <View className="mb-3">
      <View className={`flex-row items-center h-[52px] bg-bg border rounded-xl px-3 ${error ? "border-red-500" : "border-border-brand"}`}>
        {leftIcon && (
          <MaterialCommunityIcons name={leftIcon as any} size={18} color="#5e5ce6" style={{ marginRight: 8 }} />
        )}
        <TextInput
          className="flex-1 text-[15px] text-text"
          placeholder={placeholder || label}
          placeholderTextColor="#a09fb1"
          value={value}
          onChangeText={(text) => { onSelect(text); setVisible(true); }}
          onFocus={() => setVisible(true)}
          onBlur={() => setTimeout(() => setVisible(false), 200)}
        />
        <MaterialCommunityIcons name="menu-down" size={20} color="#656475" />
      </View>
      {error ? <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text> : null}

      {visible && suggestions.length > 0 && (
        <View
          className="bg-surface border border-border-brand rounded-xl mt-1 overflow-hidden"
          style={{ elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 }}
        >
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="py-3 px-4 border-b border-border"
                onPress={() => { onSelect(item); setVisible(false); }}
              >
                <Text className="text-[15px] text-text font-semibold">{item}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 200 }}
          />
        </View>
      )}
    </View>
  );
};

/* ─── Main BottomDrawer ─── */
export const BottomDrawer = ({
  isVisible,
  onClose,
  title,
  fields,
  initialValues,
  onSubmit,
  submitButtonText = "Save",
  isSubmitting: isSubmittingProp,
  headerSubmit = false,
  onDelete,
  children,
}: BottomDrawerProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [activeDateField, setActiveDateField] = useState<string | null>(null);
  const [activeTimeField, setActiveTimeField] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  const isSubmitting = isSubmittingProp || isSubmittingInternal;

  useEffect(() => {
    if (isVisible) {
      setFormData(initialValues || {});
      setErrors({});
    }
  }, [isVisible, initialValues]);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleAddTag = (fieldName: string, tag: string) => {
    if (!tag.trim()) return;
    const current = Array.isArray(formData[fieldName]) ? formData[fieldName] : [];
    if (!current.includes(tag.trim())) {
      handleInputChange(fieldName, [...current, tag.trim()]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (fieldName: string, tagToRemove: string) => {
    const current = Array.isArray(formData[fieldName]) ? formData[fieldName] : [];
    handleInputChange(fieldName, current.filter((t: string) => t !== tagToRemove));
  };

  const handleDynamicListChange = (fieldName: string, index: number, subFieldName: string, value: any) => {
    const current = Array.isArray(formData[fieldName]) ? [...formData[fieldName]] : [{}];
    current[index] = { ...current[index], [subFieldName]: value };
    handleInputChange(fieldName, current);
  };

  const handleAddDynamicListItem = (fieldName: string) => {
    const current = Array.isArray(formData[fieldName]) ? [...formData[fieldName]] : [];
    handleInputChange(fieldName, [...current, {}]);
  };

  const handleRemoveDynamicListItem = (fieldName: string, index: number) => {
    const current = Array.isArray(formData[fieldName]) ? [...formData[fieldName]] : [];
    handleInputChange(fieldName, current.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    (fields || []).forEach((field) => {
      if (field.required && !String(formData[field.name] || "").trim()) {
        newErrors[field.name] = `${field.label} is required.`;
      } else if (field.type === "email" && formData[field.name] && !/\S+@\S+\.\S+/.test(formData[field.name])) {
        newErrors[field.name] = "Please enter a valid email address.";
      } else if (field.type === "phone" && formData[field.name]) {
        if (!/^\+?[1-9]\d{9,14}$/.test(formData[field.name].replace(/\s/g, ""))) {
          newErrors[field.name] = "Enter a valid phone number.";
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert("Validation Error", "Please fill all required fields correctly.");
      return;
    }
    setIsSubmittingInternal(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch {
      Alert.alert("Error", "Failed to save record. Please try again.");
    } finally {
      setIsSubmittingInternal(false);
    }
  };

  const renderField = useCallback(
    (field: FormField, index: number, isHalf: boolean) => {
      const containerClass = isHalf ? "w-[48%]" : "w-full";

      /* ── Image ── */
      if (field.type === "image") {
        const selectedImage = formData[field.name];

        const pickImage = async () => {
          const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!granted) {
            Alert.alert("Permission Required", "Permission to access camera roll is required!");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });
          if (!result.canceled) {
            handleInputChange(field.name, result.assets[0].uri);
          }
        };

        return (
          <View key={field.name} className={`${containerClass} mb-3`}>
            <Text className="text-[13px] font-bold text-text-muted mb-2">{field.label}</Text>
            <TouchableOpacity
              onPress={pickImage}
              className="h-[120px] bg-brand-light rounded-xl overflow-hidden justify-center items-center"
            >
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} className="w-full h-full" />
              ) : (
                <View className="items-center">
                  <MaterialCommunityIcons name="camera-plus-outline" size={32} color="#5e5ce6" />
                  <Text className="text-brand text-xs font-bold mt-2">Select or Upload Image</Text>
                </View>
              )}
            </TouchableOpacity>
            {errors[field.name] ? (
              <Text className="text-red-500 text-xs mt-1">{errors[field.name]}</Text>
            ) : null}
          </View>
        );
      }

      /* ── Dynamic List ── */
      if (field.type === "dynamic-list") {
        const items = Array.isArray(formData[field.name]) ? formData[field.name] : [{}];
        return (
          <View key={field.name} className="w-full mb-3">
            <Text className="text-[15px] font-extrabold text-text mb-3">{field.label}</Text>
            {items.map((item: any, itemIndex: number) => (
              <View
                key={`${field.name}-${itemIndex}`}
                className="bg-bg border border-border-brand rounded-2xl p-3 mb-3"
                style={{ elevation: 1 }}
              >
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-[14px] font-bold text-text">{field.label} #{itemIndex + 1}</Text>
                  {items.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveDynamicListItem(field.name, itemIndex)}
                      className="w-7 h-7 rounded-full bg-[#fee2e2] justify-center items-center"
                    >
                      <MaterialIcons name="close" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {field.subFields?.map((subField) => {
                    const handleSub = (val: any) =>
                      handleDynamicListChange(field.name, itemIndex, subField.name, val);
                    return (
                      <View key={subField.name} className={subField.halfWidth ? "w-[48%]" : "w-full"}>
                        {subField.type === "dropdown" ? (
                          <FormDropdown
                            label={subField.label}
                            items={subField.items || []}
                            selectedValue={item[subField.name] || ""}
                            onSelect={handleSub}
                            leftIcon={subField.icon}
                          />
                        ) : (
                          <View className="flex-row items-center h-[48px] bg-surface border border-border-brand rounded-xl px-3 mb-2">
                            {subField.icon && (
                              <MaterialCommunityIcons name={subField.icon as any} size={16} color="#5e5ce6" style={{ marginRight: 8 }} />
                            )}
                            <TextInput
                              className="flex-1 text-[14px] text-text"
                              placeholder={subField.label}
                              placeholderTextColor="#a09fb1"
                              value={String(item[subField.name] || "")}
                              onChangeText={handleSub}
                              keyboardType={subField.type === "number" ? "numeric" : "default"}
                            />
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => handleAddDynamicListItem(field.name)}
              className="flex-row items-center justify-center py-2 px-4 rounded-xl border border-dashed border-brand-lighter"
            >
              <MaterialIcons name="add" size={16} color="#5e5ce6" />
              <Text className="text-brand text-[14px] font-bold ml-1">Add Another {field.label}</Text>
            </TouchableOpacity>
          </View>
        );
      }

      /* ── Tags ── */
      if (field.type === "tags") {
        const currentTags = Array.isArray(formData[field.name]) ? formData[field.name] : [];
        return (
          <View key={field.name} className={`${containerClass} mb-3`}>
            <View className="flex-row items-center h-[52px] bg-bg border border-border-brand rounded-xl px-3">
              <TextInput
                className="flex-1 text-[15px] text-text"
                placeholder={field.placeholder || "Type and press add"}
                placeholderTextColor="#a09fb1"
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={() => handleAddTag(field.name, tagInput)}
              />
              <TouchableOpacity onPress={() => handleAddTag(field.name, tagInput)}>
                <MaterialIcons name="add" size={22} color="#5e5ce6" />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-2 mt-2 mb-3">
              {currentTags.map((tag: string) => (
                <View key={tag} className="flex-row items-center bg-brand-light rounded-full px-3 py-1">
                  <Text className="text-brand text-[13px] font-semibold">{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(field.name, tag)} className="ml-2">
                    <MaterialIcons name="close" size={14} color="#5e5ce6" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        );
      }

      /* ── Dropdown / Autocomplete ── */
      if (field.type === "dropdown" || field.type === "autocomplete") {
        return (
          <View key={field.name} className={containerClass}>
            {field.type === "dropdown" ? (
              <FormDropdown
                label={field.label}
                items={field.items || []}
                selectedValue={formData[field.name] || ""}
                onSelect={(val) => handleInputChange(field.name, val)}
                error={errors[field.name]}
                leftIcon={field.icon}
                disabled={field.disabled}
              />
            ) : (
              <FormAutocomplete
                label={field.label}
                items={field.items || []}
                value={formData[field.name] || ""}
                onSelect={(val) => handleInputChange(field.name, val)}
                error={errors[field.name]}
                leftIcon={field.icon}
                placeholder={field.placeholder}
              />
            )}
          </View>
        );
      }

      /* ── Checkbox ── */
      if (field.type === "checkbox") {
        const checked = !!formData[field.name];
        return (
          <View key={field.name} className={`${containerClass} mb-4 justify-center`}>
            <TouchableOpacity
              className="flex-row items-center gap-3"
              onPress={() => !field.disabled && handleInputChange(field.name, !checked)}
              disabled={field.disabled}
            >
              <View className={`w-6 h-6 rounded-md border-2 justify-center items-center ${checked ? "bg-brand border-brand" : "border-border-brand bg-bg"}`}>
                {checked && <MaterialIcons name="check" size={16} color="#ffffff" />}
              </View>
              <Text className="text-[15px] font-semibold text-text">{field.label}</Text>
            </TouchableOpacity>
          </View>
        );
      }

      /* ── Date ── */
      if (field.type === "date") {
        return (
          <View key={field.name} className={`${containerClass} mb-3`}>
            <TouchableOpacity
              onPress={() => { setActiveDateField(field.name); setDatePickerVisible(true); }}
              disabled={field.disabled}
              className={`flex-row items-center h-[52px] bg-bg border rounded-xl px-3 ${errors[field.name] ? "border-red-500" : "border-border-brand"} ${field.disabled ? "opacity-60" : ""}`}
            >
              {field.icon && (
                <MaterialCommunityIcons name={field.icon as any} size={18} color="#5e5ce6" style={{ marginRight: 8 }} />
              )}
              <View className="flex-1">
                <Text className="text-[11px] font-bold text-text-muted">{field.label}</Text>
                <Text className={`text-[14px] font-semibold ${formData[field.name] ? "text-text" : "text-text-faint"}`}>
                  {formData[field.name] || "Select date"}
                </Text>
              </View>
              <MaterialIcons name="calendar-today" size={18} color="#656475" />
            </TouchableOpacity>
            {errors[field.name] ? <Text className="text-red-500 text-xs mt-1">{errors[field.name]}</Text> : null}
          </View>
        );
      }

      /* ── Time ── */
      if (field.type === "time") {
        return (
          <View key={field.name} className={`${containerClass} mb-3`}>
            <TouchableOpacity
              onPress={() => { setActiveTimeField(field.name); setTimePickerVisible(true); }}
              disabled={field.disabled}
              className={`flex-row items-center h-[52px] bg-bg border rounded-xl px-3 ${errors[field.name] ? "border-red-500" : "border-border-brand"} ${field.disabled ? "opacity-60" : ""}`}
            >
              {field.icon && (
                <MaterialCommunityIcons name={field.icon as any} size={18} color="#5e5ce6" style={{ marginRight: 8 }} />
              )}
              <View className="flex-1">
                <Text className="text-[11px] font-bold text-text-muted">{field.label}</Text>
                <Text className={`text-[14px] font-semibold ${formData[field.name] ? "text-text" : "text-text-faint"}`}>
                  {formData[field.name] ? (
                    (() => {
                      const [h, m] = formData[field.name].split(':');
                      const hh = parseInt(h, 10);
                      const ampm = hh >= 12 ? 'PM' : 'AM';
                      const formattedH = hh % 12 === 0 ? 12 : hh % 12;
                      return `${formattedH}:${m} ${ampm}`;
                    })()
                  ) : "Select time"}
                </Text>
              </View>
              <MaterialIcons name="access-time" size={18} color="#656475" />
            </TouchableOpacity>
            {errors[field.name] ? <Text className="text-red-500 text-xs mt-1">{errors[field.name]}</Text> : null}
          </View>
        );
      }

      /* ── Default Text/Number/Email/Phone ── */
      return (
        <View key={field.name} className={`${containerClass} mb-3`}>
          <View className={`flex-row items-center ${field.multiline ? "min-h-[52px] py-2" : "h-[52px]"} bg-bg border rounded-xl px-3 ${errors[field.name] ? "border-red-500" : "border-border-brand"} ${field.disabled ? "opacity-60" : ""}`}>
            {field.icon && (
              <MaterialCommunityIcons name={field.icon as any} size={18} color="#5e5ce6" style={{ marginRight: 8 }} />
            )}
            <TextInput
              className="flex-1 text-[15px] text-text"
              placeholder={field.placeholder || field.label}
              placeholderTextColor="#a09fb1"
              value={String(formData[field.name] || "")}
              onChangeText={(text) => handleInputChange(field.name, text)}
              keyboardType={
                field.type === "number" ? "numeric"
                  : field.type === "phone" ? "phone-pad"
                  : field.type === "email" ? "email-address"
                  : field.keyboardType || "default"
              }
              multiline={field.multiline}
              numberOfLines={field.numberOfLines || (field.multiline ? 4 : 1)}
              editable={!field.disabled}
            />
          </View>
          {errors[field.name] ? <Text className="text-red-500 text-xs mt-1">{errors[field.name]}</Text> : null}
        </View>
      );
    },
    [formData, errors, tagInput, setTagInput, handleAddTag, handleRemoveTag, handleInputChange, setActiveDateField, setDatePickerVisible, setActiveTimeField, setTimePickerVisible]
  );

  const renderedFields = useMemo(() => {
    const rows: React.ReactNode[] = [];
    let currentRow: { field: FormField; index: number }[] = [];

    (fields || []).forEach((field, index) => {
      if (field.halfWidth) {
        currentRow.push({ field, index });
        if (currentRow.length === 2) {
          const rowData = [...currentRow];
          rows.push(
            <View key={`row-${index}`} className="flex-row justify-between">
              {rowData.map((item) => renderField(item.field, item.index, true))}
            </View>
          );
          currentRow = [];
        }
      } else {
        if (currentRow.length === 1) {
          rows.push(
            <View key={`row-single-${index}`} className="flex-row justify-between">
              {renderField(currentRow[0].field, currentRow[0].index, true)}
              <View className="w-[48%]" />
            </View>
          );
          currentRow = [];
        }
        rows.push(renderField(field, index, false));
      }
    });

    if (currentRow.length === 1) {
      rows.push(
        <View key="row-last" className="flex-row justify-between">
          {renderField(currentRow[0].field, currentRow[0].index, true)}
          <View className="w-[48%]" />
        </View>
      );
    }

    return rows;
  }, [fields, formData, errors, tagInput, renderField]);

  const handleDayPress = (day: DateData) => {
    if (activeDateField) {
      handleInputChange(activeDateField, day.dateString);
    }
    setDatePickerVisible(false);
    setActiveDateField(null);
  };

  const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    // On certain platforms dismissing without change closes instantly
    if (event.type === 'dismissed') {
      setTimePickerVisible(false);
      setActiveTimeField(null);
      return;
    }
    
    if (date && activeTimeField) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;
      handleInputChange(activeTimeField, timeStr);
    }
    
    setTimePickerVisible(false);
    setActiveTimeField(null);
  };

  // Reusable helper constructing valid Date instance from runtime field value to keep spinner calibrated
  const getTimeValueForPicker = () => {
    const val = activeTimeField && formData[activeTimeField];
    const d = new Date();
    if (val && typeof val === 'string' && val.includes(':')) {
      const [h, m] = val.split(':').map(Number);
      d.setHours(h, m, 0, 0);
    }
    return d;
  };

  return (
    <>
      <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
        <SafeAreaView className="flex-1 bg-surface">
          <View className="flex-1 bg-surface">
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View className="flex-row justify-between items-center mb-6 px-1">
                {/* Close Button (Left aligned if headerSubmit is true, otherwise implicit flow) */}
                {headerSubmit ? (
                  <TouchableOpacity
                    onPress={onClose}
                    className="w-9 h-9 rounded-full bg-bg items-center justify-center border border-border"
                  >
                    <MaterialIcons name="close" size={20} color="#656475" />
                  </TouchableOpacity>
                ) : (
                  <Text className="text-[18px] font-extrabold text-text">{title}</Text>
                )}

                {/* Centered Title in HeaderSubmit flow */}
                {headerSubmit && (
                  <Text className="text-[17px] font-extrabold text-text">{title}</Text>
                )}

                {/* Dynamic Right Element: Submit Tick OR default Close X */}
                {headerSubmit ? (
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-9 h-9 rounded-full items-center justify-center ${isSubmitting ? "bg-gray-200" : "bg-green-500"}`}
                    style={{ shadowColor: '#22c55e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6 }}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <MaterialIcons name="check" size={22} color="#ffffff" />
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={onClose}
                    className="w-8 h-8 rounded-full bg-brand-light justify-center items-center"
                  >
                    <MaterialIcons name="close" size={20} color="#1a1a24" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Form Fields */}
              <View>{renderedFields}</View>
              {children}

              {/* Optional Destructive Delete Row (Enabled strictly if parent provides callback) */}
              {onDelete && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    Alert.alert(
                      'Delete Record',
                      'Are you sure you want to permanently remove this from your database?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: onDelete }
                      ]
                    );
                  }}
                  className="w-full h-[54px] rounded-2xl border border-[#ffeded] bg-[#fff4f4] flex-row justify-center items-center mt-10 mb-4"
                  style={{ shadowColor: '#ff3b30', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 }}
                >
                  <MaterialIcons name="delete-sweep" size={22} color="#ff3b30" style={{ marginRight: 8 }} />
                  <Text className="text-[#ff3b30] text-[16px] font-black tracking-wide">Delete Event</Text>
                </TouchableOpacity>
              )}

              {/* Standard Submit Button (Hidden if headerSubmit is active) */}
              {!headerSubmit && (
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full h-[52px] rounded-full justify-center items-center mt-4 ${isSubmitting ? "opacity-60" : ""} bg-brand`}
                  style={{ shadowColor: '#5e5ce6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-white text-base font-bold">{submitButtonText}</Text>
                  )}
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Date Picker Modal */}
      <Modal transparent visible={isDatePickerVisible} animationType="slide" onRequestClose={() => setDatePickerVisible(false)}>
        <View className="flex-1 justify-end">
          <TouchableOpacity activeOpacity={1} className="absolute inset-0 bg-[rgba(0,0,0,0.4)]" onPress={() => setDatePickerVisible(false)} />
          <View className="bg-surface rounded-t-3xl p-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[17px] font-extrabold text-text">Select Date</Text>
              <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                <MaterialIcons name="close" size={22} color="#656475" />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={handleDayPress}
              markedDates={activeDateField && formData[activeDateField]
                ? { [formData[activeDateField]]: { selected: true, selectedColor: '#5e5ce6' } }
                : {}
              }
              theme={{
                selectedDayBackgroundColor: '#5e5ce6',
                todayTextColor: '#5e5ce6',
                arrowColor: '#5e5ce6',
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Time Picker Component (Mounts conditionally depending on trigger visibility) */}
      {isTimePickerVisible && (
        <DateTimePicker
          value={getTimeValueForPicker()}
          mode="time"
          is24Hour={false}
          display="spinner"
          onChange={handleTimeChange}
        />
      )}
    </>
  );
};

export default BottomDrawer;
