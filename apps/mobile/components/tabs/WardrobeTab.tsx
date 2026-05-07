import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import axiosInstance from '../../api/axiosInstance';
import { SearchIcon, FilterIcon, HangerIcon, TrouserIcon, SnowflakeIcon, WandIcon, ShoeIcon, WatchIcon } from '../SharedIcons';

interface WardrobeTabProps {
  styles: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  ethnicOnly: boolean;
  setEthnicOnly: (val: boolean) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: any) => void;
  refreshTrigger: number;
}

export const WardrobeTab: React.FC<WardrobeTabProps> = ({
  styles,
  searchQuery,
  setSearchQuery,
  ethnicOnly,
  setEthnicOnly,
  selectedFilter,
  setSelectedFilter,
  refreshTrigger,
}) => {
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const countByCategory = useMemo(() => {
    const counts = {
      Tops: 0,
      Bottoms: 0,
      Outerwear: 0,
      Ethnic: 0,
      Footwear: 0,
      Accessories: 0,
    };
    wardrobeItems.forEach(item => {
      const type = item.type;
      if (type && type in counts) {
        counts[type as keyof typeof counts]++;
      }
    });
    return counts;
  }, [wardrobeItems]);

  useEffect(() => {
    fetchWardrobe();
  }, [refreshTrigger]);

  const fetchWardrobe = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/wardrobe');
      setWardrobeItems(res.data);
    } catch (err) {
      console.error('Failed to fetch wardrobe', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = wardrobeItems.filter(item => {
    // text search
    if (searchQuery && !item.apparel_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // ethnic filter
    if (ethnicOnly && item.type !== 'Ethnic') {
      return false;
    }
    // category selection filter
    if (activeCategory && item.type !== activeCategory) {
      return false;
    }
    // category filter
    if (selectedFilter !== 'all') {
      // Very basic filtering based on selected filter
      if (selectedFilter === 'color' && !item.color) return false;
      if (selectedFilter === 'material' && !item.material) return false;
      if (selectedFilter === 'season' && !item.season) return false;
    }
    return true;
  });

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
          <TouchableOpacity 
            style={[
              styles.topsLargeCard, 
              activeCategory === 'Tops' && { borderWidth: 2, borderColor: '#5e5ce6', backgroundColor: '#e3e1f5' }
            ]} 
            onPress={() => setActiveCategory(activeCategory === 'Tops' ? null : 'Tops')}
          >
            <View style={styles.hangerIconWrapper}>
              <HangerIcon />
            </View>
            <View style={styles.topsCardContent}>
              <Text style={styles.categoryCardTitle}>Tops</Text>
              <Text style={styles.categoryCardSub}>{countByCategory.Tops} items</Text>
            </View>
          </TouchableOpacity>

          {/* Right Stack */}
          <View style={styles.categoriesRightStack}>
            <TouchableOpacity 
              style={[
                styles.stackedCategoryCard,
                activeCategory === 'Bottoms' && { borderWidth: 2, borderColor: '#5e5ce6', backgroundColor: '#e3e1f5' }
              ]} 
              onPress={() => setActiveCategory(activeCategory === 'Bottoms' ? null : 'Bottoms')}
            >
              <View style={styles.stackedCardLeft}>
                <Text style={styles.categoryCardTitle}>Bottoms</Text>
                <Text style={styles.categoryCardSub}>{countByCategory.Bottoms} items</Text>
              </View>
              <TrouserIcon />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.stackedCategoryCard,
                activeCategory === 'Outerwear' && { borderWidth: 2, borderColor: '#5e5ce6', backgroundColor: '#e3e1f5' }
              ]} 
              onPress={() => setActiveCategory(activeCategory === 'Outerwear' ? null : 'Outerwear')}
            >
              <View style={styles.stackedCardLeft}>
                <Text style={styles.categoryCardTitle}>Outerwear</Text>
                <Text style={styles.categoryCardSub}>{countByCategory.Outerwear} items</Text>
              </View>
              <SnowflakeIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Row */}
        <View style={styles.categoriesBottomRow}>
          <TouchableOpacity 
            style={[
              styles.smallCategoryCard,
              activeCategory === 'Ethnic' && { borderWidth: 2, borderColor: '#5e5ce6', backgroundColor: '#e3e1f5' }
            ]} 
            onPress={() => setActiveCategory(activeCategory === 'Ethnic' ? null : 'Ethnic')}
          >
            <WandIcon />
            <Text style={styles.smallCardTitle}>Ethnic ({countByCategory.Ethnic})</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.smallCategoryCard,
              activeCategory === 'Footwear' && { borderWidth: 2, borderColor: '#5e5ce6', backgroundColor: '#e3e1f5' }
            ]} 
            onPress={() => setActiveCategory(activeCategory === 'Footwear' ? null : 'Footwear')}
          >
            <ShoeIcon />
            <Text style={styles.smallCardTitle}>Footwear ({countByCategory.Footwear})</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.smallCategoryCard,
              activeCategory === 'Accessories' && { borderWidth: 2, borderColor: '#5e5ce6', backgroundColor: '#e3e1f5' }
            ]} 
            onPress={() => setActiveCategory(activeCategory === 'Accessories' ? null : 'Accessories')}
          >
            <WatchIcon />
            <Text style={styles.smallCardTitle}>Accessories ({countByCategory.Accessories})</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* All Items Grid Section */}
      <View style={styles.allItemsSection}>
        <Text style={styles.allItemsHeading}>All Items</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#5e5ce6" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.allItemsGrid}>
            {filteredItems.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20, color: '#8b8a9f' }}>No items found.</Text>
            ) : (
              filteredItems.map((item, idx) => (
                <View key={item.id || idx} style={styles.itemGridCard}>
                  <View style={styles.itemImageWrapper}>
                    <Image source={{ uri: item.photo || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' }} style={styles.itemImage} />
                    {idx === 0 && <View style={styles.blueDotIndicator} />}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </View>
  );
};
