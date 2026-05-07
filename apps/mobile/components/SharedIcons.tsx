import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export const MenuIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#5e5ce6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 6h16M4 12h16M4 18h16" />
  </Svg>
);

export const CloseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#656475" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);

export const ProfileIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#656475" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx={12} cy={7} r={4} />
  </Svg>
);

export const BellIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#656475" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
  </Svg>
);

export const PrivacyIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#656475" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

export const LogoutIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#ff4d6d" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Svg>
);

export const SunIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={5} fill="#ff6b6b" />
    <Path d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41" stroke="#ff6b6b" strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

export const CloudIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#8b8a9f" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
  </Svg>
);

export const SparkleIcon = ({ color = '#5e5ce6' }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />
  </Svg>
);

export const TrendIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#5e5ce6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M23 6l-9.5 9.5-5-5L1 18" />
    <Path d="M17 6h6v6" />
  </Svg>
);

export const CalendarIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#e07a5f" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
    <Path d="M16 2v4M8 2v4M3 10h18" />
  </Svg>
);

export const PartyPopperIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#a86c43" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
    <Path d="M4 15l1-1m0 0l2 2m-2-2l-4 4m16-16l1 1m0 0l-2 2m2-2l4-4M12 4v2m0 12v2m-8-8h2m12 0h2m-1.7-5.3l-1.4 1.4M6.3 17.7l-1.4 1.4m12.8 0l-1.4-1.4M6.3 6.3L4.9 7.7" />
  </Svg>
);

export const LeftArrowIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1a1a24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 18l-6-6 6-6" />
  </Svg>
);

export const RightArrowIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#1a1a24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

export const BulbIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#5e5ce6" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <Path d="M9 18h6M10 22h4" />
  </Svg>
);

export const HomeNavIcon = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={active ? '#5e5ce6' : '#8e8ea0'} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Path d="M9 22V12h6v10" />
  </Svg>
);

export const WardrobeNavIcon = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={active ? '#5e5ce6' : '#8e8ea0'} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" />
  </Svg>
);

export const CalendarNavIcon = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={active ? '#5e5ce6' : '#8e8ea0'} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
    <Path d="M16 2v4M8 2v4M3 10h18" />
  </Svg>
);

export const AiNavIcon = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={active ? '#5e5ce6' : '#8e8ea0'} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707" />
  </Svg>
);

export const SettingsNavIcon = ({ active }: { active: boolean }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={active ? '#5e5ce6' : '#8e8ea0'} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={12} cy={12} r={3} />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

export const WaterDropIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C12 2 4 10 4 15C4 19.42 7.58 23 12 23C16.42 23 20 19.42 20 15C20 10 12 2 12 2Z" fill="#5e5ce6" />
  </Svg>
);

export const TrendingUpIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#a86c43" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M23 6L13.5 15.5L8.5 10.5L1 18" />
    <Path d="M17 6H23V12" />
  </Svg>
);

export const SubmitIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 19V5M5 12l7-7 7 7" />
  </Svg>
);

export const CirclePlusIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#8b8a9f" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={12} cy={12} r={10} />
    <Path d="M12 8v8M8 12h8" />
  </Svg>
);

export const HangerIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#5e5ce6" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2a3 3 0 0 0-3 3h6a3 3 0 0 0-3-3z" />
    <Path d="M12 5v3" />
    <Path d="M21 16H3a2 2 0 0 0-2 2v1h22v-1a2 2 0 0 0-2-2z" />
    <Path d="M12 8L2 16h20L12 8z" />
  </Svg>
);

export const TrouserIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#656475" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 2h16v3L17 21H13V11H11V21H7L4 5V2z" />
  </Svg>
);

export const SnowflakeIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#656475" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
  </Svg>
);

export const WandIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#a86c43" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    <Path d="M15 5L3 17v4h4L19 9" />
    <Path d="M19 2l2 2" />
    <Path d="M22 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
  </Svg>
);

export const ShoeIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#656475" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 18h18c1 0 1-1 1-2l-2-6-3-2H9L4 14l-2 2v2" />
  </Svg>
);

export const WatchIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#656475" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Rect x={6} y={6} width={12} height={12} rx={2} ry={2} />
    <Path d="M9 6V2h6v4M9 18v4h6v-4" />
  </Svg>
);

export const SearchIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#8b8a9f" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={11} cy={11} r={8} />
    <Path d="M21 21l-4.35-4.35" />
  </Svg>
);

export const FilterIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 12h6" />
  </Svg>
);
