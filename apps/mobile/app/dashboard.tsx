import React, { useState, useEffect, useRef } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Alert, SafeAreaView, Image, Platform, Animated, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Home } from '../components/tabs/Home';
import { Wardrobe } from '../components/tabs/Wardrobe';
import { CalendarTab } from '../components/tabs/Calendar';
import { AiTab } from '../components/tabs/AI';
import { Settings } from '../components/tabs/Settings';
import BottomDrawer, { FormField } from '../components/BottomDrawer';
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

/** Generate a dynamic AI statement based on weather and time */
const getAiStatement = (temp: number | null, code: number): string => {
  const cond = getWeatherCondition(code).toLowerCase();
  const isClear = isSunny(code);
  
  let recommendation = '';
  if (temp === null) {
    recommendation = 'Synthesizing weather data to optimize your style palette.';
  } else if (cond.includes('rain') || cond.includes('shower') || cond.includes('drizzle') || cond.includes('thunder')) {
    recommendation = `With ${cond} expected, reach for protective layers and waterproof elements.`;
  } else if (temp < 15) {
    recommendation = `It feels quite crisp at ${temp}°C. High time for comforting knits and insulated jackets.`;
  } else if (temp > 26) {
    recommendation = `Heating up to ${temp}°C! Prioritize breathable linens and airy silhouettes.`;
  } else if (isClear) {
    recommendation = `Clear, brilliant conditions ahead. A sharp, clean aesthetic will stand out nicely.`;
  } else {
    recommendation = `Balanced ${cond} weather is perfect for comfortable, smart-casual layering.`;
  }

  return recommendation;
};


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
  },
  'Gym': {
    title: 'Active Performance',
    accessory: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=300&q=80',
    top: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
    bottom: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=300&q=80',
    shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
    styleTip: 'Lightweight breathable fabrics will keep you cool during intense training.',
    nextUp: 'Office at 11:00 AM. Prepare your formal changes.',
  },
  'Dinner Date': {
    title: 'Elegant Date Night',
    accessory: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=300&q=80',
    top: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80',
    bottom: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80',
    shoes: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=300&q=80',
    styleTip: 'Layer with a structured blazer and pair with minimalist silver accessories.',
    nextUp: 'Night out with friends. Keep it casual and stylish.',
  },
};

