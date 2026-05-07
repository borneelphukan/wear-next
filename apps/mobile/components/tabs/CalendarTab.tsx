import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { LeftArrowIcon, RightArrowIcon, PartyPopperIcon, BulbIcon } from '../SharedIcons';

interface CalendarTabProps {
  styles: any;
  currentMonthName: string;
  currentMonthShort: string;
  currentYear: number;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  weeks: (number | null)[][];
  selectedCalendarDay: number;
  setSelectedCalendarDay: (day: number) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  styles,
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
    <View style={styles.calendarTabContainer}>
      <View style={styles.calendarHeaderRow}>
        <View>
          <Text style={styles.calendarMonthText}>{currentMonthName} {currentYear}</Text>
          <Text style={styles.calendarFestivalsText}>
            {currentMonthName === 'November' ? 'Festivals: Diwali, Bhai Dooj' : 'No major holidays this month'}
          </Text>
        </View>
        <View style={styles.calendarNavArrows}>
          <TouchableOpacity style={styles.arrowButton} onPress={handlePrevMonth}>
            <LeftArrowIcon />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.arrowButton, { marginLeft: 15 }]} onPress={handleNextMonth}>
            <RightArrowIcon />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.syncCard}>
        <View style={styles.syncLeft}>
          <View style={styles.syncCircleGroup}>
            <View style={styles.syncCircle1}>
              <View style={styles.syncCircleInner} />
            </View>
            <View style={styles.syncCircle2}>
              <View style={styles.syncCircleInnerActive} />
            </View>
          </View>
          <View style={styles.syncTextContainer}>
            <Text style={styles.syncTitle}>SYNC OPTIONS</Text>
            <Text style={styles.syncSubtext}>Sync your events to get smarter outfit suggestions.</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.connectBtn} onPress={() => Alert.alert('Sync Connected', 'Successfully synced with your calendar events!')}>
          <Text style={styles.connectBtnText}>CONNECT</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridCard}>
        <View style={styles.gridHeaderRow}>
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <Text key={day} style={styles.gridHeaderText}>{day}</Text>
          ))}
        </View>

        <View style={styles.gridBody}>
          {weeks.map((week, weekIdx) => (
            <View key={weekIdx} style={styles.gridRowLine}>
              {week.map((day, dayIdx) => {
                if (day === null) {
                  return <View key={`empty-${dayIdx}`} style={styles.emptyGridCell} />;
                }
                const isActive = selectedCalendarDay === day;
                const isFestive = day === 6 && currentMonthName === 'November';
                return (
                  <TouchableOpacity
                    key={`day-${day}`}
                    style={[
                      styles.gridCell,
                      isFestive && styles.festiveCell,
                      isActive && styles.activeCell,
                    ]}
                    onPress={() => setSelectedCalendarDay(day)}
                  >
                    {isActive && <Text style={styles.activeTag}>ACTIVE</Text>}
                    <Text style={[
                      styles.gridCellText,
                      isFestive && styles.festiveCellText,
                      isActive && styles.activeCellText,
                    ]}>
                      {day}
                    </Text>
                    {isFestive && <Text style={styles.festiveLabel}>DIWALI</Text>}
                    {isActive && <View style={styles.activeOutfitBox} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.plannedHeaderRow}>
        <Text style={styles.plannedTitle}>Planned for {currentMonthShort} {selectedCalendarDay}</Text>
        <TouchableOpacity onPress={() => Alert.alert('Edit', 'Opening outfit planner details.')}>
          <Text style={styles.editDetailsLink}>Edit Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.plannedCard}>
        <View style={styles.plannedLeftCol}>
          <View style={styles.plannedOccasionRow}>
            <PartyPopperIcon />
            <Text style={styles.plannedOccasionLabel}>
              {selectedCalendarDay === 6 || selectedCalendarDay === 12 ? 'FESTIVE OCCASION' : 'CASUAL SMART'}
            </Text>
          </View>
          <Text style={styles.plannedOutfitTitle}>
            {selectedCalendarDay === 12 
              ? 'Royal Silk Ensemble' 
              : selectedCalendarDay === 6 
                ? 'Diwali Celebration Look' 
                : 'Autumn Knitwear & Chinos'}
          </Text>
          <Text style={styles.plannedOutfitSub}>
            {selectedCalendarDay === 12 
              ? "Evening Pooja at the Malhotra's" 
              : selectedCalendarDay === 6 
                ? "Traditional Pooja & Family Dinner" 
                : "Casual meeting & workspace hours"}
          </Text>

          <View style={styles.plannedWeatherPills}>
            <View style={styles.plannedPill}>
              <Text style={styles.plannedPillText}>🌡️ {selectedCalendarDay === 6 ? '26°C' : selectedCalendarDay === 12 ? '22°C' : '19°C'}</Text>
            </View>
            <View style={styles.plannedPill}>
              <Text style={styles.plannedPillText}>☀️ {selectedCalendarDay === 6 || selectedCalendarDay === 12 ? 'Clear' : 'Overcast'}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.confirmBtn} onPress={() => Alert.alert('Outfit Confirmed', 'Look successfully confirmed!')}>
            <Text style={styles.confirmBtnText}>CONFIRM OUTFIT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.plannedRightCol}>
          <Image
            source={{ 
              uri: selectedCalendarDay === 12 
                ? 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'
                : selectedCalendarDay === 6 
                  ? 'https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?auto=format&fit=crop&w=300&q=80'
                  : 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=300&q=80'
            }}
            style={styles.previewImage}
          />
          <View style={styles.previewOverlay}>
            <Text style={styles.previewText}>PREVIEW</Text>
          </View>
        </View>
      </View>

      <View style={styles.adviceCard}>
        <View style={styles.adviceIconWrapper}>
          <BulbIcon />
        </View>
        <Text style={styles.adviceText}>
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
