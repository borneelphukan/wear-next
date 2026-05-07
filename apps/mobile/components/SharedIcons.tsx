import React from 'react';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

export const MenuIcon = ({ color = '#5e5ce6', size = 24 }) => (
  <MaterialIcons name="menu" size={size} color={color} />
);

export const CloseIcon = ({ color = '#656475', size = 20 }) => (
  <MaterialIcons name="close" size={size} color={color} />
);

export const ProfileIcon = ({ color = '#656475', size = 20 }) => (
  <MaterialIcons name="person" size={size} color={color} />
);

export const BellIcon = ({ color = '#656475', size = 20 }) => (
  <MaterialIcons name="notifications" size={size} color={color} />
);

export const PrivacyIcon = ({ color = '#656475', size = 20 }) => (
  <MaterialIcons name="security" size={size} color={color} />
);

export const LogoutIcon = ({ color = '#ff4d6d', size = 16 }) => (
  <MaterialIcons name="logout" size={size} color={color} />
);

export const SunIcon = ({ color = '#ff6b6b', size = 28 }) => (
  <MaterialIcons name="wb-sunny" size={size} color={color} />
);

export const CloudIcon = ({ color = '#8b8a9f', size = 28 }) => (
  <MaterialIcons name="cloud" size={size} color={color} />
);

export const SparkleIcon = ({ color = '#5e5ce6', size = 18 }: { color?: string, size?: number }) => (
  <MaterialIcons name="auto-awesome" size={size} color={color} />
);

export const TrendIcon = ({ color = '#5e5ce6', size = 18 }) => (
  <MaterialIcons name="trending-up" size={size} color={color} />
);

export const CalendarIcon = ({ color = '#e07a5f', size = 18 }) => (
  <MaterialIcons name="event" size={size} color={color} />
);

export const PartyPopperIcon = ({ color = '#a86c43', size = 16 }) => (
  <MaterialIcons name="celebration" size={size} color={color} style={{ marginRight: 6 }} />
);

export const LeftArrowIcon = ({ color = '#1a1a24', size = 20 }) => (
  <MaterialIcons name="arrow-back-ios" size={size} color={color} />
);

export const RightArrowIcon = ({ color = '#1a1a24', size = 20 }) => (
  <MaterialIcons name="arrow-forward-ios" size={size} color={color} />
);

export const BulbIcon = ({ color = '#5e5ce6', size = 22 }) => (
  <MaterialIcons name="lightbulb" size={size} color={color} />
);

export const HomeNavIcon = ({ active }: { active: boolean }) => (
  <MaterialIcons name="home" size={22} color={active ? '#5e5ce6' : '#8e8ea0'} />
);

export const WardrobeNavIcon = ({ active }: { active: boolean }) => (
  <MaterialIcons name="checkroom" size={22} color={active ? '#5e5ce6' : '#8e8ea0'} />
);

export const CalendarNavIcon = ({ active }: { active: boolean }) => (
  <MaterialIcons name="calendar-today" size={22} color={active ? '#5e5ce6' : '#8e8ea0'} />
);

export const AiNavIcon = ({ active }: { active: boolean }) => (
  <MaterialIcons name="auto-awesome" size={22} color={active ? '#5e5ce6' : '#8e8ea0'} />
);

export const SettingsNavIcon = ({ active }: { active: boolean }) => (
  <MaterialIcons name="settings" size={22} color={active ? '#5e5ce6' : '#8e8ea0'} />
);

export const WaterDropIcon = ({ color = '#5e5ce6', size = 18 }) => (
  <MaterialIcons name="water-drop" size={size} color={color} />
);

export const TrendingUpIcon = ({ color = '#a86c43', size = 18 }) => (
  <MaterialIcons name="trending-up" size={size} color={color} />
);

export const SubmitIcon = ({ color = '#ffffff', size = 18 }) => (
  <MaterialIcons name="send" size={size} color={color} />
);

export const CirclePlusIcon = ({ color = '#8b8a9f', size = 20 }) => (
  <MaterialIcons name="add-circle-outline" size={size} color={color} />
);

export const HangerIcon = ({ color = '#5e5ce6', size = 24 }) => (
  <MaterialCommunityIcons name="hanger" size={size} color={color} />
);

export const TrouserIcon = ({ color = '#656475', size = 22 }) => (
  <MaterialIcons name="checkroom" size={size} color={color} />
);

export const SnowflakeIcon = ({ color = '#656475', size = 22 }) => (
  <MaterialCommunityIcons name="snowflake" size={size} color={color} />
);

export const WandIcon = ({ color = '#a86c43', size = 22 }) => (
  <MaterialCommunityIcons name="magic-staff" size={size} color={color} />
);

export const ShoeIcon = ({ color = '#656475', size = 22 }) => (
  <MaterialCommunityIcons name="shoe-sneaker" size={size} color={color} />
);

export const WatchIcon = ({ color = '#656475', size = 22 }) => (
  <MaterialCommunityIcons name="watch" size={size} color={color} />
);

export const SearchIcon = ({ color = '#8b8a9f', size = 18 }) => (
  <MaterialIcons name="search" size={size} color={color} />
);

export const FilterIcon = ({ color = '#ffffff', size = 16 }) => (
  <MaterialIcons name="filter-list" size={size} color={color} />
);