export default function DashboardScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [userId, setUserId] = useState((params.id as string) || '');
  const [email, setEmail] = useState((params.email as string) || '');
  const [userFirstName, setUserFirstName] = useState((params.firstName as string) || 'User');
  const [useCelsius, setUseCelsius] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'wardrobe' | 'calendar' | 'ai' | 'settings'>('home');
  const [selectedEvent, setSelectedEvent] = useState<EventKey>('Office');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (sidebarOpen) {
      setIsSidebarVisible(true);
      Animated.timing(sidebarAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } else {
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => {
        setIsSidebarVisible(false);
      });
    }
  }, [sidebarOpen]);

  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(new Date().getDate());
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());

  // Wardrobe state
  const [searchQuery, setSearchQuery] = useState('');
  const [ethnicOnly, setEthnicOnly] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'color' | 'material' | 'season'>('all');
  const [isAddDrawerVisible, setIsAddDrawerVisible] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [addDrawerInitialValues, setAddDrawerInitialValues] = useState<Record<string, any>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);

  useEffect(() => {
    const loadWardrobeData = async () => {
      try {
        const res = await axiosInstance.get('/wardrobe');
        setWardrobeItems(res.data || []);
      } catch (e) {
        console.warn('Dashboard wardrobe background fetch error:', e);
      }
    };
    loadWardrobeData();
  }, [refreshTrigger]);

  const wardrobeFields: FormField[] = [
    { name: 'apparel_name', label: 'Apparel Name', type: 'text', required: true, icon: 'tag' },
    { name: 'photo', label: 'Garment Image', type: 'image', required: false, icon: 'image' },
    { name: 'type', label: 'Category', type: 'dropdown', items: ['Tops', 'Bottoms', 'Outerwear', 'Ethnic', 'Footwear', 'Accessories'], required: true, icon: 'shape' },
    { name: 'material', label: 'Material', type: 'dropdown', items: ['Cotton', 'Wool', 'Polyester', 'Denim', 'Leather', 'Silk', 'Linen'], required: true, icon: 'texture' },
    { name: 'color', label: 'Color', type: 'dropdown', items: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Gray', 'Brown', 'Beige'], required: true, icon: 'palette' },
    { name: 'season', label: 'Season', type: 'dropdown', items: ['Spring', 'Summer', 'Autumn', 'Winter'], required: true, icon: 'weather-sunny' },
    { name: 'event', label: 'Event Type', type: 'dropdown', items: ['Casual', 'Formal', 'Party', 'Ethnic', 'Sports'], required: true, icon: 'calendar-star' },
  ];

  const handleAddWardrobeItem = async (data: any) => {
    try {
      await axiosInstance.post('/wardrobe', data);
      setRefreshTrigger(prev => prev + 1);
      Alert.alert('Success', 'Garment successfully added to your wardrobe!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add garment. Please try again.');
    }
  };

  const handleLaunchOutfitCamera = async () => {
    if (Platform.OS === 'web') {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });
        if (!result.canceled) {
          processCapturedPhoto(result);
        } else {
          setAddDrawerInitialValues({});
          setIsAddDrawerVisible(true);
        }
      } catch (err) {
        console.error('Error selecting image on web:', err);
        setAddDrawerInitialValues({});
        setIsAddDrawerVisible(true);
      }
      return;
    }

    try {
      Alert.alert(
        'Add New Apparel',
        'Choose how you would like to select your garment image:',
        [
          {
            text: 'Take Photo (Camera)',
            onPress: async () => {
              try {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('Permission Denied', 'Camera permissions are required. Opening manual drawer.');
                  setAddDrawerInitialValues({});
                  setIsAddDrawerVisible(true);
                  return;
                }
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 0.8,
                });
                if (!result.canceled) {
                  processCapturedPhoto(result);
                } else {
                  setAddDrawerInitialValues({});
                  setIsAddDrawerVisible(true);
                }
              } catch (err) {
                console.warn('Camera launch failed:', err);
                setAddDrawerInitialValues({});
                setIsAddDrawerVisible(true);
              }
            }
          },
          {
            text: 'Choose from Library',
            onPress: async () => {
              try {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('Permission Denied', 'Media library permissions are required. Opening manual drawer.');
                  setAddDrawerInitialValues({});
                  setIsAddDrawerVisible(true);
                  return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 0.8,
                });
                if (!result.canceled) {
                  processCapturedPhoto(result);
                } else {
                  setAddDrawerInitialValues({});
                  setIsAddDrawerVisible(true);
                }
              } catch (err) {
                console.warn('Library launch failed:', err);
                setAddDrawerInitialValues({});
                setIsAddDrawerVisible(true);
              }
            }
          },
          {
            text: 'Add Manually',
            onPress: () => {
              setAddDrawerInitialValues({});
              setIsAddDrawerVisible(true);
            }
          }
        ]
      );
    } catch (e) {
      console.warn('Alert.alert failed, falling back to manual drawer directly:', e);
      setAddDrawerInitialValues({});
      setIsAddDrawerVisible(true);
    }
  };

  const processCapturedPhoto = async (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const photoUri = result.assets[0].uri;
      setIsProcessingImage(true);
      
      try {
        const base64 = await FileSystem.readAsStringAsync(photoUri, {
          encoding: 'base64',
        });

        const response = await axiosInstance.post('/ai/analyze-apparel', { image: base64 });
        const data = response.data || {};

        setIsProcessingImage(false);
        setAddDrawerInitialValues({
          photo: photoUri,
          apparel_name: data.apparel_name || 'My Apparel',
          type: data.type || 'Tops',
          material: data.material || 'Cotton',
          color: data.color || 'Black',
          season: data.season || 'Summer',
          event: data.event || 'Casual',
        });
        setIsAddDrawerVisible(true);
      } catch (err) {
        console.warn('AI apparel auto-tagging failed, falling back to manual entry:', err);
        setIsProcessingImage(false);
        setAddDrawerInitialValues({ photo: photoUri });
        setIsAddDrawerVisible(true);
      }
    }
  };

  const [aiQuery, setAiQuery] = useState('');

  const [temperature, setTemperature] = useState<number | null>(null);
  const [weatherCode, setWeatherCode] = useState<number>(0);
  const [cityName, setCityName] = useState<string>('');
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [aiStatement, setAiStatement] = useState<string>('');

  useEffect(() => {
    const loadSessionAndPreferences = async () => {
      try {
        let activeId = userId;
        let activeEmail = email;
        const stored = await AsyncStorage.getItem('userSession');
        
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.id) {
            setUserId(String(parsed.id));
            activeId = String(parsed.id);
          }
          if (parsed.email) {
            setEmail(parsed.email);
            activeEmail = parsed.email;
          }
          if (parsed.firstName) setUserFirstName(parsed.firstName);
        }
        
        let userData: any = null;

        // 1. Primary Hydration Attempt: Direct ID fetch
        if (activeId) {
          const response = await axiosInstance.get(`/users/${activeId}`);
          userData = response.data;
        } 
        // 2. Legacy Fallback: Session data predates ID storage. Lookup via query fallback.
        else if (activeEmail) {
          const response = await axiosInstance.get(`/users/find/by-email?email=${encodeURIComponent(activeEmail)}`);
          userData = response.data;
          
          // Auto-repair current session and cache to prevent repeated fallbacks
          if (userData && userData.id) {
            setUserId(String(userData.id));
            if (stored) {
              const merged = { ...JSON.parse(stored), id: userData.id };
              await AsyncStorage.setItem('userSession', JSON.stringify(merged));
            }
          }
        }

        // Finalize dynamic UI preferences using returned configuration
        if (userData) {
          if (userData.useCelsius !== undefined) setUseCelsius(userData.useCelsius);
          if (userData.darkMode !== undefined) setDarkMode(userData.darkMode);
        }
      } catch (e) {
        console.warn('Dashboard session hydration failed', e);
      }
    };
    loadSessionAndPreferences();
  }, []);

  const handleUpdatePreference = async (key: 'useCelsius' | 'darkMode', value: boolean) => {
    try {
      // Safe optimistic update locally
      if (key === 'useCelsius') setUseCelsius(value);
      if (key === 'darkMode') setDarkMode(value);

      if (!userId) return;
      
      // Targeted background push using explicit primary key
      await axiosInstance.post(`/users/${userId}/preferences`, { [key]: value });
    } catch (err) {
      console.error('Failed to sync user preference cluster', err);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const now = new Date();
        const currentHourKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;

        const cachedData = await AsyncStorage.getItem('dashboard_data_cache');
        if (cachedData) {
          try {
            const parsedCache = JSON.parse(cachedData);
            if (parsedCache && parsedCache.hourKey === currentHourKey) {
              setTemperature(parsedCache.temp);
              setWeatherCode(parsedCache.code);
              setCityName(parsedCache.city);
              setAiStatement(parsedCache.statement);
              setWeatherLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Cache parsing failed, refetching data...');
          }
        }

        // Cache MISS/EXPIRED: Perform fresh fetches
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        let latitude: number | null = null;
        let longitude: number | null = null;
        let finalCity = '';

        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          latitude = loc.coords.latitude;
          longitude = loc.coords.longitude;

          const reverseGeo = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (reverseGeo.length > 0) {
            finalCity = reverseGeo[0].city || reverseGeo[0].region || '';
            setCityName(finalCity);
          }
        } else {
          console.warn('Location permission denied, skipping live weather fetch.');
        }

        let tempVal: number | null = null;
        let codeVal = 0;

        // 2. Fetch current weather from Open-Meteo
        if (latitude !== null && longitude !== null) {
          const weatherRes = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
          );
          const current = weatherRes.data?.current;
          if (current) {
            tempVal = Math.round(current.temperature_2m);
            codeVal = current.weather_code ?? 0;
            setTemperature(tempVal);
            setWeatherCode(codeVal);
          }
        }

        // 3. Fetch elegant stylish statement from LLM API based on live conditions
        let fetchedStatement = '';
        try {
          const currentConditionStr = getWeatherCondition(codeVal);
          const aiRes = await axiosInstance.post('/ai/chat', {
            message: 'Provide exactly one ultra-short, very witty style recommendation based on today\'s weather. No labels or greetings.',
            weatherData: {
              temperature: tempVal,
              condition: currentConditionStr,
              cityName: finalCity || 'current location'
            }
          });
          
          fetchedStatement = (aiRes.data?.reply || '').replace(/["']/g, '').trim();
        } catch (aiErr) {
          console.warn('LLM Fetch failure, dropping back to calculated text:', aiErr);
          fetchedStatement = getAiStatement(tempVal, codeVal);
        }

        // 4. Secure statement and serialize persistent cache
        setAiStatement(fetchedStatement);

        await AsyncStorage.setItem('dashboard_data_cache', JSON.stringify({
          hourKey: currentHourKey,
          temp: tempVal,
          code: codeVal,
          city: finalCity,
          statement: fetchedStatement
        }));

      } catch (err) {
        console.error('Error during dashboard setup load:', err);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userSession');
    Alert.alert('Logged Out', 'You have been successfully logged out.');
    router.replace('/login');
  };

  const handleDeleteAccount = async (password: string) => {
    let activeDeleteId = userId;
    if (!activeDeleteId) {
      const stored = await AsyncStorage.getItem('userSession');
      if (stored) activeDeleteId = JSON.parse(stored).id;
    }
    
    if (!activeDeleteId) {
      throw new Error('Session recovery failed. Please sign in again to delete.');
    }
    
    // Send password to backend for verification + deletion
    await axiosInstance.delete(`/users/${activeDeleteId}`, {
      data: { password },
    });
    
    // Success path: Purge system cache
    await AsyncStorage.removeItem('userSession');
    router.replace('/login');
  };

  // Dynamically resolved real wardrobe image or fallback helper
  const getDynamicGarmentUri = (acceptedTypes: string[], fallbackUri: string) => {
    let acceptableTags: string[] = [];
    if (selectedEvent === 'Office') acceptableTags = ['Formal'];
    else if (selectedEvent === 'Gym') acceptableTags = ['Sports'];
    else if (selectedEvent === 'Dinner Date') acceptableTags = ['Party', 'Formal'];

    // Collect all matching assets that truly feature an image
    const items = wardrobeItems.filter((item: any) => 
      acceptedTypes.includes(item.type) && item.photo && item.photo.trim() !== ''
    );
    
    if (items.length === 0) return fallbackUri;

    // Attempt semantic match by context/event affinity
    const contextMatch = items.find((item: any) => acceptableTags.includes(item.event));
    if (contextMatch) return contextMatch.photo;

    // Default fallback selection within local set
    return items[0].photo;
  };

  // Select outfit metadata and dynamically swap hardcoded stock photography with real local inventory
  const baseOutfit = outfitConfig[selectedEvent] || outfitConfig['Office'];
  const activeOutfit = {
    ...baseOutfit,
    subtext: aiStatement || getAiStatement(temperature, weatherCode),
    top: getDynamicGarmentUri(['Tops', 'Outerwear', 'Ethnic'], baseOutfit.top),
    bottom: getDynamicGarmentUri(['Bottoms'], baseOutfit.bottom),
    shoes: getDynamicGarmentUri(['Footwear'], baseOutfit.shoes),
    accessory: getDynamicGarmentUri(['Accessories'], baseOutfit.accessory),
  };

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

  // Premium reactive visual theme engine
  const isDark = darkMode === true;
  const themeBg = isDark ? '#0c0c12' : '#f8f7fc';
  const themeSurface = isDark ? '#161623' : '#ffffff';
  const themeText = isDark ? '#f1f0ff' : '#1a1a24';
  const themeBorder = isDark ? '#222233' : '#f0eff6';

  return (
    <SafeAreaView className="flex-1" style={{ flex: 1, height: '100%', backgroundColor: themeBg, overflow: 'hidden' }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Top Header Row */}
      <View className="px-5 pt-4 pb-4 border-b" style={{ backgroundColor: themeBg, borderBottomColor: themeBorder }}>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => setSidebarOpen(true)} className="mr-2 p-1">
              <MenuIcon color={themeText} />
            </TouchableOpacity>
            <Text className="text-[22px] font-black tracking-tight ml-2" style={{ color: themeText }}>WearNext</Text>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' }}
            className="w-[38px] h-[38px] rounded-full border-[1.5px] border-border-brand"
          />
        </View>
      </View>

      <View className="flex-1" style={{ flex: 1 }}>
        {activeTab !== 'ai' ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 120, backgroundColor: themeBg }}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: themeBg }}
        >
          {activeTab === 'home' && (
            <Home
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
              useCelsius={useCelsius}
            />
          )}

          {activeTab === 'wardrobe' && (
            <Wardrobe
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              ethnicOnly={ethnicOnly}
              setEthnicOnly={setEthnicOnly}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarTab
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

          {activeTab === 'settings' && (
            <Settings
              email={email}
              handleDeleteAccount={handleDeleteAccount}
              useCelsius={useCelsius}
              darkMode={darkMode}
              onPreferenceChange={handleUpdatePreference}
            />
          )}
        </ScrollView>
      ) : (
        <View className="flex-1" style={{ flex: 1 }}>
          <AiTab
            aiQuery={aiQuery}
            setAiQuery={setAiQuery}
            weatherData={{
              temperature,
              condition: getWeatherCondition(weatherCode),
              cityName,
            }}
          />
        </View>
      )}
      </View>

      {activeTab === 'wardrobe' && (
        <>
          <TouchableOpacity
            className="absolute bottom-[90px] right-5 z-10 w-14 h-14 rounded-full bg-brand justify-center items-center"
            style={{ shadowColor: '#5e5ce6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
            onPress={handleLaunchOutfitCamera}
          >
            <Text className="text-white text-[28px] font-light" style={{ marginTop: -2 }}>+</Text>
          </TouchableOpacity>
          <BottomDrawer
            isVisible={isAddDrawerVisible}
            onClose={() => setIsAddDrawerVisible(false)}
            title="Add New Apparel"
            fields={wardrobeFields}
            initialValues={addDrawerInitialValues}
            onSubmit={handleAddWardrobeItem}
            submitButtonText="Add to Wardrobe"
          />
          {isProcessingImage && (
            <View className="absolute inset-0 bg-[rgba(26,26,36,0.85)] justify-center items-center z-[9999]">
              <ActivityIndicator size="large" color="#ffffff" />
              <Text className="text-white mt-4 text-base font-semibold">Extracting & Auto-Tagging with AI...</Text>
            </View>
          )}
        </>
      )}

      {/* Bottom Tab Navigation */}
      <View
        className="absolute bottom-0 left-0 right-0 h-[75px] flex-row items-center justify-around pb-4 border-t z-50"
        style={{ backgroundColor: themeSurface, borderTopColor: themeBorder, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 10 }}
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

      {/* Sidebar Overlay and Menu */}
      {isSidebarVisible && (
        <View className="absolute inset-0 z-[10000] flex-row">
          <TouchableOpacity
            activeOpacity={1}
            className="absolute inset-0"
            onPress={() => setSidebarOpen(false)}
          >
            <Animated.View
              className="absolute inset-0 bg-[rgba(0,0,0,0.4)]"
              style={{ opacity: sidebarAnim }}
            />
          </TouchableOpacity>

          <Animated.View
            className="w-[82%] max-w-[290px] h-full pb-6 rounded-tr-[32px] rounded-br-[32px] overflow-hidden"
            style={[
              { backgroundColor: themeSurface, shadowColor: '#000', shadowOffset: { width: 5, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
              { transform: [{ translateX: sidebarAnim.interpolate({ inputRange: [0, 1], outputRange: [-300, 0] }) }] }
            ]}
          >
            {/* High-Fidelity Header */}
            <View className="px-6 pt-14 pb-6 border-b border-[#f5f4fa]" style={{ backgroundColor: themeSurface }}>
              <View className="w-16 h-16 rounded-full p-0.5 border-2 border-[#5e5ce6] mb-4">
                <Image
                  source={{ uri: `https://ui-avatars.com/api/?name=${userFirstName}&background=5e5ce6&color=fff&size=128` }}
                  className="w-full h-full rounded-full bg-[#f1f0ff]"
                />
              </View>
              <Text className="text-[22px] font-extrabold text-text mb-0.5 tracking-tight">{userFirstName || 'User'}</Text>
              <Text className="text-[13.5px] font-medium text-text-faint mb-3.5">Style Enthusiast</Text>
              <View className="self-start bg-[#eef2ff] px-3.5 py-1 rounded-full">
                <Text className="text-[#5e5ce6] text-[11px] font-extrabold">{wardrobeItems.length || 0} Items</Text>
              </View>
            </View>

            {/* Streamlined Sidebar Menu */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 24, paddingHorizontal: 24 }}>
              <Text className="text-[11px] font-extrabold text-text-faint tracking-widest mb-5 opacity-70">SYSTEM</Text>
              
              <TouchableOpacity 
                className="flex-row items-center py-3 mb-2" 
                onPress={() => { setSidebarOpen(false); setActiveTab('settings'); }}
              >
                <MaterialCommunityIcons name="cog-outline" size={23} color="#4b5563" style={{ marginRight: 16 }} />
                <Text className="text-[16px] font-semibold text-[#374151]">Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-row items-center py-3" 
                onPress={() => { setSidebarOpen(false); Alert.alert('Help', 'Redirecting to Customer Support center.'); }}
              >
                <MaterialCommunityIcons name="help-circle-outline" size={23} color="#4b5563" style={{ marginRight: 16 }} />
                <Text className="text-[16px] font-semibold text-[#374151]">Help & Support</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Redesigned Branding Footer */}
            <View className="pt-5 pb-2 px-6 border-t border-[#f5f4fa] items-center">
              <TouchableOpacity
                className="flex-row items-center justify-center w-full bg-surface rounded-full h-12 border border-[#fecaca]"
                style={{ shadowColor: '#ef4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 }}
                onPress={() => { setSidebarOpen(false); handleLogout(); }}
              >
                <MaterialCommunityIcons name="logout-variant" size={20} color="#ef4444" style={{ marginRight: 8 }} />
                <Text className="text-[#b91c1c] font-extrabold text-[15px]">Sign Out</Text>
              </TouchableOpacity>
              <Text className="text-[#b1b0c5] text-[12px] font-medium mt-4 tracking-wide">WearNext v2.4.0</Text>
            </View>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}