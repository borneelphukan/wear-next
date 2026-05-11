import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { LeftArrowIcon, RightArrowIcon, PartyPopperIcon, BulbIcon } from '../SharedIcons';

interface Props {
  styles?: any; // kept for backward compat but unused
  currentMonthName: string;
  currentMonthShort: string;
  currentYear: number;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  weeks: (number | null)[][];
  selectedCalendarDay: number;
  setSelectedCalendarDay: (day: number) => void;
}

export const CalendarTab: React.FC<Props> = ({
  currentMonthName,
  currentMonthShort,
  currentYear,
  handlePrevMonth,
  handleNextMonth,
  weeks,
  selectedCalendarDay,
  setSelectedCalendarDay,
}) => {
  return (
    <View className="pb-10">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-5">
        <View>
          <Text className="text-[22px] font-black text-text mb-1">{currentMonthName} {currentYear}</Text>
          <Text className="text-[13px] text-text-muted font-semibold">
            {currentMonthName === 'November' ? 'Festivals: Diwali, Bhai Dooj' : 'No major holidays this month'}
          </Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity className="p-1.5" onPress={handlePrevMonth}>
            <LeftArrowIcon />
          </TouchableOpacity>
          <TouchableOpacity className="p-1.5 ml-4" onPress={handleNextMonth}>
            <RightArrowIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sync Card */}
      <View className="bg-brand-light rounded-2xl p-4 flex-row justify-between items-center mb-6">
        <View className="flex-row items-center flex-1">
          {/* Sync circles visual */}
          <View className="w-11 h-8 relative mr-3">
            <View className="w-7 h-7 rounded-full bg-surface border-[1.5px] border-[#e1e0f0] absolute left-0 top-0.5 z-10 justify-center items-center">
              <View className="w-3.5 h-2.5 border-[1.5px] border-[#a3a3c2] rounded-sm" />
            </View>
            <View
              className="w-7 h-7 rounded-full bg-surface border-[1.5px] border-brand absolute left-3.5 top-0.5 z-20 justify-center items-center"
              style={{ shadowColor: '#5e5ce6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
            >
              <View className="w-3.5 h-2.5 border-[1.5px] border-brand rounded-sm" />
            </View>
          </View>
          <View className="flex-1 pr-2">
            <Text className="text-[11px] font-extrabold text-text-muted tracking-wider mb-1">SYNC OPTIONS</Text>
            <Text className="text-xs font-semibold text-text leading-4">Sync your events to get smarter outfit suggestions.</Text>
          </View>
        </View>
        <TouchableOpacity
          className="bg-surface border-[1.5px] border-brand rounded-full px-4 py-2"
          onPress={() => Alert.alert('Sync Connected', 'Successfully synced with your calendar events!')}
        >
          <Text className="text-xs font-extrabold text-brand">CONNECT</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View
        className="bg-surface rounded-[20px] border border-border overflow-hidden mb-6"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 }}
      >
        {/* Header Row */}
        <View className="flex-row bg-brand-light py-2.5 border-b border-border">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
            <Text key={day} className="flex-1 text-center text-[11px] font-extrabold text-text-muted tracking-wide">{day}</Text>
          ))}
        </View>

        {/* Body */}
        <View className="py-1">
          {weeks.map((week, weekIdx) => (
            <View key={weekIdx} className="flex-row border-b border-border">
              {week.map((day, dayIdx) => {
                if (day === null) {
                  return <View key={`empty-${dayIdx}`} className="flex-1 h-[72px] border-r border-border" />;
                }
                const isActive = selectedCalendarDay === day;
                const isFestive = day === 6 && currentMonthName === 'November';
                return (
                  <TouchableOpacity
                    key={`day-${day}`}
                    className={`flex-1 h-[72px] justify-center items-center relative border-r border-border
                      ${isFestive ? 'bg-[#fffcf6]' : ''}
                      ${isActive ? 'border-2 border-brand rounded-lg z-10' : ''}
                    `}
                    onPress={() => setSelectedCalendarDay(day)}
                  >
                    {isActive && (
                      <Text className="absolute top-[-1px] bg-brand text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm tracking-wide z-10">
                        ACTIVE
                      </Text>
                    )}
                    <Text className={`text-[15px] font-bold ${isFestive ? 'text-[#c96f2c] font-extrabold' : 'text-text'} ${isActive ? 'text-brand font-black' : ''}`}>
                      {day}
                    </Text>
                    {isFestive && (
                      <Text className="absolute bottom-2 text-[9px] font-black text-[#c96f2c] tracking-wide">DIWALI</Text>
                    )}
                    {isActive && (
                      <View className="w-6 h-6 border-[1.5px] border-border-brand rounded-md mt-1 bg-surface" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* Planned Outfit */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-[18px] font-extrabold text-text">Planned for {currentMonthShort} {selectedCalendarDay}</Text>
        <TouchableOpacity onPress={() => Alert.alert('Edit', 'Opening outfit planner details.')}>
          <Text className="text-[13px] font-extrabold text-brand">Edit Details</Text>
        </TouchableOpacity>
      </View>

      <View
        className="bg-surface rounded-3xl border border-border p-4 flex-row justify-between mb-5"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 3 }}
      >
        {/* Left Col */}
        <View className="flex-[1.2] pr-2 justify-between">
          <View className="flex-row items-center mb-2">
            <PartyPopperIcon />
            <Text className="text-[11px] font-extrabold text-[#a86c43] tracking-wide">
              {selectedCalendarDay === 6 || selectedCalendarDay === 12 ? 'FESTIVE OCCASION' : 'CASUAL SMART'}
            </Text>
          </View>
          <Text className="text-[18px] font-black text-text mb-1">
            {selectedCalendarDay === 12 ? 'Royal Silk Ensemble' : selectedCalendarDay === 6 ? 'Diwali Celebration Look' : 'Autumn Knitwear & Chinos'}
          </Text>
          <Text className="text-[13px] text-text-muted font-semibold leading-[18px] mb-3">
            {selectedCalendarDay === 12 ? "Evening Pooja at the Malhotra's" : selectedCalendarDay === 6 ? "Traditional Pooja & Family Dinner" : "Casual meeting & workspace hours"}
          </Text>

          <View className="flex-row gap-2 mb-4">
            <View className="bg-brand-light rounded-xl px-3 py-1.5">
              <Text className="text-xs font-bold text-text">🌡️ {selectedCalendarDay === 6 ? '26°C' : selectedCalendarDay === 12 ? '22°C' : '19°C'}</Text>
            </View>
            <View className="bg-brand-light rounded-xl px-3 py-1.5">
              <Text className="text-xs font-bold text-text">☀️ {selectedCalendarDay === 6 || selectedCalendarDay === 12 ? 'Clear' : 'Overcast'}</Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-brand rounded-full h-10 justify-center items-center"
            style={{ shadowColor: '#5e5ce6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 2 }}
            onPress={() => Alert.alert('Outfit Confirmed', 'Look successfully confirmed!')}
          >
            <Text className="text-white text-xs font-extrabold tracking-wide">CONFIRM OUTFIT</Text>
          </TouchableOpacity>
        </View>

        {/* Right Col */}
        <View className="flex-[0.9] h-[180px] rounded-[18px] overflow-hidden relative">
          <Image
            source={{
              uri: selectedCalendarDay === 12
                ? 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'
                : selectedCalendarDay === 6
                ? 'https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?auto=format&fit=crop&w=300&q=80'
                : 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=300&q=80'
            }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute bottom-3 left-3 bg-[rgba(255,255,255,0.85)] px-2.5 py-1 rounded-lg">
            <Text className="text-[10px] font-black text-text tracking-wide">PREVIEW</Text>
          </View>
        </View>
      </View>

      {/* Advice Card */}
      <View className="bg-[#eef2ff] rounded-2xl p-4 flex-row items-center gap-3">
        <View className="w-9 h-9 rounded-full bg-surface justify-center items-center">
          <BulbIcon />
        </View>
        <Text className="flex-1 text-[13px] text-brand font-bold leading-[18px]">
          {selectedCalendarDay === 12
            ? 'Light breeze expected on Nov 13. Consider adding a pashmina to your planned look.'
            : selectedCalendarDay === 6
            ? 'Warm evening expected on Diwali Pooja. Lightweight silk will keep you comfortable.'
            : 'Cool overcast day. Layering with a cotton knitwear cardigan is recommended.'}
        </Text>
      </View>
    </View>
  );
};
