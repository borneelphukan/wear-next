import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { SearchIcon, FilterIcon, HangerIcon, TrouserIcon, SnowflakeIcon, WandIcon, ShoeIcon, WatchIcon } from '../SharedIcons';

interface WardrobeTabProps {
  styles: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  ethnicOnly: boolean;
  setEthnicOnly: (val: boolean) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: any) => void;
}

export const WardrobeTab: React.FC<WardrobeTabProps> = ({
  styles,
  searchQuery,
  setSearchQuery,
  ethnicOnly,
  setEthnicOnly,
  selectedFilter,
  setSelectedFilter,
}) => {
  return (
    <View style={styles.wardrobeContainer}>
      {/* Search and Ethnic Toggle Row */}
      <View style={styles.searchToggleRow}>
        <View style={styles.searchBarWrapper}>
          <SearchIcon />
          <TextInput
            placeholder="Search wardrobe..."
            placeholderTextColor="#8b8a9f"
            style={styles.searchInputField}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.ethnicTogglePill}>
          <Text style={styles.ethnicToggleLabel}>ETHNIC</Text>
          <TouchableOpacity
            style={[styles.toggleSwitch, ethnicOnly && styles.toggleSwitchActive]}
            onPress={() => setEthnicOnly(!ethnicOnly)}
          >
            <View style={[styles.toggleCircle, ethnicOnly && styles.toggleCircleActive]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontal Filter Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
        <TouchableOpacity
          style={[styles.filterBtn, selectedFilter === 'all' && styles.filterBtnActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <FilterIcon />
          <Text style={[styles.filterBtnText, selectedFilter === 'all' && styles.filterBtnTextActive]}>Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, selectedFilter === 'color' && styles.filterBtnActive]}
          onPress={() => setSelectedFilter('color')}
        >
          <Text style={[styles.filterBtnText, selectedFilter === 'color' && styles.filterBtnTextActive]}>Color</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, selectedFilter === 'material' && styles.filterBtnActive]}
          onPress={() => setSelectedFilter('material')}
        >
          <Text style={[styles.filterBtnText, selectedFilter === 'material' && styles.filterBtnTextActive]}>Material</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, selectedFilter === 'season' && styles.filterBtnActive]}
          onPress={() => setSelectedFilter('season')}
        >
          <Text style={[styles.filterBtnText, selectedFilter === 'season' && styles.filterBtnTextActive]}>Season</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Category Cards Section */}
      <View style={styles.categoriesSection}>
        {/* Top Row */}
        <View style={styles.categoriesTopRow}>
          {/* Large Vertical Tops Card */}
          <TouchableOpacity style={styles.topsLargeCard} onPress={() => Alert.alert('Tops Category', 'Viewing all tops (42 items).')}>
            <View style={styles.hangerIconWrapper}>
              <HangerIcon />
            </View>
            <View style={styles.topsCardContent}>
              <Text style={styles.categoryCardTitle}>Tops</Text>
              <Text style={styles.categoryCardSub}>42 items</Text>
            </View>
          </TouchableOpacity>

          {/* Right Stack */}
          <View style={styles.categoriesRightStack}>
            <TouchableOpacity style={styles.stackedCategoryCard} onPress={() => Alert.alert('Bottoms Category', 'Viewing all bottoms (28 items).')}>
              <View style={styles.stackedCardLeft}>
                <Text style={styles.categoryCardTitle}>Bottoms</Text>
                <Text style={styles.categoryCardSub}>28 items</Text>
              </View>
              <TrouserIcon />
            </TouchableOpacity>

            <TouchableOpacity style={styles.stackedCategoryCard} onPress={() => Alert.alert('Outerwear Category', 'Viewing all outerwear (12 items).')}>
              <View style={styles.stackedCardLeft}>
                <Text style={styles.categoryCardTitle}>Outerwear</Text>
                <Text style={styles.categoryCardSub}>12 items</Text>
              </View>
              <SnowflakeIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Row */}
        <View style={styles.categoriesBottomRow}>
          <TouchableOpacity style={styles.smallCategoryCard} onPress={() => Alert.alert('Ethnic Category', 'Viewing ethnic collection.')}>
            <WandIcon />
            <Text style={styles.smallCardTitle}>Ethnic</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallCategoryCard} onPress={() => Alert.alert('Footwear Category', 'Viewing footwear items.')}>
            <ShoeIcon />
            <Text style={styles.smallCardTitle}>Footwear</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallCategoryCard} onPress={() => Alert.alert('Accessories Category', 'Viewing accessory catalog.')}>
            <WatchIcon />
            <Text style={styles.smallCardTitle}>Accessories</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* All Items Grid Section */}
      <View style={styles.allItemsSection}>
        <Text style={styles.allItemsHeading}>All Items</Text>
        <View style={styles.allItemsGrid}>
          {/* Items */}
          <View style={styles.itemGridCard}>
            <View style={styles.itemImageWrapper}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1620012253295-c05518e993b2?auto=format&fit=crop&w=300&q=80' }} style={styles.itemImage} />
              <View style={styles.blueDotIndicator} />
            </View>
          </View>
          <View style={styles.itemGridCard}>
            <View style={styles.itemImageWrapper}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80' }} style={styles.itemImage} />
            </View>
          </View>
          <View style={styles.itemGridCard}>
            <View style={styles.itemImageWrapper}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=300&q=80' }} style={styles.itemImage} />
            </View>
          </View>
          <View style={styles.itemGridCard}>
            <View style={styles.itemImageWrapper}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80' }} style={styles.itemImage} />
            </View>
          </View>
          <View style={styles.itemGridCard}>
            <View style={styles.itemImageWrapper}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' }} style={styles.itemImage} />
            </View>
          </View>
          <View style={styles.itemGridCard}>
            <View style={styles.itemImageWrapper}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1624222247344-550fb8ec2780?auto=format&fit=crop&w=300&q=80' }} style={styles.itemImage} />
            </View>
          </View>
        </View>
      </View>

      {/* Floating Action Plus Button */}
      <TouchableOpacity style={styles.fabButton} onPress={() => Alert.alert('Add Item', 'Upload a new garment image to digitized catalog.')}>
        <Text style={styles.fabButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};
