import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
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
      <View style={styles.overlay}>
        {/* Backdrop click to close */}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.backdrop}
          onPress={onClose}
        />

        <View style={styles.modalCard}>
          {/* Header Icon */}
          <View
            style={[
              styles.iconWrapper,
              isDestructive ? styles.iconWrapperDestructive : styles.iconWrapperStandard,
            ]}
          >
            <MaterialCommunityIcons
              name={iconName}
              size={28}
              color={isDestructive ? '#ff4d4f' : '#5e5ce6'}
            />
          </View>

          {/* Content */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.cancelBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onConfirm();
                onClose();
              }}
              style={[
                styles.confirmBtn,
                isDestructive ? styles.confirmBtnDestructive : styles.confirmBtnStandard,
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 36, 0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: Math.min(Dimensions.get('window').width * 0.85, 340),
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#1a1a24',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconWrapperStandard: {
    backgroundColor: '#f1f0fc',
  },
  iconWrapperDestructive: {
    backgroundColor: '#ffeef0',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a24',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    color: '#656475',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#e3e1f5',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#656475',
  },
  confirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnStandard: {
    backgroundColor: '#5e5ce6',
  },
  confirmBtnDestructive: {
    backgroundColor: '#ff4d4f',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
});

export default ConfirmationModal;
