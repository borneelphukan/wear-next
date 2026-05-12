import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SunIcon, CloudIcon, SparkleIcon, TrendIcon, CalendarIcon } from '../SharedIcons';

interface Props {
  styles?: any; // kept for backward compat but unused
  userFirstName: string;
  temperature: number | null;
  weatherCode: number;
  cityName: string;
  weatherLoading: boolean;
  getTimeGreeting: () => string;
  getWeatherCondition: (code: number) => string;
  isSunny: (code: number) => boolean;
  activeOutfit: any;
  selectedEvent: string;
  setSelectedEvent: (evt: string) => void;
  handleShuffle: () => void;
  useCelsius: boolean;
  todaysEvents: Array<{ id: number; title: string; type: string; time: string }>;
  isCalendarConnected: boolean;
}

export const Home: React.FC<Props> = ({
  userFirstName,
  temperature,
  weatherCode,
  cityName,
  weatherLoading,
  getTimeGreeting,
  getWeatherCondition,
  isSunny,
  activeOutfit,
  selectedEvent,
  setSelectedEvent,
  handleShuffle,
  useCelsius,
  todaysEvents,
  isCalendarConnected,
}) => {
  const displayTemp =
    temperature !== null
      ? useCelsius
        ? Math.round(temperature)
        : Math.round((temperature * 9) / 5 + 32)
      : null;
  const unitLabel = useCelsius ? '°C' : '°F';

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} className="font-extrabold text-dark dark:text-yellow-200">
            {part.slice(2, -2)}
          </Text>
        );
      }
      return part;
    });
  };

  return (
    <View>
      {/* Greeting Row */}
      <View className="flex-row justify-between items-start mb-6">
        <View className="flex-1 pr-4">
          <Text className="text-2xl font-black text-dark dark:text-light leading-8 mb-2">
            {getTimeGreeting()}, {userFirstName}!
            {displayTemp !== null
              ? ` It's ${displayTemp}${unitLabel} and ${getWeatherCondition(weatherCode)}${cityName ? ` in ${cityName}` : ''}.`
              : weatherLoading
              ? ' Fetching weather…'
              : ''}
          </Text>
          <Text className="text-sm text-dark dark:text-light leading-5 font-medium">
            {renderFormattedText(activeOutfit.subtext)}
          </Text>
        </View>
        <View className="pt-1">
          {isSunny(weatherCode) ? <SunIcon /> : <CloudIcon />}
        </View>
      </View>

      {todaysEvents && todaysEvents.length > 0 ? (
        <>
          {/* Events Scroll */}
          <Text className="text-xs font-extrabold text-faint tracking-widest mb-3 dark:text-light">{"TODAY'S EVENTS"}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 25 }}>
            {todaysEvents.map((evt) => (
              <TouchableOpacity
                key={evt.id}
                className={`px-5 py-2 rounded-full mr-2 border ${
                  selectedEvent === evt.title
                    ? 'bg-brand border-brand'
                    : 'bg-brand-light dark:bg-gray-700 border-border-brand dark:border-gray-600'
                }`}
                onPress={() => setSelectedEvent(evt.title)}
              >
                <Text className={`text-sm font-bold ${selectedEvent === evt.title ? 'text-white' : 'text-muted dark:text-light'}`}>
                  {evt.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Wardrobe Card */}
          <View
            className="w-full h-[380px] rounded-[28px] bg-brand-light dark:bg-gray-700 relative mb-5 justify-center items-center overflow-hidden"
            style={{ shadowColor: '#3182ce', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 }}
          >
            <View className="w-full h-full relative justify-center items-center">
              <Image source={{ uri: activeOutfit.top }} className="w-[220px] h-[220px] rounded-2xl absolute top-8 opacity-90" />
              <Image
                source={{ uri: activeOutfit.bottom }}
                className="w-[200px] h-[200px] rounded-2xl absolute bottom-20 z-10"
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }}
              />
              <Image
                source={{ uri: activeOutfit.shoes }}
                className="w-[150px] h-[150px] rounded-2xl absolute bottom-6 z-20"
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 10 }}
              />
              <Image
                source={{ uri: activeOutfit.accessory }}
                className="w-[90px] h-[90px] rounded-xl absolute top-9 left-9 z-30"
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 6 }}
              />
            </View>

            <View
              className="absolute bottom-5 left-5 right-5 bg-surface dark:bg-gray-600 py-3 px-5 rounded-[18px] items-center z-40"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
            >
              <Text className="text-[17px] font-extrabold text-dark dark:text-light">{activeOutfit.title}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-between mb-6 gap-3">
            <TouchableOpacity
              className="flex-1 h-[52px] bg-brand rounded-full justify-center items-center"
              style={{ shadowColor: '#3182ce', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 3 }}
              onPress={() => Alert.alert('Wear Outfit', `You have selected ${activeOutfit.title} as your look!`)}
            >
              <Text className="text-white text-base font-bold">Wear This</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 h-[52px] border-2 border-brand bg-surface dark:bg-gray-600 rounded-full flex-row justify-center items-center gap-2"
              onPress={handleShuffle}
            >
              <SparkleIcon />
              <Text className="text-brand dark:text-light text-base font-bold">Shuffle</Text>
            </TouchableOpacity>
          </View>

          {/* Info Cards */}
          <View className="flex-row justify-between gap-4">
            <View className="flex-1 bg-brand-light dark:bg-gray-700 rounded-3xl p-4 min-h-[150px]">
              <View className="mb-3">
                <TrendIcon />
              </View>
              <Text className="text-[11px] font-extrabold text-brand dark:text-brand-soft tracking-widest mb-2">STYLE TIP</Text>
              <Text className="text-[13px] text-dark dark:text-light leading-[18px] font-semibold">
                {renderFormattedText(activeOutfit.styleTip)}
              </Text>
            </View>

            <View className="flex-1 bg-orange-bg dark:bg-gray-700 rounded-3xl p-4 min-h-[150px]">
              <View className="mb-3">
                <CalendarIcon />
              </View>
              <Text className="text-[11px] font-extrabold text-orange-accent dark:text-orange-300 tracking-widest mb-2">NEXT UP</Text>
              <Text className="text-[13px] text-dark dark:text-light leading-[18px] font-semibold">
                {renderFormattedText(activeOutfit.nextUp)}
              </Text>
            </View>
          </View>
        </>
      ) : !isCalendarConnected ? (
        <View className="w-full bg-brand-light dark:bg-gray-700 rounded-[24px] py-10 px-6 items-center justify-center mt-6 border border-border-brand dark:border-gray-600 border-dashed">
          <View className="w-16 h-16 bg-surface dark:bg-gray-600 rounded-full items-center justify-center mb-5" style={{ shadowColor: '#3182ce', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <CalendarIcon />
          </View>
          <Text className="text-[18px] font-black text-dark dark:text-light mb-2 text-center">Schedule Your Day</Text>
          <Text className="text-[14px] font-semibold text-muted dark:text-light text-center px-4 leading-5 max-w-[260px]">
            Add events to your calendar for events-based outfit suggestions!
          </Text>
        </View>
      ) : null}
    </View>
  );
};
