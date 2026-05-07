import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Alert, StyleSheet, View, FlatList, ActivityIndicator, ScrollView, Image } from "react-native";
import {
  HelperText,
  Menu,
  TextInput,
  TouchableRipple,
  useTheme,
  Modal,
  Portal,
  Surface,
  List,
  Checkbox,
  Chip,
  Button,
  Text,
  IconButton,
} from "react-native-paper";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Calendar, DateData } from "react-native-calendars";
import * as ImagePicker from "expo-image-picker";

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
  subFields?: FormField[]; // For dynamic-list
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
  children?: React.ReactNode;
};

const PaperFormDropdown = ({
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
  const theme = useTheme();

  return (
    <View style={styles.inputContainer}>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <TouchableRipple
            onPress={() => !disabled && setVisible(true)}
            disabled={disabled}
          >
            <View pointerEvents="none">
              <TextInput
                mode="outlined"
                label={label}
                value={selectedValue}
                editable={false}
                disabled={disabled}
                theme={{ colors: { primary: '#5e5ce6', outline: '#e3e1f5' } }}
                left={
                  leftIcon && (
                    <TextInput.Icon
                      icon={() => (
                        <MaterialCommunityIcons
                          name={leftIcon as any}
                          size={18}
                          color="#5e5ce6"
                        />
                      )}
                    />
                  )
                }
                right={
                  <TextInput.Icon
                    icon={() => (
                      <MaterialCommunityIcons
                        name="chevron-down"
                        size={16}
                        color="#656475"
                      />
                    )}
                  />
                }
                error={!!error}
              />
            </View>
          </TouchableRipple>
        }
      >
        {items.map((item: string) => (
          <Menu.Item
            key={item}
            title={item}
            onPress={() => {
              onSelect(item);
              setVisible(false);
            }}
          />
        ))}
      </Menu>
      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
    </View>
  );
};

const PaperFormAutocomplete = ({
  label,
  value,
  onSelect,
  items,
  error,
  leftIcon,
  placeholder,
  isLoading,
}: {
  label: string;
  value: string;
  onSelect: (value: string) => void;
  items: string[];
  error?: string;
  leftIcon?: string;
  placeholder?: string;
  isLoading?: boolean;
}) => {
  const [visible, setVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const theme = useTheme();

  useEffect(() => {
    if (value) {
      setSuggestions(
        items.filter((item) => item.toLowerCase().includes(value.toLowerCase()))
      );
    } else {
      setSuggestions(items);
    }
  }, [value, items]);

  return (
    <View style={styles.autocompleteContainer}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        placeholder={placeholder}
        onChangeText={(text) => {
          onSelect(text);
          setVisible(true);
        }}
        onFocus={() => setVisible(true)}
        onBlur={() => setTimeout(() => setVisible(false), 200)}
        theme={{ colors: { primary: '#5e5ce6', outline: '#e3e1f5' } }}
        error={!!error}
        left={
          leftIcon && (
            <TextInput.Icon
              icon={() => (
                <MaterialCommunityIcons
                  name={leftIcon as any}
                  size={18}
                  color="#5e5ce6"
                />
              )}
            />
          )
        }
        right={
          isLoading ? (
            <TextInput.Icon icon={() => <ActivityIndicator size="small" />} />
          ) : (
            <TextInput.Icon icon="menu-down" onPress={() => setVisible(!visible)} />
          )
        }
      />
      {visible && suggestions.length > 0 && (
        <Surface
          style={[
            styles.suggestionsSurface,
            { backgroundColor: '#ffffff', borderColor: '#e3e1f5', borderWidth: 1 },
          ]}
          elevation={3}
        >
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <List.Item
                title={item}
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                }}
              />
            )}
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 200 }}
          />
        </Surface>
      )}
      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>
    </View>
  );
};

