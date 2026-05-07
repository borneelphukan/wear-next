import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { SparkleIcon, WaterDropIcon, TrendingUpIcon, CirclePlusIcon, SubmitIcon } from '../SharedIcons';

interface AiTabProps {
  styles: any;
  aiQuery: string;
  setAiQuery: (query: string) => void;
}

export const AiTab: React.FC<AiTabProps> = ({
  styles,
  aiQuery,
  setAiQuery,
}) => {
  return (
    <View style={styles.aiTabContainer}>
      <View style={styles.aiHeader}>
        <Text style={styles.aiHeaderTitle}>Styling Assistant</Text>
        <Text style={styles.aiHeaderSub}>
          Your personal editorial concierge for effortless fashion decisions.
        </Text>
      </View>

      <View style={styles.aiChatArea}>
        <View style={styles.userBubble}>
          <Text style={styles.userBubbleText}>
            What should I wear to a wedding in humid Mumbai?
          </Text>
        </View>

        <View style={styles.aiStylistHeader}>
          <View style={styles.aiStylistIconBg}>
            <SparkleIcon color="#ffffff" />
          </View>
          <Text style={styles.aiStylistHeaderLabel}>AI STYLIST</Text>
        </View>

        <View style={styles.suggestionBox}>
          <View style={styles.breathabilityBanner}>
            <WaterDropIcon />
            <View style={styles.breathabilityTextContainer}>
              <Text style={styles.breathabilityBannerTitle}>PRIORITIZING BREATHABILITY</Text>
              <Text style={styles.breathabilityBannerBody}>
                Mumbai is currently 88% humid. Opting for natural fibers.
              </Text>
            </View>
          </View>

          <Text style={styles.recommendationText}>
            For a Mumbai wedding, linen and light silks are your best friends. Avoid synthetic blends which trap heat. I recommend a <Text style={styles.boldSug}>structured linen suit</Text> or a <Text style={styles.boldSug}>mulberry silk drape</Text> for maximum elegance without the discomfort.
          </Text>

          <View style={styles.trendBanner}>
            <TrendingUpIcon />
            <View style={styles.trendBannerTextContainer}>
              <Text style={styles.trendBannerTitle}>TREND ALERT</Text>
              <Text style={styles.trendBannerBody}>
                "Desert Minimalist" tones are peaking in tropical climates.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.fromWardrobeSection}>
        <Text style={styles.fromWardrobeHeading}>FROM YOUR WARDROBE</Text>
        <View style={styles.wardrobePillsRow}>
          <View style={styles.wardrobePillCard}>
            <View style={styles.wardrobeCardImageBg}>
              <View style={styles.wardrobeItemTag}>
                <Text style={styles.wardrobeItemTagText}>LINEN</Text>
              </View>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1620012253295-c05518e993b2?auto=format&fit=crop&w=150&q=80' }}
                style={styles.wardrobeItemImg}
              />
            </View>
            <Text style={styles.wardrobeItemName}>IVORY TUNIC</Text>
          </View>

          <View style={styles.wardrobePillCard}>
            <View style={styles.wardrobeCardImageBg}>
              <View style={styles.wardrobeItemTagBlue}>
                <Text style={styles.wardrobeItemTagTextBlue}>95% AIR</Text>
              </View>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=150&q=80' }}
                style={styles.wardrobeItemImg}
              />
            </View>
            <Text style={styles.wardrobeItemName}>SAND CHINOS</Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionPillsScroll}>
        <TouchableOpacity style={styles.actionPillOutline} onPress={() => Alert.alert('Linen Collection', 'Filtering wardrobe for linen items.')}>
          <Text style={styles.actionPillOutlineText}>Show more linen items</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionPillOutline} onPress={() => Alert.alert('Footwear', 'Viewing summer evening footwear.')}>
          <Text style={styles.actionPillOutlineText}>Evening footwear</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomInputRow}>
        <View style={styles.inputInnerWrapper}>
          <CirclePlusIcon />
          <TextInput
            placeholder="Ask your stylist..."
            placeholderTextColor="#8b8a9f"
            style={styles.stylistInputField}
            value={aiQuery}
            onChangeText={setAiQuery}
          />
        </View>
        <TouchableOpacity style={styles.submitArrowBtn} onPress={() => {
          if (aiQuery.trim()) {
            Alert.alert('AI Assistant', `Your stylist is searching for suggestions about "${aiQuery}"...`);
            setAiQuery('');
          }
        }}>
          <SubmitIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};
