import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axiosInstance from '../../api/axiosInstance';
import { SearchIcon, FilterIcon, HangerIcon, TrouserIcon, SnowflakeIcon, WandIcon, ShoeIcon, WatchIcon } from '../SharedIcons';

interface Props {
  styles?: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  ethnicOnly: boolean;
  setEthnicOnly: (val: boolean) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: any) => void;
  refreshTrigger: number;
}

export const Wardrobe: React.FC<Props> = ({
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
    const counts = { Tops: 0, Bottoms: 0, Outerwear: 0, Ethnic: 0, Footwear: 0, Accessories: 0 };
    wardrobeItems.forEach((item) => {
      const type = item.type;
      if (type && type in counts) counts[type as keyof typeof counts]++;
    });
    return counts;
  }, [wardrobeItems]);

  const subOptions = useMemo(() => {
    if (selectedFilter === 'color') return ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Gray', 'Brown', 'Beige'];
    if (selectedFilter === 'material') return ['Cotton', 'Wool', 'Polyester', 'Denim', 'Leather', 'Silk', 'Linen'];
    if (selectedFilter === 'season') return ['Spring', 'Summer', 'Autumn', 'Winter'];
    return [];
  }, [selectedFilter]);

  useEffect(() => { fetchWardrobe(); }, [refreshTrigger]);

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
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const filteredItems = wardrobeItems.filter((item) => {
    if (searchQuery && !item.apparel_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (ethnicOnly && item.type !== 'Ethnic') return false;
    if (activeCategory && item.type !== activeCategory) return false;
    return true;
  });

  return (
    <View className="px-5 pt-4 pb-10">
      {/* Search + Ethnic Toggle */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-1 flex-row items-center bg-[#f1f0f6] dark:bg-gray-700 rounded-[14px] px-3 h-11 mr-3">
          <SearchIcon />
          <TextInput
            placeholder="Search wardrobe..."
            placeholderTextColor="#8b8a9f"
            className="flex-1 text-[14px] text-dark dark:text-light ml-2"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View className="flex-row items-center bg-[#f1f0f6] dark:bg-gray-700 rounded-full px-4 h-11">
          <Text className="text-xs font-extrabold text-muted tracking-wide mr-2 dark:text-light">ETHNIC</Text>
          <TouchableOpacity
            className={`w-[38px] h-[22px] rounded-full p-0.5 justify-center ${ethnicOnly ? 'bg-brand' : 'bg-[#d1d1d6]'}`}
            onPress={() => setEthnicOnly(!ethnicOnly)}
          >
            <View
              className={`w-[18px] h-[18px] rounded-full bg-white ${ethnicOnly ? 'self-end' : 'self-start'}`}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-5">
        {[
          { key: 'all', label: 'Filters', icon: true },
          { key: 'color', label: 'Color' },
          { key: 'material', label: 'Material' },
          { key: 'season', label: 'Season' },
        ].map(({ key, label, icon }) => (
          <TouchableOpacity
            key={key}
            className={`flex-row items-center px-4 py-2 rounded-full mr-2 h-9 ${
              selectedFilter === key ? 'bg-brand' : 'bg-[#f1f0f6] dark:bg-gray-700'
            }`}
            onPress={() => setSelectedFilter(key)}
          >
            {icon && <FilterIcon />}
            <Text className={`text-[13px] font-bold ml-1 ${selectedFilter === key ? 'text-white' : 'text-muted'} dark:text-light`}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filtered Sub-Sections */}
      {selectedFilter !== 'all' && (
        <View className="gap-1 mt-3">
          {loading ? (
            <ActivityIndicator size="large" color="#3182ce" style={{ marginTop: 20 }} />
          ) : (
            subOptions.map((option) => {
              const sectionItems = wardrobeItems.filter((item) => {
                if (searchQuery && !item.apparel_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                if (ethnicOnly && item.type !== 'Ethnic') return false;
                if (selectedFilter === 'color' && item.color !== option) return false;
                if (selectedFilter === 'material' && item.material !== option) return false;
                if (selectedFilter === 'season' && item.season !== option) return false;
                return true;
              });
              if (sectionItems.length === 0) return null;
              const isCollapsed = expandedSections[option] === true;
              return (
                <View
                  key={option}
                  className="bg-surface dark:bg-gray-600 rounded-2xl overflow-hidden border border-border-brand dark:border-gray-600 mb-3"
                  style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 }}
                >
                  <TouchableOpacity
                    onPress={() => toggleSection(option)}
                    activeOpacity={0.7}
                    className="flex-row justify-between items-center p-4 bg-[#f5f4fd] dark:bg-gray-700"
                  >
                    <View className="flex-row items-center gap-2">
                      <View className="w-2 h-2 rounded-full bg-brand" />
                      <Text className="text-base font-extrabold text-dark dark:text-light">{option}</Text>
                      <Text className="text-xs font-semibold text-faint dark:text-light">
                        ({sectionItems.length} {sectionItems.length === 1 ? 'item' : 'items'})
                      </Text>
                    </View>
                    <MaterialCommunityIcons name={isCollapsed ? 'chevron-down' : 'chevron-up'} size={20} color="#656475" />
                  </TouchableOpacity>
                  {!isCollapsed && (
                    <View className="p-4 bg-surface dark:bg-gray-600">
                      <View className="flex-row flex-wrap justify-between">
                        {sectionItems.map((item, idx) => (
                          <View key={item.id || idx} className="w-[31%] aspect-square bg-surface dark:bg-gray-700 rounded-2xl p-1.5 mb-3"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 }}
                          >
                            <View className="w-full h-full rounded-xl overflow-hidden bg-[#fcfbfd] dark:bg-gray-800 relative">
                              <Image
                                source={{ uri: item.photo || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' }}
                                className="w-full h-full"
                                resizeMode="cover"
                              />
                              {idx === 0 && <View className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-brand" />}
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
          {subOptions.every((option) => {
            const items = wardrobeItems.filter((item) => {
              if (searchQuery && !item.apparel_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
              if (ethnicOnly && item.type !== 'Ethnic') return false;
              if (selectedFilter === 'color' && item.color !== option) return false;
              if (selectedFilter === 'material' && item.material !== option) return false;
              if (selectedFilter === 'season' && item.season !== option) return false;
              return true;
            });
            return items.length === 0;
          }) && !loading && (
            <Text className="text-center mt-6 text-dark dark:text-light">No classified items found in this section.</Text>
          )}
        </View>
      )}

      {/* Category Cards — only shown for 'all' filter */}
      {selectedFilter === 'all' && (
        <View className="mb-6">
          {/* Top Row */}
          <View className="flex-row justify-between mb-3">
            {/* Large Tops Card */}
            <TouchableOpacity
              className={`flex-1 h-[170px] rounded-[20px] p-4 justify-between mr-3 ${activeCategory === 'Tops' ? 'border-2 border-brand bg-brand-lighter' : 'bg-[#f5f4fd] dark:bg-gray-700'}`}
              onPress={() => setActiveCategory(activeCategory === 'Tops' ? null : 'Tops')}
            >
              <View className="w-10 h-10 rounded-xl bg-surface dark:bg-gray-600 justify-center items-center">
                <HangerIcon />
              </View>
              <View>
                <Text className="text-base font-extrabold text-dark dark:text-light">Tops</Text>
                <Text className="text-xs font-semibold text-faint mt-0.5 dark:text-light">{countByCategory.Tops} items</Text>
              </View>
            </TouchableOpacity>

            {/* Right Stack */}
            <View className="flex-1 h-[170px] justify-between">
              {[
                { key: 'Bottoms', Icon: TrouserIcon },
                { key: 'Outerwear', Icon: SnowflakeIcon },
              ].map(({ key, Icon }) => (
                <TouchableOpacity
                  key={key}
                  className={`flex-row justify-between items-center rounded-2xl p-4 h-[78px] ${activeCategory === key ? 'border-2 border-brand bg-brand-lighter' : 'bg-[#f5f4fd] dark:bg-gray-700'}`}
                  onPress={() => setActiveCategory(activeCategory === key ? null : key)}
                >
                  <View>
                    <Text className="text-base font-extrabold text-dark dark:text-light">{key}</Text>
                    <Text className="text-xs font-semibold text-faint mt-0.5 dark:text-light">{countByCategory[key as keyof typeof countByCategory]} items</Text>
                  </View>
                  <Icon />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bottom Row */}
          <View className="flex-row justify-between">
            {[
              { key: 'Ethnic', Icon: WandIcon },
              { key: 'Footwear', Icon: ShoeIcon },
              { key: 'Accessories', Icon: WatchIcon },
            ].map(({ key, Icon }) => (
              <TouchableOpacity
                key={key}
                className={`flex-1 flex-row items-center justify-center rounded-2xl py-3 h-[52px] mx-1 ${activeCategory === key ? 'border-2 border-brand bg-brand-lighter' : 'bg-[#f5f4fd] dark:bg-gray-700'}`}
                onPress={() => setActiveCategory(activeCategory === key ? null : key)}
              >
                <Icon />
                <Text className="text-xs font-extrabold text-dark dark:text-light ml-1.5">
                  {key} ({countByCategory[key as keyof typeof countByCategory]})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* All Items Grid */}
      {selectedFilter === 'all' && (
        <View className="mb-8">
          <Text className="text-[18px] font-extrabold text-dark dark:text-light mb-4">All Items</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#3182ce" style={{ marginTop: 20 }} />
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {filteredItems.length === 0 ? (
                <Text className="text-center mt-5 text-faint w-full dark:text-light">No items found.</Text>
              ) : (
                filteredItems.map((item, idx) => (
                  <View
                    key={item.id || idx}
                    className="w-[31%] aspect-square bg-surface dark:bg-gray-600 rounded-2xl p-1.5 mb-3"
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 }}
                  >
                    <View className="w-full h-full rounded-xl overflow-hidden bg-[#fcfbfd] dark:bg-gray-700 relative">
                      <Image
                        source={{ uri: item.photo || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      {idx === 0 && <View className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-brand" />}
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

export default Wardrobe;
