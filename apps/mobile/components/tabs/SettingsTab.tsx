import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SettingsTabProps {
  styles: any;
  email: string;
  handleDeleteAccount: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  styles,
  email,
  handleDeleteAccount,
}) => {
  return (
    <View style={styles.settingsContainer}>
      <View style={styles.settingsCard}>
        <Text style={styles.settingsCardTitle}>Account Settings</Text>
        <Text style={styles.settingsEmailLabel}>EMAIL ADDRESS</Text>
        <Text style={styles.settingsEmailValue}>{email || 'name@example.com'}</Text>
        
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Text style={styles.deleteBtnText}>Delete Account Permanently</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
