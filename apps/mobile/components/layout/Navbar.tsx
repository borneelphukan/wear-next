import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { 
  HomeNavIcon, 
  WardrobeNavIcon, 
  CalendarNavIcon, 
  AiNavIcon, 
  SettingsNavIcon 
} from '../SharedIcons';

export type TabKey = 'home' | 'wardrobe' | 'calendar' | 'ai' | 'settings';

interface BottomTabNavProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  themeSurface: string;
  themeBorder: string;
}

export const Navbar: React.FC<BottomTabNavProps> = ({
  activeTab,
  setActiveTab,
  themeSurface,
  themeBorder,
}) => {
  return (
    <View
      className="h-[75px] flex-row items-center justify-around pb-4 border-t z-50"
      style={{ 
        backgroundColor: themeSurface, 
        borderTopColor: themeBorder, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: -2 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 5, 
        elevation: 10 
      }}
    >
      <TouchableOpacity className="items-center justify-center pt-2" onPress={() => setActiveTab('home')}>
        <HomeNavIcon active={activeTab === 'home'} />
        <Text className={`text-[11px] font-bold mt-1 ${activeTab === 'home' ? 'text-brand' : 'text-[#8e8ea0]'}`}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity className="items-center justify-center pt-2" onPress={() => setActiveTab('wardrobe')}>
        <WardrobeNavIcon active={activeTab === 'wardrobe'} />
        <Text className={`text-[11px] font-bold mt-1 ${activeTab === 'wardrobe' ? 'text-brand' : 'text-[#8e8ea0]'}`}>Wardrobe</Text>
      </TouchableOpacity>
      
      <TouchableOpacity className="items-center justify-center pt-2" onPress={() => setActiveTab('calendar')}>
        <CalendarNavIcon active={activeTab === 'calendar'} />
        <Text className={`text-[11px] font-bold mt-1 ${activeTab === 'calendar' ? 'text-brand' : 'text-[#8e8ea0]'}`}>Calendar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity className="items-center justify-center pt-2" onPress={() => setActiveTab('ai')}>
        <AiNavIcon active={activeTab === 'ai'} />
        <Text className={`text-[11px] font-bold mt-1 ${activeTab === 'ai' ? 'text-brand' : 'text-[#8e8ea0]'}`}>AI</Text>
      </TouchableOpacity>
      
      <TouchableOpacity className="items-center justify-center pt-2" onPress={() => setActiveTab('settings')}>
        <SettingsNavIcon active={activeTab === 'settings'} />
        <Text className={`text-[11px] font-bold mt-1 ${activeTab === 'settings' ? 'text-brand' : 'text-[#8e8ea0]'}`}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Navbar;
