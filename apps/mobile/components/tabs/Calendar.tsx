import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, TextInput, Pressable, ScrollView } from 'react-native';
import { LeftArrowIcon, RightArrowIcon, PartyPopperIcon, BulbIcon } from '../SharedIcons';
import { MaterialIcons } from '@expo/vector-icons';

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
  eventsForSelectedDay: any[];
  onAddEvent: (data: any) => void;
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
  eventsForSelectedDay,
  onAddEvent,
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');

  const renderMonthView = () => (
    <>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-5">
        <View>
          <Text className="text-[22px] font-black text-dark dark:text-light mb-1">{currentMonthName} {currentYear}</Text>
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

      {/* Sync Section */}
      <View className="bg-brand-light dark:bg-gray-700 rounded-2xl p-4 flex-row justify-between items-center mb-6">
        <View className="flex-row items-center flex-1">
          <View className="w-11 h-8 relative mr-3">
            <View className="w-7 h-7 rounded-full bg-surface dark:bg-gray-600 border-[1.5px] border-[#e1e0f0] absolute left-0 top-0.5 z-10 justify-center items-center">
              <View className="w-3.5 h-2.5 border-[1.5px] border-[#a3a3c2] rounded-sm" />
            </View>
            <View
              className="w-7 h-7 rounded-full bg-surface dark:bg-gray-600 border-[1.5px] border-brand absolute left-3.5 top-0.5 z-20 justify-center items-center"
              style={{ shadowColor: '#3182ce', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
            >
              <View className="w-3.5 h-2.5 border-[1.5px] border-brand rounded-sm" />
            </View>
          </View>
          <View className="flex-1 pr-2">
            <Text className="text-[11px] font-extrabold text-muted dark:text-light tracking-wider mb-1">SYNC OPTIONS</Text>
            <Text className="text-xs font-semibold text-dark dark:text-light leading-4">Sync events for smarter outfit suggestions.</Text>
          </View>
        </View>
        <TouchableOpacity
          className="bg-surface dark:bg-gray-600 border-[1.5px] border-brand rounded-full px-4 py-2"
          onPress={() => Alert.alert('Sync Connected', 'Successfully synced with your calendar!')}
        >
          <Text className="text-xs font-extrabold text-brand">CONNECT</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View
        className="bg-surface dark:bg-gray-600 rounded-[20px] border border-border dark:border-[#4a4a5a] overflow-hidden mb-6"
        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 }}
      >
        <View className="flex-row bg-brand-light dark:bg-gray-700 py-2.5 border-b border-border dark:border-[#4a4a5a]">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
            <Text key={day} className="flex-1 text-center text-[11px] font-extrabold text-muted tracking-wide dark:text-light">{day}</Text>
          ))}
        </View>
        <View className="py-1">
          {weeks.map((week, weekIdx) => (
            <View key={weekIdx} className="flex-row border-b border-border dark:border-[#4a4a5a]">
              {week.map((day, dayIdx) => {
                if (day === null) {
                  return <View key={`empty-${dayIdx}`} className="flex-1 h-[72px] border-r border-border dark:border-[#4a4a5a]" />;
                }
                const isActive = selectedCalendarDay === day;
                const isFestive = day === 6 && currentMonthName === 'November';
                return (
                  <Pressable
                    key={`day-${day}`}
                    onPress={() => {
                      setSelectedCalendarDay(day);
                      setViewMode('day'); // Launch user into detail day view on tap!
                    }}
                    className="flex-1 h-[72px] border-r border-border dark:border-[#4a4a5a]"
                    style={({ pressed }) => ({
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      backgroundColor: isFestive ? '#4a3d2a' : (pressed ? '#374151' : 'transparent'),
                      opacity: pressed ? 0.8 : 1
                    })}
                  >
                    {isActive && (
                      <View 
                        className="absolute inset-[3px] border-2 border-brand rounded-xl bg-brand dark:bg-opacity-20 bg-opacity-10"
                        pointerEvents="none" 
                      />
                    )}
                    {isActive && (
                      <Text className="absolute top-0.5 bg-brand text-white text-[7px] font-black px-1.5 py-0.5 rounded-full tracking-widest z-20">
                        ACTIVE
                      </Text>
                    )}
                    <Text className={`text-[15px] font-bold z-10 ${isFestive ? 'text-[#c96f2c] font-extrabold' : 'text-dark dark:text-light'} ${isActive ? 'text-brand font-black' : ''}`}>
                      {day}
                    </Text>
                    {isFestive && (
                      <Text className="absolute bottom-1.5 text-[8px] font-black text-[#c96f2c] tracking-wide z-10">DIWALI</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </>
  );

  const renderDayView = () => (
    <>
      {/* Day Detail Header */}
      <View className="flex-row justify-between items-center mb-5">
        <TouchableOpacity 
          className="flex-row items-center"
          onPress={() => setViewMode('month')}
        >
          <View className="w-9 h-9 bg-surface dark:bg-gray-600 rounded-full justify-center items-center border border-border shadow-sm mr-3">
            <MaterialIcons name="chevron-left" size={24} color="#8b8a9f" />
          </View>
          <View>
            <Text className="text-[20px] font-black text-dark dark:text-light">
              {currentMonthShort} {selectedCalendarDay}
            </Text>
            <Text className="text-xs font-semibold text-muted dark:text-light">Daily Schedule</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center bg-brand rounded-full px-4 py-2"
          style={{ shadowColor: '#3182ce', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 }}
          onPress={() => onAddEvent(null)}
        >
          <MaterialIcons name="add" size={20} color="white" style={{ marginRight: 4 }} />
          <Text className="text-white font-extrabold text-sm">Event</Text>
        </TouchableOpacity>
      </View>

      {/* Immersive 24-Hour Daily Agenda Dashboard View maximized */}
      <View className="bg-surface dark:bg-gray-600 rounded-[32px] border border-border overflow-hidden mb-6" style={{ height: 550, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 5 }}>
        <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false} className="flex-1">
          <View className="relative py-6">
            {/* Hours Background Grid */}
            {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
              <View key={hour} className="flex-row items-start" style={{ height: 70 }}>
                <View className="w-16 items-end pr-4 pt-[-6px]">
                  <Text className="text-[11px] font-extrabold text-muted opacity-60 dark:text-light">
                    {hour % 12 === 0 ? 12 : hour % 12} {hour >= 12 ? 'PM' : 'AM'}
                  </Text>
                </View>
                <View className="flex-1 border-t border-[#f0eff6] dark:border-gray-600 relative" style={{ marginTop: 6 }}>
                  <View className="absolute top-[35px] left-0 right-0 border-t border-dashed border-[#f9f9fb] dark:border-gray-700" />
                </View>
              </View>
            ))}

            {/* Absolute Positioned Dynamic Event Logic */}
            {eventsForSelectedDay.map((ev, idx) => {
              const parseTimeToDec = (timeStr: string) => {
                if (!timeStr || !timeStr.includes(':')) return 0;
                const [h, m] = timeStr.split(':').map(Number);
                return h + (m / 60);
              };
              const start = parseTimeToDec(ev.from);
              const end = parseTimeToDec(ev.to);
              const dur = Math.max(0.5, end > start ? end - start : 1); 
              const topPos = 6 + (start * 70) + 6; // scaled height math
              const calcHeight = (dur * 70) - 2;

              const styleConfig: any = {
                Formal: { bg: 'rgba(94, 92, 230, 0.1)', border: '#3182ce', text: '#2b6cb0' },
                Party: { bg: 'rgba(255, 45, 85, 0.1)', border: '#ff2d55', text: '#e61d47' },
                Ethnic: { bg: 'rgba(255, 159, 10, 0.1)', border: '#ff9f0a', text: '#e68a00' },
                Sports: { bg: 'rgba(52, 199, 89, 0.1)', border: '#34c759', text: '#2ca64b' }
              };
              const colorSet = styleConfig[ev.type] || { bg: 'rgba(107, 114, 128, 0.08)', border: '#6b7280', text: '#374151' };

              return (
                <TouchableOpacity
                  key={ev.id || idx}
                  activeOpacity={0.85}
                  onPress={() => onAddEvent(ev)}
                  className="absolute right-5 left-16 rounded-2xl border-l-4 p-3.5 flex justify-center shadow-sm"
                  style={{
                    top: topPos,
                    height: calcHeight,
                    backgroundColor: colorSet.bg,
                    borderLeftColor: colorSet.border,
                    zIndex: 10
                  }}
                >
                  <Text className="font-black text-[14px] leading-5" style={{ color: colorSet.text }} numberOfLines={1}>
                    {ev.title}
                  </Text>
                  {calcHeight > 40 && (
                    <View className="flex-row items-center mt-1 opacity-80">
                      <MaterialIcons name="access-time" size={10} color={colorSet.text} style={{ marginRight: 3 }} />
                      <Text className="text-[11px] font-bold" style={{ color: colorSet.text }}>
                        {ev.time}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Full Match to user's Screenshot State placeholder */}
            {eventsForSelectedDay.length === 0 && (
              <View className="absolute top-[220px] left-16 right-5 items-center justify-center opacity-50">
                <View className="w-12 h-12 rounded-full bg-[#eef2ff] dark:bg-gray-700 justify-center items-center mb-2">
                  <BulbIcon />
                </View>
                <Text className="text-[16px] font-extrabold text-muted tracking-tight dark:text-light">No events planned yet</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );

  return (
    <View>
      {viewMode === 'month' ? renderMonthView() : renderDayView()}
    </View>
  );
};
