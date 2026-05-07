import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SunIcon, CloudIcon, SparkleIcon, TrendIcon, CalendarIcon } from '../SharedIcons';

interface HomeTabProps {
  styles: any;
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
  setSelectedEvent: (evt: any) => void;
  handleShuffle: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  styles,
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
}) => {
  return (
    <View>
      <View style={styles.greetingRow}>
        <View style={styles.greetingTextContainer}>
          <Text style={styles.greetingTitle}>
            {getTimeGreeting()}, {userFirstName}!
            {temperature !== null
              ? ` It's ${temperature}°C and ${getWeatherCondition(weatherCode)}${cityName ? ` in ${cityName}` : ''}.`
              : weatherLoading
                ? ' Fetching weather…'
                : ''}
          </Text>
          <Text style={styles.greetingSubtitle}>
            {activeOutfit.subtext}
          </Text>
        </View>
        <View style={styles.weatherIconContainer}>
          {isSunny(weatherCode) ? <SunIcon /> : <CloudIcon />}
        </View>
      </View>

      <Text style={styles.sectionHeading}>TODAY'S EVENTS</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventsScroll}>
        {(['Office', 'Gym', 'Dinner Date']).map(evt => (
          <TouchableOpacity
            key={evt}
            style={[styles.eventPill, selectedEvent === evt && styles.eventPillActive]}
            onPress={() => setSelectedEvent(evt)}
          >
            <Text style={[styles.eventPillText, selectedEvent === evt && styles.eventPillTextActive]}>
              {evt}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.wardrobeCard}>
        <View style={styles.collageContainer}>
          <Image source={{ uri: activeOutfit.top }} style={styles.collageBackgroundItem} />
          <Image source={{ uri: activeOutfit.bottom }} style={styles.collageMiddleItem} />
          <Image source={{ uri: activeOutfit.shoes }} style={styles.collageForegroundItem} />
          <Image source={{ uri: activeOutfit.accessory }} style={styles.collageAccessoryItem} />
        </View>

        <View style={styles.outfitOverlayLabel}>
          <Text style={styles.outfitOverlayText}>{activeOutfit.title}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.wearBtn} onPress={() => Alert.alert('Wear Outfit', `You have selected ${activeOutfit.title} as your look!`)}>
          <Text style={styles.wearBtnText}>Wear This</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shuffleBtn} onPress={handleShuffle}>
          <SparkleIcon />
          <Text style={styles.shuffleBtnText}>Shuffle</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoCardsRow}>
        <View style={styles.styleTipCard}>
          <View style={styles.cardHeaderRow}>
            <TrendIcon />
          </View>
          <Text style={styles.cardSubtitle}>STYLE TIP</Text>
          <Text style={styles.cardBodyText}>
            {activeOutfit.styleTip}
          </Text>
        </View>

        <View style={styles.nextUpCard}>
          <View style={styles.cardHeaderRow}>
            <CalendarIcon />
          </View>
          <Text style={styles.cardSubtitleOrange}>NEXT UP</Text>
          <Text style={styles.cardBodyText}>
            {activeOutfit.nextUp}
          </Text>
        </View>
      </View>
    </View>
  );
};
