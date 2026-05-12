import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  iconName = 'alert-circle',
  isDestructive = false,
}) => {
  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <View className="flex-1 justify-center items-center bg-[rgba(26,26,36,0.6)]">
        <TouchableOpacity
          activeOpacity={1}
          className="absolute inset-0"
          onPress={onClose}
        />

        {/* Card */}
        <View
          className="w-[85%] max-w-[340px] bg-surface rounded-3xl p-6 items-center"
          style={{ shadowColor: '#1a1a24', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 }}
        >
          {/* Icon */}
          <View
            className={`w-[60px] h-[60px] rounded-full justify-center items-center mb-4 ${
              isDestructive ? 'bg-[#ffeef0]' : 'bg-brand-light'
            }`}
          >
            <MaterialCommunityIcons
              name={iconName}
              size={28}
              color={isDestructive ? '#ff4d4f' : '#3182ce'}
            />
          </View>

          {/* Content */}
          <Text className="text-[18px] font-extrabold text-dark mb-2 text-center dark:text-light">{title}</Text>
          <Text className="text-[13px] font-semibold text-muted leading-5 text-center mb-6 dark:text-light">{message}</Text>

          {/* Actions */}
          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              className="flex-1 h-11 rounded-full border-[1.5px] border-border-brand bg-surface justify-center items-center"
            >
              <Text className="text-[13px] font-extrabold text-muted dark:text-light">{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onConfirm();
                onClose();
              }}
              activeOpacity={0.8}
              className={`flex-1 h-11 rounded-full justify-center items-center ${
                isDestructive ? 'bg-[#ff4d4f]' : 'bg-brand'
              }`}
            >
              <Text className="text-[13px] font-extrabold text-white">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;
