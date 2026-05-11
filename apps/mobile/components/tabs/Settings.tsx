import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  styles?: any; // kept for backward compat but unused
  email: string;
  handleDeleteAccount: (password: string) => Promise<void>;
  useCelsius: boolean;
  darkMode: boolean;
  onPreferenceChange: (key: 'useCelsius' | 'darkMode', val: boolean) => void;
}

export const Settings: React.FC<Props> = ({
  email,
  handleDeleteAccount,
  useCelsius,
  darkMode,
  onPreferenceChange,
}) => {
  const [pushEnabled, setPushEnabled] = useState(true);
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

  const handleConfirmStep = () => { setDeleteStep('password'); setDeleteError(''); };

  const handlePasswordSubmit = async () => {
    if (!deletePassword.trim()) { setDeleteError('Please enter your password'); return; }
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
    <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 4 }} showsVerticalScrollIndicator={false}>

      {/* Avatar Header Card */}
      <View
        className="bg-surface rounded-[28px] p-6 items-center mb-8"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.03, shadowRadius: 20, elevation: 3 }}
      >
        <View className="relative mb-4">
          <View className="p-1 rounded-full border-2 border-[#5e5ce620]">
            <Image
              source={{ uri: 'https://ui-avatars.com/api/?name=' + capitalizedName + '&background=5e5ce6&color=fff&size=128' }}
              className="w-20 h-20 rounded-full bg-[#f1f0ff]"
            />
          </View>
          <TouchableOpacity className="absolute bottom-0.5 right-0.5 bg-brand w-7 h-7 rounded-full justify-center items-center border-[3px] border-surface">
            <MaterialCommunityIcons name="camera" size={14} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <Text className="text-[20px] font-extrabold text-text mb-1">{capitalizedName}</Text>
        <Text className="text-sm text-text-faint font-medium mb-5">{email || 'wearnext@example.com'}</Text>

        <TouchableOpacity className="bg-[#f5f4fd] px-6 py-2.5 rounded-full">
          <Text className="text-brand font-bold text-[13px]">Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* App Preferences */}
      <Text className="text-[11px] font-extrabold text-text-faint tracking-widest ml-3 mb-2.5">APP PREFERENCES</Text>
      <View
        className="bg-surface rounded-3xl overflow-hidden mb-7"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 }}
      >
        {[
          { icon: 'bell-outline', iconBg: '#eef2ff', iconColor: '#5e5ce6', label: 'Push Notifications', value: pushEnabled, onChange: setPushEnabled, trackOn: '#5e5ce6' },
          { icon: 'thermometer', iconBg: '#fff7ed', iconColor: '#ea580c', label: 'Use Celsius (°C)', value: useCelsius, onChange: (v: boolean) => onPreferenceChange('useCelsius', v), trackOn: '#f97316' },
          { icon: 'weather-night', iconBg: '#f3f4f6', iconColor: '#374151', label: 'Dark Mode', value: darkMode, onChange: (v: boolean) => onPreferenceChange('darkMode', v), trackOn: '#374151' },
        ].map((opt, i, arr) => (
          <React.Fragment key={opt.label}>
            <View className="flex-row justify-between items-center px-5 py-4">
              <View className="flex-row items-center">
                <View className="w-[38px] h-[38px] rounded-xl justify-center items-center mr-4" style={{ backgroundColor: opt.iconBg }}>
                  <MaterialCommunityIcons name={opt.icon as any} size={20} color={opt.iconColor} />
                </View>
                <Text className="text-[15px] font-semibold text-text">{opt.label}</Text>
              </View>
              <Switch
                value={opt.value}
                onValueChange={opt.onChange}
                trackColor={{ false: '#e3e1e9', true: opt.trackOn }}
                thumbColor="#ffffff"
              />
            </View>
            {i < arr.length - 1 && <View className="h-px bg-[#f5f4fa] mx-5" />}
          </React.Fragment>
        ))}
      </View>

      {/* Smart Styling */}
      <Text className="text-[11px] font-extrabold text-text-faint tracking-widest ml-3 mb-2.5">SMART STYLING</Text>
      <View
        className="bg-surface rounded-3xl overflow-hidden mb-7"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 }}
      >
        <TouchableOpacity className="flex-row justify-between items-center px-5 py-[18px]">
          <View className="flex-row items-center">
            <View className="w-[38px] h-[38px] rounded-xl bg-[#ecfdf5] justify-center items-center mr-4">
              <MaterialCommunityIcons name="palette-swatch-outline" size={20} color="#059669" />
            </View>
            <View>
              <Text className="text-[15px] font-semibold text-text">Preferred Event Profile</Text>
              <Text className="text-xs font-medium text-text-faint mt-0.5">Casual, Formal, Active</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#8b8a9f" />
        </TouchableOpacity>

        <View className="h-px bg-[#f5f4fa] mx-5" />

        <TouchableOpacity className="flex-row justify-between items-center px-5 py-[18px]">
          <View className="flex-row items-center">
            <View className="w-[38px] h-[38px] rounded-xl bg-[#fef2f2] justify-center items-center mr-4">
              <MaterialCommunityIcons name="map-marker-outline" size={20} color="#dc2626" />
            </View>
            <Text className="text-[15px] font-semibold text-text">Location Accuracy</Text>
          </View>
          <View className="bg-[#f0fdf4] px-2.5 py-1 rounded-xl">
            <Text className="text-[#16a34a] text-xs font-bold">High</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Support & Legal */}
      <Text className="text-[11px] font-extrabold text-text-faint tracking-widest ml-3 mb-2.5">SUPPORT & LEGAL</Text>
      <View
        className="bg-surface rounded-3xl overflow-hidden mb-7"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2 }}
      >
        <TouchableOpacity className="flex-row justify-between items-center px-5 py-[18px]">
          <View className="flex-row items-center">
            <View className="w-[38px] h-[38px] rounded-xl bg-[#f5f3ff] justify-center items-center mr-4">
              <MaterialCommunityIcons name="frequently-asked-questions" size={20} color="#7c3aed" />
            </View>
            <Text className="text-[15px] font-semibold text-text">Help & FAQ</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#8b8a9f" />
        </TouchableOpacity>

        <View className="h-px bg-[#f5f4fa] mx-5" />

        <TouchableOpacity className="flex-row justify-between items-center px-5 py-[18px]">
          <View className="flex-row items-center">
            <View className="w-[38px] h-[38px] rounded-xl bg-[#e0f2fe] justify-center items-center mr-4">
              <MaterialCommunityIcons name="shield-check-outline" size={20} color="#0284c7" />
            </View>
            <Text className="text-[15px] font-semibold text-text">Privacy Policy</Text>
          </View>
          <MaterialCommunityIcons name="open-in-new" size={18} color="#8b8a9f" />
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View className="items-center mt-2">
        <TouchableOpacity className="flex-row items-center py-2" onPress={openDeleteModal}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef4444" style={{ marginRight: 6 }} />
          <Text className="text-[#ef4444] font-semibold text-sm underline">Delete Account permanently</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-center text-[#b1b0c5] text-[11px] font-semibold mt-8 tracking-wide">WearNext v1.0.0 • Made for style</Text>
      <View className="h-10" />

      {/* ─── Delete Account Modal ─── */}
      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={closeDeleteModal}>
        <View className="flex-1 bg-[rgba(0,0,0,0.55)] justify-center items-center px-7">
          <View
            className="bg-surface rounded-[28px] p-7 w-full max-w-[380px] items-center"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.12, shadowRadius: 40, elevation: 10 }}
          >
            <TouchableOpacity className="absolute top-4 right-4 p-1 z-10" onPress={closeDeleteModal}>
              <MaterialCommunityIcons name="close" size={20} color="#8b8a9f" />
            </TouchableOpacity>

            {deleteStep === 'confirm' ? (
              <>
                <View className="w-16 h-16 rounded-full bg-[#fef2f2] justify-center items-center mb-5 mt-1">
                  <MaterialCommunityIcons name="alert-circle-outline" size={36} color="#ef4444" />
                </View>
                <Text className="text-[19px] font-extrabold text-text mb-2.5 text-center">Delete Account?</Text>
                <Text className="text-sm text-text-muted font-medium leading-[21px] text-center mb-6 px-1">
                  This will permanently erase your wardrobe, preferences, and all personal data. This action cannot be undone.
                </Text>
                <View className="flex-row w-full gap-3 mt-2">
                  <TouchableOpacity className="flex-1 bg-[#f5f4fd] rounded-2xl py-3.5 items-center" onPress={closeDeleteModal}>
                    <Text className="text-text-muted font-bold text-sm">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 bg-[#ef4444] rounded-2xl py-3.5 items-center" onPress={handleConfirmStep}>
                    <Text className="text-white font-bold text-sm">Yes, Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View className="w-16 h-16 rounded-full bg-[#fef2f2] justify-center items-center mb-5 mt-1">
                  <MaterialCommunityIcons name="lock-outline" size={34} color="#ef4444" />
                </View>
                <Text className="text-[19px] font-extrabold text-text mb-2.5 text-center">Verify Your Identity</Text>
                <Text className="text-sm text-text-muted font-medium leading-[21px] text-center mb-6 px-1">
                  Enter your account password to confirm permanent deletion.
                </Text>

                <View className="flex-row items-center bg-bg border-[1.5px] border-[#e3e1ea] rounded-2xl px-4 py-3 w-full mb-2">
                  <MaterialCommunityIcons name="key-variant" size={18} color="#8b8a9f" style={{ marginRight: 10 }} />
                  <TextInput
                    className="flex-1 text-[15px] text-text font-medium"
                    placeholder="Enter your password"
                    placeholderTextColor="#b1b0c5"
                    secureTextEntry={!passwordVisible}
                    value={deletePassword}
                    onChangeText={(t) => { setDeletePassword(t); setDeleteError(''); }}
                    autoFocus
                    editable={!deleteLoading}
                  />
                  <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                    <MaterialCommunityIcons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8b8a9f" />
                  </TouchableOpacity>
                </View>

                {deleteError !== '' && (
                  <View className="flex-row items-center self-start mb-4 mt-1 px-1">
                    <MaterialCommunityIcons name="alert-circle" size={14} color="#ef4444" />
                    <Text className="text-[#ef4444] text-[13px] font-semibold ml-1.5">{deleteError}</Text>
                  </View>
                )}

                <View className="flex-row w-full gap-3 mt-2">
                  <TouchableOpacity className="flex-1 bg-[#f5f4fd] rounded-2xl py-3.5 items-center" onPress={closeDeleteModal} disabled={deleteLoading}>
                    <Text className="text-text-muted font-bold text-sm">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 bg-[#ef4444] rounded-2xl py-3.5 items-center ${deleteLoading ? 'opacity-60' : ''}`}
                    onPress={handlePasswordSubmit}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text className="text-white font-bold text-sm">Delete Forever</Text>
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
