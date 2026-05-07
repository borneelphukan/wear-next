import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, SafeAreaView, Dimensions, Image, Platform, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

import { HomeTab } from '../components/tabs/HomeTab';
import { WardrobeTab } from '../components/tabs/WardrobeTab';
import { CalendarTab } from '../components/tabs/CalendarTab';
import { AiTab } from '../components/tabs/AiTab';
import { SettingsTab } from '../components/tabs/SettingsTab';

// --- Weather helpers ---

/** Map WMO weather codes to human-readable conditions */
const getWeatherCondition = (code: number): string => {
  if (code === 0) return 'Clear Sky';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 65) return 'Rainy';
  if (code <= 67) return 'Freezing Rain';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Showers';
  if (code <= 86) return 'Snow Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Cloudy';
};

/** Return true when the WMO code represents sunshine / clear weather */
const isSunny = (code: number): boolean => code <= 3;

/** Time-of-day greeting */
const getTimeGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const { width } = Dimensions.get('window');

import {
  MenuIcon,
  CloseIcon,
  ProfileIcon,
  BellIcon,
  PrivacyIcon,
  LogoutIcon,
  HomeNavIcon,
  WardrobeNavIcon,
  CalendarNavIcon,
  AiNavIcon,
  SettingsNavIcon
} from '../components/SharedIcons';

// Dynamic Event-based configuration objects to avoid hardcoding
type EventKey = 'Office' | 'Gym' | 'Dinner Date';

interface OutfitData {
  title: string;
  accessory: string;
  top: string;
  bottom: string;
  shoes: string;
  styleTip: string;
  nextUp: string;
  subtext: string;
}

const outfitConfig: Record<EventKey, OutfitData> = {
  'Office': {
    title: 'The Professional',
    accessory: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=300&q=80',
    top: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=300&q=80',
    bottom: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=300&q=80',
    shoes: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=300&q=80',
    styleTip: "Roll the sleeves once for a more relaxed 'Mumbai Creative' vibe.",
    nextUp: "Dinner Date at 8:00 PM. Needs a layer change.",
    subtext: 'Perfect weather for lightweight cotton or linens today.',
  },
  'Gym': {
    title: 'Active Performance',
    accessory: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=300&q=80',
    top: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
    bottom: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=300&q=80',
    shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
    styleTip: 'Lightweight breathable fabrics will keep you cool during intense training.',
    nextUp: 'Office at 11:00 AM. Prepare your formal changes.',
    subtext: 'Warm but pleasant outside. Ideal for a high-energy workout.',
  },
  'Dinner Date': {
    title: 'Elegant Date Night',
    accessory: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=300&q=80',
    top: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80',
    bottom: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80',
    shoes: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=300&q=80',
    styleTip: 'Layer with a structured blazer and pair with minimalist silver accessories.',
    nextUp: 'Night out with friends. Keep it casual and stylish.',
    subtext: 'Cool evening breeze makes it perfect for a layered blazer look.',
  },
};

