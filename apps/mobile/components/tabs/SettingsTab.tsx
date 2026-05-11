import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SettingsTabProps {
  styles: any;
  email: string;
  handleDeleteAccount: (password: string) => Promise<void>;
  handleLogout: () => void;
  useCelsius: boolean;
  darkMode: boolean;
  onPreferenceChange: (key: 'useCelsius' | 'darkMode', val: boolean) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  email,
  handleDeleteAccount,
  handleLogout,
  useCelsius,
  darkMode,
  onPreferenceChange,
}) => {
  const [pushEnabled, setPushEnabled] = useState(true);

  // Delete account modal state machine
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'password'>('confirm');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const userName = email ? email.split('@')[0] : 'User';
  const capitalizedName = userName.charAt(0).toUpperCase() + userName.slice(1);

  const openDeleteModal = () => {
    setDeleteStep('confirm');
    setDeletePassword('');
    setDeleteError('');
    setDeleteLoading(false);
    setPasswordVisible(false);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setDeletePassword('');
    setDeleteError('');
    setDeleteLoading(false);
    setPasswordVisible(false);
  };

  const handleConfirmStep = () => {
    setDeleteStep('password');
    setDeleteError('');
  };

  const handlePasswordSubmit = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Please enter your password');
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    try {
      await handleDeleteAccount(deletePassword);
      closeDeleteModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Deletion failed. Please try again.';
      setDeleteError(msg);
      setDeleteLoading(false);
    }
  };

  return (
    <ScrollView
      style={localStyles.mainScroll}
      contentContainerStyle={localStyles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* PREMIUM AVATAR HEADER */}
      <View style={localStyles.headerCard}>
        <View style={localStyles.avatarWrapper}>
          <View style={localStyles.avatarRing}>
            <Image
              source={{ uri: 'https://ui-avatars.com/api/?name=' + capitalizedName + '&background=5e5ce6&color=fff&size=128' }}
              style={localStyles.avatarImage}
            />
          </View>
          <TouchableOpacity style={localStyles.editBadge}>
            <MaterialCommunityIcons name="camera" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <Text style={localStyles.userNameText}>{capitalizedName}</Text>
        <Text style={localStyles.userEmailSub}>{email || 'wearnext@example.com'}</Text>

        <TouchableOpacity style={localStyles.editProfileBtn}>
          <Text style={localStyles.editProfileBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* PREFERENCES SECTION */}
      <Text style={localStyles.sectionHeading}>APP PREFERENCES</Text>
      <View style={localStyles.optionsCard}>
        <View style={localStyles.optionRow}>
          <View style={localStyles.optionInfo}>
            <View style={[localStyles.iconBox, { backgroundColor: '#eef2ff' }]}>
              <MaterialCommunityIcons name="bell-outline" size={20} color="#5e5ce6" />
            </View>
            <Text style={localStyles.optionLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: '#e3e1e9', true: '#5e5ce6' }}
            thumbColor={'#ffffff'}
          />
        </View>

        <View style={localStyles.divider} />

        <View style={localStyles.optionRow}>
          <View style={localStyles.optionInfo}>
            <View style={[localStyles.iconBox, { backgroundColor: '#fff7ed' }]}>
              <MaterialCommunityIcons name="thermometer" size={20} color="#ea580c" />
            </View>
            <Text style={localStyles.optionLabel}>Use Celsius (°C)</Text>
          </View>
          <Switch
            value={useCelsius}
            onValueChange={(v) => onPreferenceChange('useCelsius', v)}
            trackColor={{ false: '#e3e1e9', true: '#f97316' }}
            thumbColor={'#ffffff'}
          />
        </View>

        <View style={localStyles.divider} />

        <View style={localStyles.optionRow}>
          <View style={localStyles.optionInfo}>
            <View style={[localStyles.iconBox, { backgroundColor: '#f3f4f6' }]}>
              <MaterialCommunityIcons name="weather-night" size={20} color="#374151" />
            </View>
            <Text style={localStyles.optionLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={(v) => onPreferenceChange('darkMode', v)}
            trackColor={{ false: '#e3e1e9', true: '#374151' }}
            thumbColor={'#ffffff'}
          />
        </View>
      </View>

      {/* WARDROBE & AI SECTION */}
      <Text style={localStyles.sectionHeading}>SMART STYLING</Text>
      <View style={localStyles.optionsCard}>
        <TouchableOpacity style={localStyles.optionRowClickable}>
          <View style={localStyles.optionInfo}>
            <View style={[localStyles.iconBox, { backgroundColor: '#ecfdf5' }]}>
              <MaterialCommunityIcons name="palette-swatch-outline" size={20} color="#059669" />
            </View>
            <View>
              <Text style={localStyles.optionLabel}>Preferred Event Profile</Text>
              <Text style={localStyles.optionSubtitle}>Casual, Formal, Active</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#8b8a9f" />
        </TouchableOpacity>

        <View style={localStyles.divider} />

        <TouchableOpacity style={localStyles.optionRowClickable}>
          <View style={localStyles.optionInfo}>
            <View style={[localStyles.iconBox, { backgroundColor: '#fef2f2' }]}>
              <MaterialCommunityIcons name="map-marker-outline" size={20} color="#dc2626" />
            </View>
            <Text style={localStyles.optionLabel}>Location Accuracy</Text>
          </View>
          <View style={localStyles.pillBadge}>
            <Text style={localStyles.pillBadgeText}>High</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* SUPPORT & LEGAL */}
      <Text style={localStyles.sectionHeading}>SUPPORT & LEGAL</Text>
      <View style={localStyles.optionsCard}>
        <TouchableOpacity style={localStyles.optionRowClickable}>
          <View style={localStyles.optionInfo}>
            <View style={[localStyles.iconBox, { backgroundColor: '#f5f3ff' }]}>
              <MaterialCommunityIcons name="frequently-asked-questions" size={20} color="#7c3aed" />
            </View>
            <Text style={localStyles.optionLabel}>Help & FAQ</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#8b8a9f" />
        </TouchableOpacity>

        <View style={localStyles.divider} />

        <TouchableOpacity style={localStyles.optionRowClickable}>
          <View style={localStyles.optionInfo}>
            <View style={[localStyles.iconBox, { backgroundColor: '#e0f2fe' }]}>
              <MaterialCommunityIcons name="shield-check-outline" size={20} color="#0284c7" />
            </View>
            <Text style={localStyles.optionLabel}>Privacy Policy</Text>
          </View>
          <MaterialCommunityIcons name="open-in-new" size={18} color="#8b8a9f" />
        </TouchableOpacity>
      </View>

      {/* DANGER ZONE */}
      <View style={localStyles.dangerArea}>
        <TouchableOpacity style={localStyles.signoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#656475" style={{ marginRight: 8 }} />
          <Text style={localStyles.signoutBtnText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={localStyles.deleteBtn} onPress={openDeleteModal}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef4444" style={{ marginRight: 6 }} />
          <Text style={localStyles.deleteBtnText}>Delete Account permanently</Text>
        </TouchableOpacity>
      </View>

      <Text style={localStyles.versionText}>WearNext v1.0.0 • Made for style</Text>
      <View style={{ height: 40 }} />

      {/* ═══════ DELETE ACCOUNT MODAL ═══════ */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteModal}
      >
        <View style={modalStyles.backdrop}>
          <View style={modalStyles.card}>
            {/* Close button */}
            <TouchableOpacity style={modalStyles.closeBtn} onPress={closeDeleteModal}>
              <MaterialCommunityIcons name="close" size={20} color="#8b8a9f" />
            </TouchableOpacity>

            {deleteStep === 'confirm' ? (
              /* ─── Step 1: Confirmation ─── */
              <>
                <View style={modalStyles.iconCircle}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={36} color="#ef4444" />
                </View>
                <Text style={modalStyles.title}>Delete Account?</Text>
                <Text style={modalStyles.body}>
                  This will permanently erase your wardrobe, preferences, and all personal data. This action cannot be undone.
                </Text>
                <View style={modalStyles.buttonRow}>
                  <TouchableOpacity style={modalStyles.cancelBtn} onPress={closeDeleteModal}>
                    <Text style={modalStyles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={modalStyles.destructBtn} onPress={handleConfirmStep}>
                    <Text style={modalStyles.destructBtnText}>Yes, Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              /* ─── Step 2: Password Verification ─── */
              <>
                <View style={modalStyles.iconCircle}>
                  <MaterialCommunityIcons name="lock-outline" size={34} color="#ef4444" />
                </View>
                <Text style={modalStyles.title}>Verify Your Identity</Text>
                <Text style={modalStyles.body}>
                  Enter your account password to confirm permanent deletion.
                </Text>

                <View style={modalStyles.inputWrapper}>
                  <MaterialCommunityIcons name="key-variant" size={18} color="#8b8a9f" style={{ marginRight: 10 }} />
                  <TextInput
                    style={modalStyles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#b1b0c5"
                    secureTextEntry={!passwordVisible}
                    value={deletePassword}
                    onChangeText={(t) => { setDeletePassword(t); setDeleteError(''); }}
                    autoFocus
                    editable={!deleteLoading}
                  />
                  <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                    <MaterialCommunityIcons
                      name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#8b8a9f"
                    />
                  </TouchableOpacity>
                </View>

                {deleteError !== '' && (
                  <View style={modalStyles.errorRow}>
                    <MaterialCommunityIcons name="alert-circle" size={14} color="#ef4444" />
                    <Text style={modalStyles.errorText}>{deleteError}</Text>
                  </View>
                )}

                <View style={modalStyles.buttonRow}>
                  <TouchableOpacity style={modalStyles.cancelBtn} onPress={closeDeleteModal} disabled={deleteLoading}>
                    <Text style={modalStyles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[modalStyles.destructBtn, deleteLoading && { opacity: 0.6 }]}
                    onPress={handlePasswordSubmit}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={modalStyles.destructBtnText}>Delete Forever</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

/* ═══════ MODAL STYLES ═══════ */
const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
    zIndex: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1a1a24',
    marginBottom: 10,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    color: '#656475',
    fontWeight: '500',
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f7fc',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e3e1ea',
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a24',
    fontWeight: '500',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f5f4fd',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#656475',
    fontWeight: '700',
    fontSize: 14,
  },
  destructBtn: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  destructBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});

/* ═══════ SETTINGS PAGE STYLES ═══════ */
const localStyles = StyleSheet.create({
  mainScroll: {
    flex: 1,
  },
  container: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 30,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#5e5ce620',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f0ff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#5e5ce6',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a24',
    marginBottom: 4,
  },
  userEmailSub: {
    fontSize: 14,
    color: '#8b8a9f',
    fontWeight: '500',
    marginBottom: 20,
  },
  editProfileBtn: {
    backgroundColor: '#f5f4fd',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editProfileBtnText: {
    color: '#5e5ce6',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8b8a9f',
    letterSpacing: 1.5,
    marginLeft: 12,
    marginBottom: 10,
  },
  optionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 28,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionRowClickable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a24',
  },
  optionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8b8a9f',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f5f4fa',
    marginHorizontal: 20,
  },
  pillBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillBadgeText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '700',
  },
  dangerArea: {
    alignItems: 'center',
    marginTop: 10,
  },
  signoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e3e1ea',
    marginBottom: 16,
  },
  signoutBtnText: {
    color: '#656475',
    fontWeight: '700',
    fontSize: 15,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  deleteBtnText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  versionText: {
    textAlign: 'center',
    color: '#b1b0c5',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 30,
    letterSpacing: 0.5,
  },
});