export const BottomDrawer = ({
  isVisible,
  onClose,
  title,
  fields,
  initialValues,
  onSubmit,
  submitButtonText = "Save",
  isSubmitting: isSubmittingProp,
  children,
}: BottomDrawerProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmittingInternal, setIsSubmittingInternal] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [activeDateField, setActiveDateField] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  const theme = useTheme();

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
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddTag = (fieldName: string, tag: string) => {
    if (!tag.trim()) return;
    const currentTags = Array.isArray(formData[fieldName])
      ? formData[fieldName]
      : [];
    if (!currentTags.includes(tag.trim())) {
      handleInputChange(fieldName, [...currentTags, tag.trim()]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (fieldName: string, tagToRemove: string) => {
    const currentTags = Array.isArray(formData[fieldName])
      ? formData[fieldName]
      : [];
    handleInputChange(
      fieldName,
      currentTags.filter((t: string) => t !== tagToRemove)
    );
  };

  const handleDynamicListChange = (
    fieldName: string,
    index: number,
    subFieldName: string,
    value: any
  ) => {
    const currentList = Array.isArray(formData[fieldName])
      ? [...formData[fieldName]]
      : [{}];
    currentList[index] = { ...currentList[index], [subFieldName]: value };
    handleInputChange(fieldName, currentList);
  };

  const handleAddDynamicListItem = (fieldName: string) => {
    const currentList = Array.isArray(formData[fieldName])
      ? [...formData[fieldName]]
      : [];
    handleInputChange(fieldName, [...currentList, {}]);
  };

  const handleRemoveDynamicListItem = (fieldName: string, index: number) => {
    const currentList = Array.isArray(formData[fieldName])
      ? [...formData[fieldName]]
      : [];
    handleInputChange(
      fieldName,
      currentList.filter((_, i) => i !== index)
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    (fields || []).forEach((field) => {
      if (field.required && !String(formData[field.name] || "").trim()) {
        newErrors[field.name] = `${field.label} is required.`;
      } else if (
        field.type === "email" &&
        formData[field.name] &&
        !/\S+@\S+\.\S+/.test(formData[field.name])
      ) {
        newErrors[field.name] = "Please enter a valid email address.";
      } else if (field.type === "phone" && formData[field.name]) {
        const E164_REGEX = /^\+?[1-9]\d{9,14}$/;
        if (!E164_REGEX.test(formData[field.name].replace(/\s/g, ""))) {
          newErrors[field.name] = "Enter a valid phone number.";
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert(
        "Validation Error",
        "Please fill all required fields correctly."
      );
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

  const renderField = useCallback((field: FormField, index: number, isHalf: boolean) => {
    const containerStyle = isHalf ? styles.halfWidth : styles.fullWidth;

    if (field.type === "image") {
      const selectedImage = formData[field.name];

      const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
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
        <View key={field.name} style={[styles.imageUploadWrapper, containerStyle]}>
          <Text style={styles.imageLabel}>{field.label}</Text>
          <TouchableRipple onPress={pickImage} style={styles.imagePickerBtn}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.pickedImage} />
            ) : (
              <View style={styles.placeholderContainer}>
                <MaterialCommunityIcons name="camera-plus-outline" size={32} color="#5e5ce6" />
                <Text style={styles.placeholderText}>Select or Upload Image</Text>
              </View>
            )}
          </TouchableRipple>
          <HelperText type="error" visible={!!errors[field.name]}>
            {errors[field.name]}
          </HelperText>
        </View>
      );
    }

    if (field.type === "dynamic-list") {
      const items = Array.isArray(formData[field.name])
        ? formData[field.name]
        : [{}];
      return (
        <View key={field.name} style={styles.fullWidth}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {field.label}
          </Text>
          {items.map((item: any, itemIndex: number) => (
            <Surface
              key={`${field.name}-${itemIndex}`}
              style={styles.dynamicListItem}
              elevation={1}
            >
              <View style={styles.dynamicListHeader}>
                <Text variant="labelLarge">
                  {field.label} #{itemIndex + 1}
                </Text>
                {items.length > 1 && (
                  <IconButton
                    icon="close-circle"
                    iconColor={theme.colors.error}
                    size={20}
                    onPress={() =>
                      handleRemoveDynamicListItem(field.name, itemIndex)
                    }
                  />
                )}
              </View>
              <View style={styles.dynamicListContent}>
                {field.subFields?.map((subField) => {
                  const subFieldName = subField.name;
                  const handleSubInputChange = (val: any) =>
                    handleDynamicListChange(
                      field.name,
                      itemIndex,
                      subFieldName,
                      val
                    );

                  const tempField: FormField = {
                    ...subField,
                    name: `${field.name}-${itemIndex}-${subFieldName}`,
                  };

                  return (
                    <View
                      key={tempField.name}
                      style={subField.halfWidth ? styles.halfWidth : styles.fullWidth}
                    >
                      {subField.type === "dropdown" ? (
                        <PaperFormDropdown
                          label={subField.label}
                          items={subField.items || []}
                          selectedValue={item[subFieldName] || ""}
                          onSelect={handleSubInputChange}
                          leftIcon={subField.icon}
                        />
                      ) : (
                        <TextInput
                          mode="outlined"
                          label={subField.label}
                          value={String(item[subFieldName] || "")}
                          onChangeText={handleSubInputChange}
                          keyboardType={
                            subField.type === "number" ? "numeric" : "default"
                          }
                          left={
                            subField.icon && (
                              <TextInput.Icon
                                icon={() => (
                                  <MaterialCommunityIcons
                                    name={subField.icon as any}
                                    size={18}
                                    color="#5e5ce6"
                                  />
                                )}
                              />
                            )
                          }
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            </Surface>
          ))}
          <Button
            mode="text"
            onPress={() => handleAddDynamicListItem(field.name)}
            icon="plus"
            style={styles.addButton}
          >
            Add Another {field.label}
          </Button>
        </View>
      );
    }

    if (field.type === "tags") {
      const currentTags = Array.isArray(formData[field.name])
        ? formData[field.name]
        : [];
      return (
        <View key={field.name} style={containerStyle}>
          <TextInput
            mode="outlined"
            label={field.label}
            placeholder={field.placeholder || "Type and press add"}
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={() => handleAddTag(field.name, tagInput)}
            theme={{ colors: { primary: '#5e5ce6', outline: '#e3e1f5' } }}
            right={
              <TextInput.Icon
                icon="plus"
                onPress={() => handleAddTag(field.name, tagInput)}
              />
            }
          />
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 8,
              marginBottom: 12,
            }}
          >
            {currentTags.map((tag: string) => (
              <Chip
                key={tag}
                onClose={() => handleRemoveTag(field.name, tag)}
                style={{ backgroundColor: "#f1f0fc" }}
              >
                {tag}
              </Chip>
            ))}
          </View>
        </View>
      );
    }

    if (field.type === "dropdown" || field.type === "autocomplete") {
      return (
        <View key={field.name} style={containerStyle}>
          {field.type === "dropdown" ? (
            <PaperFormDropdown
              label={field.label}
              items={field.items || []}
              selectedValue={formData[field.name] || ""}
              onSelect={(val) => handleInputChange(field.name, val)}
              error={errors[field.name]}
              leftIcon={field.icon}
              disabled={field.disabled}
            />
          ) : (
            <PaperFormAutocomplete
              label={field.label}
              items={field.items || []}
              value={formData[field.name] || ""}
              onSelect={(val) => handleInputChange(field.name, val)}
              error={errors[field.name]}
              leftIcon={field.icon}
              placeholder={field.placeholder}
              isLoading={false}
            />
          )}
        </View>
      );
    }

    if (field.type === "checkbox") {
      return (
        <View
          key={field.name}
          style={[containerStyle, { marginBottom: 12, justifyContent: 'center' }]}
        >
          <Checkbox.Item
            label={field.label}
            status={formData[field.name] ? "checked" : "unchecked"}
            onPress={() => handleInputChange(field.name, !formData[field.name])}
            mode="android"
            disabled={field.disabled}
          />
        </View>
      );
    }

    if (field.type === "date") {
      return (
        <View key={field.name} style={containerStyle}>
          <TouchableRipple
            onPress={() => {
              setActiveDateField(field.name);
              setDatePickerVisible(true);
            }}
            disabled={field.disabled}
          >
            <View pointerEvents="none">
              <TextInput
                mode="outlined"
                label={field.label}
                value={formData[field.name] || ""}
                placeholder="Select date"
                editable={false}
                disabled={field.disabled}
                theme={{ colors: { primary: '#5e5ce6', outline: '#e3e1f5' } }}
                error={!!errors[field.name]}
                left={
                  field.icon && (
                    <TextInput.Icon
                      icon={() => (
                        <MaterialCommunityIcons
                          name={field.icon as any}
                          size={18}
                          color="#5e5ce6"
                        />
                      )}
                    />
                  )
                }
                right={<TextInput.Icon icon="calendar" />}
              />
            </View>
          </TouchableRipple>
          <HelperText type="error" visible={!!errors[field.name]}>
            {errors[field.name]}
          </HelperText>
        </View>
      );
    }

    return (
      <View key={field.name} style={containerStyle}>
        <TextInput
          mode="outlined"
          label={field.label}
          placeholder={field.placeholder}
          value={String(formData[field.name] || "")}
          onChangeText={(text) => handleInputChange(field.name, text)}
          error={!!errors[field.name]}
          theme={{ colors: { primary: '#5e5ce6', outline: '#e3e1f5' } }}
          keyboardType={
            field.type === "number"
              ? "numeric"
              : field.type === "phone"
              ? "phone-pad"
              : field.type === "email"
              ? "email-address"
              : field.keyboardType || "default"
          }
          multiline={field.multiline}
          numberOfLines={field.numberOfLines || (field.multiline ? 4 : 1)}
          disabled={field.disabled}
          left={
            field.icon && (
              <TextInput.Icon
                icon={() => (
                  <MaterialCommunityIcons
                    name={field.icon as any}
                    size={18}
                    color="#5e5ce6"
                  />
                )}
              />
            )
          }
        />
        <HelperText type="error" visible={!!errors[field.name]}>
          {errors[field.name]}
        </HelperText>
      </View>
    );
  }, [
    formData,
    theme,
    handleRemoveDynamicListItem,
    handleDynamicListChange,
    handleAddDynamicListItem,
    tagInput,
    setTagInput,
    handleAddTag,
    handleRemoveTag,
    handleInputChange,
    errors,
    setActiveDateField,
    setDatePickerVisible,
  ]);

  const renderedFields = useMemo(() => {
    const rows: React.ReactNode[] = [];
    let currentRow: { field: FormField; index: number }[] = [];

    (fields || []).forEach((field, index) => {
      if (field.halfWidth) {
        currentRow.push({ field, index });
        if (currentRow.length === 2) {
          const rowData = [...currentRow];
          rows.push(
            <View key={`row-${index}`} style={styles.row}>
              {rowData.map((item) => renderField(item.field, item.index, true))}
            </View>
          );
          currentRow = [];
        }
      } else {
        if (currentRow.length === 1) {
          rows.push(
            <View key={`row-single-${index}`} style={styles.row}>
              {renderField(currentRow[0].field, currentRow[0].index, true)}
              <View style={styles.halfWidth} />
            </View>
          );
          currentRow = [];
        }
        rows.push(renderField(field, index, false));
      }
    });

    if (currentRow.length === 1) {
      rows.push(
        <View key="row-last" style={styles.row}>
          {renderField(currentRow[0].field, currentRow[0].index, true)}
          <View style={styles.halfWidth} />
        </View>
      );
    }

    return rows;
  }, [fields, formData, errors, theme, tagInput, renderField]);

  const handleDayPress = (day: DateData) => {
    if (activeDateField) {
      handleInputChange(activeDateField, day.dateString);
    }
    setDatePickerVisible(false);
    setActiveDateField(null);
  };

  return (
    <>
      <Portal>
        <Modal
          visible={isVisible}
          onDismiss={onClose}
          contentContainerStyle={[
            styles.drawerModalContent,
            { backgroundColor: '#ffffff' },
          ]}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>
                {title}
              </Text>
              <IconButton icon="close" iconColor="#1a1a24" size={24} onPress={onClose} />
            </View>
            <View style={styles.formContainer}>
              {renderedFields}
              {children}
            </View>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              buttonColor="#5e5ce6"
              textColor="#ffffff"
              style={styles.submitBtn}
            >
              {submitButtonText}
            </Button>
          </ScrollView>
        </Modal>
      </Portal>

      <Portal>
        <Modal
          visible={isDatePickerVisible}
          onDismiss={() => setDatePickerVisible(false)}
          contentContainerStyle={[
            styles.dateModalContent,
            { backgroundColor: '#ffffff' },
          ]}
        >
          <Calendar
            onDayPress={handleDayPress}
            markedDates={
              activeDateField && formData[activeDateField]
                ? {
                    [formData[activeDateField]]: {
                      selected: true,
                      disableTouchEvent: true,
                    },
                  }
                : {}
            }
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#656475',
              selectedDayBackgroundColor: '#5e5ce6',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#5e5ce6',
              dayTextColor: '#1a1a24',
              textDisabledColor: '#8b8a9f',
              arrowColor: '#5e5ce6',
              monthTextColor: '#1a1a24',
            }}
          />
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  formContainer: { gap: 12, marginBottom: 16 },
  inputContainer: { marginBottom: 4 },
  autocompleteContainer: { position: "relative", marginBottom: 4 },
  suggestionsSurface: {
    position: "absolute",
    top: 54,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderRadius: 4,
    maxHeight: 200,
  },
  row: { flexDirection: "row", gap: 16 },
  halfWidth: { flex: 1 },
  fullWidth: { width: "100%" },
  dateModalContent: { margin: 20, borderRadius: 16 },
  drawerModalContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "85%",
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  scrollContainer: { paddingBottom: 24 },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  drawerTitle: { fontSize: 22, fontWeight: "900", color: "#1a1a24" },
  submitBtn: { marginTop: 12, borderRadius: 25, paddingVertical: 6 },
  addButton: { alignSelf: "flex-start", marginTop: 8 },
  sectionTitle: { marginTop: 16, marginBottom: 8, fontWeight: "bold" },
  dynamicListItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  dynamicListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dynamicListContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  // Image upload custom styles
  imageUploadWrapper: {
    marginBottom: 10,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#656475",
    marginBottom: 8,
  },
  imagePickerBtn: {
    width: "100%",
    height: 150,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e3e1f5",
    borderStyle: "dashed",
    backgroundColor: "#f1f0fc",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  pickedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#5e5ce6",
  },
});

export default BottomDrawer;