export default function DashboardScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState((params.email as string) || '');
  const [userFirstName, setUserFirstName] = useState((params.firstName as string) || 'User');
  const [activeTab, setActiveTab] = useState<'home' | 'wardrobe' | 'calendar' | 'ai' | 'settings'>('home');
  const [selectedEvent, setSelectedEvent] = useState<EventKey>('Office');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(new Date().getDate());
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());

  // Wardrobe state
  const [searchQuery, setSearchQuery] = useState('');
  const [ethnicOnly, setEthnicOnly] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'color' | 'material' | 'season'>('all');

  // AI Assistant state
  const [aiQuery, setAiQuery] = useState('');

  // Weather state
  const [temperature, setTemperature] = useState<number | null>(null);
  const [weatherCode, setWeatherCode] = useState<number>(0);
  const [cityName, setCityName] = useState<string>('');
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const stored = await AsyncStorage.getItem('userSession');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.firstName) setUserFirstName(parsed.firstName);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadSession();
  }, []);

  // Fetch weather from Open-Meteo based on device location
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Location permission denied — using defaults');
          setWeatherLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = loc.coords;

        // Reverse-geocode to get city name
        const reverseGeo = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (reverseGeo.length > 0) {
          setCityName(reverseGeo[0].city || reverseGeo[0].region || '');
        }

        // Fetch current weather from Open-Meteo
        const weatherRes = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
        );

        const current = weatherRes.data?.current;
        if (current) {
          setTemperature(Math.round(current.temperature_2m));
          setWeatherCode(current.weather_code ?? 0);
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userSession');
    Alert.alert('Logged Out', 'You have been successfully logged out.');
    router.replace('/login');
  };

  const handleDeleteAccount = async () => {
    try {
      let deleteEmail = email;
      if (!deleteEmail) {
        const stored = await AsyncStorage.getItem('userSession');
        if (stored) {
          const parsed = JSON.parse(stored);
          deleteEmail = parsed.email || '';
        }
      }
      
      const cleanEmail = deleteEmail?.trim()?.toLowerCase();
      
      if (!cleanEmail) {
        Alert.alert('Error', 'No active session found.');
        return;
      }
      
      await AsyncStorage.removeItem('userSession');
      
      Alert.alert('Success', 'Your account has been deleted.');
      router.replace('/login');
    } catch (error: any) {
      console.error('[DELETE BUTTON] Error caught during deletion:', error);
      if (error.response) {
        console.error('[DELETE BUTTON] Error response data:', error.response.data);
        console.error('[DELETE BUTTON] Error response status:', error.response.status);
      }
      const errorMsg = error.response?.data?.message || 'Failed to delete account. Please try again.';
      Alert.alert('Error', errorMsg);
    }
  };

  // Select outfit metadata based on state
  const activeOutfit = outfitConfig[selectedEvent] || outfitConfig['Office'];

  const handleShuffle = () => {
    const events: EventKey[] = ['Office', 'Gym', 'Dinner Date'];
    const nextIdx = (events.indexOf(selectedEvent) + 1) % events.length;
    setSelectedEvent(events[nextIdx]);
  };

  // Dynamic calendar calculations
  const currentMonthName = currentCalendarDate.toLocaleString('default', { month: 'long' });
  const currentMonthShort = currentCalendarDate.toLocaleString('default', { month: 'short' });
  const currentYear = currentCalendarDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentCalendarDate.getMonth() + 1, 0).getDate();
  const startWeekday = new Date(currentYear, currentCalendarDate.getMonth(), 1).getDay();

  const calendarCells = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  const handlePrevMonth = () => {
    const newDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1);
    setCurrentCalendarDate(newDate);
    setSelectedCalendarDay(1);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1);
    setCurrentCalendarDate(newDate);
    setSelectedCalendarDay(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header Row */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.logoContainer}>
            <TouchableOpacity onPress={() => setSidebarOpen(true)} style={{ marginRight: 8, padding: 4 }}>
              <MenuIcon />
            </TouchableOpacity>
            <Text style={styles.logoText}>WearNext</Text>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' }}
            style={styles.avatar}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'home' && (
          <HomeTab
            styles={styles}
            userFirstName={userFirstName}
            temperature={temperature}
            weatherCode={weatherCode}
            cityName={cityName}
            weatherLoading={weatherLoading}
            getTimeGreeting={getTimeGreeting}
            getWeatherCondition={getWeatherCondition}
            isSunny={isSunny}
            activeOutfit={activeOutfit}
            selectedEvent={selectedEvent}
            setSelectedEvent={setSelectedEvent}
            handleShuffle={handleShuffle}
          />
        )}

        {activeTab === 'wardrobe' && (
          <WardrobeTab
            styles={styles}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            ethnicOnly={ethnicOnly}
            setEthnicOnly={setEthnicOnly}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarTab
            styles={styles}
            currentMonthName={currentMonthName}
            currentMonthShort={currentMonthShort}
            currentYear={currentYear}
            handlePrevMonth={handlePrevMonth}
            handleNextMonth={handleNextMonth}
            weeks={weeks}
            selectedCalendarDay={selectedCalendarDay}
            setSelectedCalendarDay={setSelectedCalendarDay}
          />
        )}

        {activeTab === 'ai' && (
          <AiTab
            styles={styles}
            aiQuery={aiQuery}
            setAiQuery={setAiQuery}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            styles={styles}
            email={email}
            handleDeleteAccount={handleDeleteAccount}
          />
        )}

      </ScrollView>

      {/* Modern High-End Tab Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
          <HomeNavIcon active={activeTab === 'home'} />
          <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('wardrobe')}>
          <WardrobeNavIcon active={activeTab === 'wardrobe'} />
          <Text style={[styles.navText, activeTab === 'wardrobe' && styles.navTextActive]}>Wardrobe</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('calendar')}>
          <CalendarNavIcon active={activeTab === 'calendar'} />
          <Text style={[styles.navText, activeTab === 'calendar' && styles.navTextActive]}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('ai')}>
          <AiNavIcon active={activeTab === 'ai'} />
          <Text style={[styles.navText, activeTab === 'ai' && styles.navTextActive]}>AI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('settings')}>
          <SettingsNavIcon active={activeTab === 'settings'} />
          <Text style={[styles.navText, activeTab === 'settings' && styles.navTextActive]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Sidebar Overlay and Menu */}
      {sidebarOpen && (
        <View style={styles.sidebarContainer}>
          {/* Semi-transparent Backdrop click to close */}
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.sidebarBackdrop} 
            onPress={() => setSidebarOpen(false)} 
          />
          
          {/* Left Sidebar Content */}
          <View style={styles.sidebarContent}>
            {/* Sidebar Header */}
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setSidebarOpen(false)} style={styles.closeBtn}>
                <CloseIcon />
              </TouchableOpacity>
            </View>

            {/* Menu Options List */}
            <ScrollView style={styles.menuItemsList} showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setSidebarOpen(false); setActiveTab('settings'); }}>
                <View style={styles.menuItemIconWrapper}>
                  <ProfileIcon />
                </View>
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setSidebarOpen(false); Alert.alert('Notifications', 'No new notifications.'); }}>
                <View style={styles.menuItemIconWrapper}>
                  <BellIcon />
                </View>
                <Text style={styles.menuItemText}>Notifications</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setSidebarOpen(false); Alert.alert('Privacy', 'Your privacy settings are up to date.'); }}>
                <View style={styles.menuItemIconWrapper}>
                  <PrivacyIcon />
                </View>
                <Text style={styles.menuItemText}>Privacy</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Bottom Logout Button */}
            <View style={styles.sidebarFooter}>
              <TouchableOpacity style={styles.sidebarLogoutBtn} onPress={() => { setSidebarOpen(false); handleLogout(); }}>
                <LogoutIcon />
                <Text style={styles.sidebarLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0eff6',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#5e5ce6',
    marginLeft: 8,
    letterSpacing: -0.5,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#e8e7fc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  greetingTextContainer: {
    flex: 1,
    paddingRight: 15,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a24',
    lineHeight: 32,
    marginBottom: 8,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#656475',
    lineHeight: 20,
    fontWeight: '500',
  },
  weatherIconContainer: {
    paddingTop: 4,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8b8a9f',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  eventsScroll: {
    paddingBottom: 25,
  },
  eventPill: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f0fc',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e3e1f5',
  },
  eventPillActive: {
    backgroundColor: '#5e5ce6',
    borderColor: '#5e5ce6',
  },
  eventPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#656475',
  },
  eventPillTextActive: {
    color: '#ffffff',
  },
  wardrobeCard: {
    width: '100%',
    height: 380,
    borderRadius: 28,
    backgroundColor: '#f1f0fc',
    position: 'relative',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#5e5ce6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  collageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collageBackgroundItem: {
    width: 220,
    height: 220,
    borderRadius: 16,
    position: 'absolute',
    top: 30,
    opacity: 0.9,
  },
  collageMiddleItem: {
    width: 200,
    height: 200,
    borderRadius: 16,
    position: 'absolute',
    bottom: 80,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  collageForegroundItem: {
    width: 150,
    height: 150,
    borderRadius: 16,
    position: 'absolute',
    bottom: 25,
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  collageAccessoryItem: {
    width: 90,
    height: 90,
    borderRadius: 12,
    position: 'absolute',
    top: 35,
    left: 35,
    zIndex: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  outfitOverlayLabel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 5,
  },
  outfitOverlayText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1a1a24',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 12,
  },
  wearBtn: {
    flex: 1,
    height: 52,
    backgroundColor: '#5e5ce6',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5e5ce6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  wearBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  shuffleBtn: {
    flex: 1,
    height: 52,
    borderWidth: 2,
    borderColor: '#5e5ce6',
    backgroundColor: '#ffffff',
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  shuffleBtnText: {
    color: '#5e5ce6',
    fontSize: 16,
    fontWeight: '700',
  },
  infoCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  styleTipCard: {
    flex: 1,
    backgroundColor: '#f4f3fd',
    borderRadius: 24,
    padding: 16,
    minHeight: 150,
  },
  nextUpCard: {
    flex: 1,
    backgroundColor: '#ffebe0',
    borderRadius: 24,
    padding: 16,
    minHeight: 150,
  },
  cardHeaderRow: {
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5e5ce6',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  cardSubtitleOrange: {
    fontSize: 11,
    fontWeight: '800',
    color: '#e07a5f',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  cardBodyText: {
    fontSize: 13,
    color: '#1a1a24',
    lineHeight: 18,
    fontWeight: '600',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 20,
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a24',
    marginBottom: 8,
  },
  placeholderSub: {
    fontSize: 14,
    color: '#656475',
    textAlign: 'center',
    lineHeight: 20,
  },
  settingsContainer: {
    paddingVertical: 10,
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  settingsCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a24',
    marginBottom: 20,
  },
  settingsEmailLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8b8a9f',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  settingsEmailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a24',
    marginBottom: 25,
  },
  logoutBtn: {
    backgroundColor: '#eae9f1',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutBtnText: {
    color: '#1a1a24',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#ff4d6d',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0eff6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 15,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  navText: {
    color: '#8e8ea0',
    fontWeight: '700',
    fontSize: 11,
    marginTop: 4,
  },
  navTextActive: {
    color: '#5e5ce6',
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 10000,
    flexDirection: 'row',
  },
  sidebarBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sidebarContent: {
    width: '75%',
    maxWidth: 300,
    height: '100%',
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f2fc',
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#5e5ce6',
  },
  closeBtn: {
    padding: 4,
  },
  menuItemsList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 8,
    borderRadius: 12,
  },
  menuItemIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f8fc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a24',
  },
  sidebarFooter: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f3f2fc',
  },
  sidebarLogoutBtn: {
    flexDirection: 'row',
    backgroundColor: '#fee2e2',
    borderColor: '#ff4d6d40',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  sidebarLogoutText: {
    color: '#ff4d6d',
    fontSize: 16,
    fontWeight: '800',
  },
  calendarTabContainer: {
    paddingBottom: 40,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarMonthText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1a1a24',
    marginBottom: 4,
  },
  calendarFestivalsText: {
    fontSize: 13,
    color: '#656475',
    fontWeight: '600',
  },
  calendarNavArrows: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowButton: {
    padding: 6,
  },
  syncCard: {
    backgroundColor: '#f1f0fc',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  syncLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  syncCircleGroup: {
    width: 44,
    height: 32,
    position: 'relative',
    marginRight: 12,
  },
  syncCircle1: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e1e0f0',
    position: 'absolute',
    left: 0,
    top: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  syncCircle2: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#5e5ce6',
    position: 'absolute',
    left: 14,
    top: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#5e5ce6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  syncCircleInner: {
    width: 14,
    height: 10,
    borderWidth: 1.5,
    borderColor: '#a3a3c2',
    borderRadius: 2,
  },
  syncCircleInnerActive: {
    width: 14,
    height: 10,
    borderWidth: 1.5,
    borderColor: '#5e5ce6',
    borderRadius: 2,
  },
  syncTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  syncTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#656475',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  syncSubtext: {
    fontSize: 12,
    color: '#1a1a24',
    fontWeight: '600',
    lineHeight: 16,
  },
  connectBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#5e5ce6',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  connectBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5e5ce6',
  },
  gridCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f0eff6',
    overflow: 'hidden',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f0fc',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0eff6',
  },
  gridHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    color: '#656475',
    letterSpacing: 0.5,
  },
  gridBody: {
    paddingVertical: 5,
  },
  gridRowLine: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0eff6',
  },
  gridCell: {
    flex: 1,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRightWidth: 1,
    borderRightColor: '#f0eff6',
  },
  emptyGridCell: {
    flex: 1,
    height: 72,
    borderRightWidth: 1,
    borderRightColor: '#f0eff6',
  },
  gridCellText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a24',
  },
  festiveCell: {
    backgroundColor: '#fffcf6',
  },
  festiveCellText: {
    color: '#c96f2c',
    fontWeight: '800',
  },
  festiveLabel: {
    position: 'absolute',
    bottom: 8,
    fontSize: 9,
    fontWeight: '900',
    color: '#c96f2c',
    letterSpacing: 0.5,
  },
  activeCell: {
    borderWidth: 2,
    borderColor: '#5e5ce6',
    borderRadius: 8,
    zIndex: 10,
  },
  activeCellText: {
    color: '#5e5ce6',
    fontWeight: '900',
  },
  activeTag: {
    position: 'absolute',
    top: -1,
    backgroundColor: '#5e5ce6',
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    letterSpacing: 0.3,
    zIndex: 11,
  },
  activeOutfitBox: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: '#e1e0f0',
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: '#ffffff',
  },
  plannedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  plannedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a24',
  },
  editDetailsLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5e5ce6',
  },
  plannedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f0eff6',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  plannedLeftCol: {
    flex: 1.2,
    paddingRight: 10,
    justifyContent: 'space-between',
  },
  plannedOccasionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  plannedOccasionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#a86c43',
    letterSpacing: 1,
  },
  plannedOutfitTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1a24',
    marginBottom: 6,
  },
  plannedOutfitSub: {
    fontSize: 13,
    color: '#656475',
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 15,
  },
  plannedWeatherPills: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  plannedPill: {
    backgroundColor: '#f1f0fc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  plannedPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a24',
  },
  confirmBtn: {
    backgroundColor: '#5e5ce6',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5e5ce6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  plannedRightCol: {
    flex: 0.9,
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  previewText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1a1a24',
    letterSpacing: 0.5,
  },
  adviceCard: {
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adviceIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adviceText: {
    flex: 1,
    fontSize: 13,
    color: '#5e5ce6',
    fontWeight: '700',
    lineHeight: 18,
  },
  wardrobeContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 40,
  },
  searchToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f0f6',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    marginRight: 12,
  },
  searchInputField: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a24',
    marginLeft: 8,
    paddingVertical: 0,
  },
  ethnicTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f0f6',
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 44,
  },
  ethnicToggleLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#656475',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  toggleSwitch: {
    width: 38,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#d1d1d6',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#5e5ce6',
  },
  toggleCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    transform: [{ translateX: 0 }],
  },
  toggleCircleActive: {
    transform: [{ translateX: 16 }],
  },
  filtersScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f0f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    height: 36,
  },
  filterBtnActive: {
    backgroundColor: '#5e5ce6',
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#656475',
    marginLeft: 4,
  },
  filterBtnTextActive: {
    color: '#ffffff',
  },
  categoriesSection: {
    marginBottom: 25,
  },
  categoriesTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  topsLargeCard: {
    flex: 1,
    height: 170,
    backgroundColor: '#f5f4fd',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    marginRight: 12,
  },
  hangerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topsCardContent: {
    marginTop: 'auto',
  },
  categoryCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a24',
  },
  categoryCardSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b8a9f',
    marginTop: 2,
  },
  categoriesRightStack: {
    flex: 1,
    height: 170,
    justifyContent: 'space-between',
  },
  stackedCategoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f4fd',
    borderRadius: 16,
    padding: 16,
    height: 78,
  },
  stackedCardLeft: {
    justifyContent: 'center',
  },
  categoriesBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallCategoryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f4fd',
    borderRadius: 16,
    paddingVertical: 12,
    height: 52,
    marginHorizontal: 4,
  },
  smallCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1a24',
    marginLeft: 6,
  },
  allItemsSection: {
    marginBottom: 30,
  },
  allItemsHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a24',
    marginBottom: 15,
  },
  allItemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemGridCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 6,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  itemImageWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fcfbfd',
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  blueDotIndicator: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5e5ce6',
  },
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5e5ce6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5e5ce6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabButtonText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300',
    marginTop: -2,
  },
  aiTabContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 40,
  },
  aiHeader: {
    marginBottom: 20,
  },
  aiHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a24',
    marginBottom: 6,
  },
  aiHeaderSub: {
    fontSize: 13,
    color: '#656475',
    fontWeight: '600',
    lineHeight: 18,
  },
  aiChatArea: {
    marginBottom: 25,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#eef0f5',
    borderRadius: 18,
    borderTopRightRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: '85%',
    marginBottom: 15,
  },
  userBubbleText: {
    fontSize: 14,
    color: '#1a1a24',
    fontWeight: '600',
    lineHeight: 19,
  },
  aiStylistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiStylistIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#5e5ce6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  aiStylistHeaderLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5e5ce6',
    letterSpacing: 0.8,
  },
  suggestionBox: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f0eff6',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  breathabilityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7ff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
  },
  breathabilityTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  breathabilityBannerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5e5ce6',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  breathabilityBannerBody: {
    fontSize: 12,
    color: '#4a4a5a',
    fontWeight: '600',
    lineHeight: 16,
  },
  recommendationText: {
    fontSize: 14,
    color: '#1a1a24',
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 15,
  },
  boldSug: {
    fontWeight: '800',
    color: '#5e5ce6',
  },
  trendBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f0',
    borderRadius: 16,
    padding: 12,
  },
  trendBannerTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  trendBannerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#a86c43',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  trendBannerBody: {
    fontSize: 12,
    color: '#7a5a43',
    fontWeight: '600',
    lineHeight: 16,
  },
  fromWardrobeSection: {
    marginBottom: 20,
  },
  fromWardrobeHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8b8a9f',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  wardrobePillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wardrobePillCard: {
    width: '48%',
  },
  wardrobeCardImageBg: {
    height: 120,
    backgroundColor: '#f5f4fd',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  wardrobeItemTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 1,
  },
  wardrobeItemTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#5e5ce6',
  },
  wardrobeItemTagBlue: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e0f2fe',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 1,
  },
  wardrobeItemTagTextBlue: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284c7',
  },
  wardrobeItemImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  wardrobeItemName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#656475',
    textAlign: 'center',
  },
  actionPillsScroll: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  actionPillOutline: {
    borderWidth: 1,
    borderColor: '#5e5ce630',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    height: 38,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  actionPillOutlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5e5ce6',
  },
  bottomInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputInnerWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f0f6',
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 44,
    marginRight: 10,
  },
  stylistInputField: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a24',
    marginLeft: 8,
    paddingVertical: 0,
  },
  submitArrowBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5e5ce6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
