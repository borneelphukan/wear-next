import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

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

  const subOptions = useMemo(() => {
    if (selectedFilter === 'color') {
      return ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Gray', 'Brown', 'Beige'];
    }
    if (selectedFilter === 'material') {
      return ['Cotton', 'Wool', 'Polyester', 'Denim', 'Leather', 'Silk', 'Linen'];
    }
    if (selectedFilter === 'season') {
      return ['Spring', 'Summer', 'Autumn', 'Winter'];
    }
    return [];
  }, [selectedFilter]);

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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
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

      {/* Collapsible Sections for Color, Material, Season tabs */}
      {selectedFilter !== 'all' && (
        <View style={{ gap: 4, marginTop: 12 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#5e5ce6" style={{ marginTop: 20 }} />
          ) : (
            subOptions.map(option => {
              const sectionItems = wardrobeItems.filter(item => {
                if (searchQuery && !item.apparel_name.toLowerCase().includes(searchQuery.toLowerCase())) {
                  return false;
                }
                if (ethnicOnly && item.type !== 'Ethnic') {
                  return false;
                }
                if (selectedFilter === 'color' && item.color !== option) return false;
                if (selectedFilter === 'material' && item.material !== option) return false;
                if (selectedFilter === 'season' && item.season !== option) return false;
                return true;
              });

              // Only render sections that have items matching active criteria
              if (sectionItems.length === 0) return null;

              const isCollapsed = expandedSections[option] === true;

              return (
                <View 
                  key={option} 
                  style={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: 16, 
                    overflow: 'hidden', 
                    borderWidth: 1, 
                    borderColor: '#e3e1f5', 
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.03,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => toggleSection(option)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 16,
                      backgroundColor: '#f5f4fd',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#5e5ce6' }} />
                      <Text style={{ fontSize: 16, fontWeight: '800', color: '#1a1a24' }}>
                        {option}
                      </Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#8b8a9f' }}>
                        ({sectionItems.length} {sectionItems.length === 1 ? 'item' : 'items'})
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                      size={20}
                      color="#656475"
                    />
                  </TouchableOpacity>

                  {!isCollapsed && (
                    <View style={{ padding: 16, backgroundColor: '#ffffff' }}>
                      <View style={styles.allItemsGrid}>
                        {sectionItems.map((item, idx) => (
                          <View key={item.id || idx} style={styles.itemGridCard}>
                            <View style={styles.itemImageWrapper}>
                              <Image 
                                source={{ uri: item.photo || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' }} 
                                style={styles.itemImage} 
                              />
                              {idx === 0 && <View style={styles.blueDotIndicator} />}
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
          {subOptions.every(option => {
            const sectionItems = wardrobeItems.filter(item => {
              if (searchQuery && !item.apparel_name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
              }
              if (ethnicOnly && item.type !== 'Ethnic') {
                return false;
              }
              if (selectedFilter === 'color' && item.color !== option) return false;
              if (selectedFilter === 'material' && item.material !== option) return false;
              if (selectedFilter === 'season' && item.season !== option) return false;
              return true;
            });
            return sectionItems.length === 0;
          }) && !loading && (
            <Text style={{ textAlign: 'center', marginTop: 24, color: '#8b8a9f', fontWeight: '600' }}>No classified items found in this section.</Text>
          )}
        </View>
      )}

      {/* Category Cards Section - Only shown when 'all' filter is selected */}
      {selectedFilter === 'all' && (
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
      )}

      {/* All Items Grid Section - Only shown when 'all' filter is selected */}
      {selectedFilter === 'all' && (
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
      )}
    </View>
  );
};
export default WardrobeTab;
