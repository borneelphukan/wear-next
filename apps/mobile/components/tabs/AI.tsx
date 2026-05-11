import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axiosInstance from '../../api/axiosInstance';
import { ConfirmationModal } from '../ConfirmationModal';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  recommendedItems?: any[];
}

interface Props {
  styles?: any; // kept for backward compat but unused
  aiQuery: string;
  setAiQuery: (query: string) => void;
  weatherData?: {
    temperature: number | null;
    condition: string;
    cityName: string;
  };
}

const QUICK_PROMPTS = [
  'What should I wear today?',
  'Suggest a casual outfit',
  'Formal event styling tips',
  'How to layer for cold weather?',
];

export const AiTab: React.FC<Props> = ({ aiQuery, setAiQuery, weatherData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClearModalVisible, setIsClearModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem('ai_chat_history');
        if (stored) setMessages(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load chat history', e);
      }
    };
    loadHistory();
  }, []);

  const saveHistory = async (newMessages: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem('ai_chat_history', JSON.stringify(newMessages));
    } catch (e) {
      console.error('Failed to save chat history', e);
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isLoading]);

  const sendMessage = async (text?: string) => {
    const msgText = (text || aiQuery).trim();
    if (!msgText || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: msgText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveHistory(updatedMessages);
    setAiQuery('');
    setIsLoading(true);

    try {
      const res = await axiosInstance.post('/ai/chat', {
        message: msgText,
        conversationHistory: messages,
        weatherData,
      });
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: res.data.reply,
        recommendedItems: res.data.recommendedItems || [],
      };
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } catch (err: any) {
      console.error('AI chat error:', err);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your connection and try again.',
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConfirm = async () => {
    setMessages([]);
    setAiQuery('');
    try {
      await AsyncStorage.removeItem('ai_chat_history');
    } catch (e) {
      console.error('Failed to clear chat history', e);
    }
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} className="font-extrabold text-brand">
            {part.slice(2, -2)}
          </Text>
        );
      }
      return part;
    });
  };

  return (
    <View className="flex-1 px-5 pt-4">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 mr-4">
          <Text className="text-[22px] font-extrabold text-text mb-1.5">Styling Assistant</Text>
          <Text className="text-[13px] text-text-muted font-semibold leading-[18px] max-w-[90%]">
            Your personal editorial concierge for effortless fashion decisions.
          </Text>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity
            onPress={() => setIsClearModalVisible(true)}
            className="w-9 h-9 rounded-full bg-brand-light justify-center items-center"
          >
            <MaterialCommunityIcons name="broom" size={18} color="#5e5ce6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {messages.length === 0 ? (
          <View className="flex-1 justify-center items-center py-10">
            <View className="w-[72px] h-[72px] rounded-full bg-brand-light justify-center items-center mb-5">
              <MaterialCommunityIcons name="creation" size={40} color="#5e5ce6" />
            </View>
            <Text className="text-[20px] font-extrabold text-text mb-2 text-center">
              How can I style you today?
            </Text>
            <Text className="text-sm font-semibold text-text-faint text-center leading-5 max-w-[80%] mb-8">
              Ask me anything about outfits, trends, or what to wear from your wardrobe.
            </Text>

            {/* Quick Prompts */}
            <View className="flex-row flex-wrap gap-2.5 justify-center max-w-full">
              {QUICK_PROMPTS.map((prompt) => (
                <TouchableOpacity
                  key={prompt}
                  className="w-[47%] bg-surface rounded-2xl p-4 border border-border-brand"
                  style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 }}
                  onPress={() => sendMessage(prompt)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="lightning-bolt" size={14} color="#5e5ce6" style={{ marginBottom: 6 }} />
                  <Text className="text-[13px] font-bold text-text leading-[18px]">{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          messages.map((msg, idx) => (
            <View
              key={idx}
              className={`mb-4 ${msg.role === 'user' ? 'items-end' : 'items-start w-full'}`}
            >
              {msg.role === 'assistant' && (
                <View className="flex-row items-center mb-2">
                  <View className="w-[26px] h-[26px] rounded-full bg-brand justify-center items-center mr-2">
                    <MaterialCommunityIcons name="creation" size={14} color="#ffffff" />
                  </View>
                  <Text className="text-[11px] font-extrabold text-brand tracking-wider">AI STYLIST</Text>
                </View>
              )}

              <View
                className={
                  msg.role === 'user'
                    ? 'self-end bg-[#eef0f5] rounded-[20px] rounded-tr-sm py-3 px-4 max-w-[85%]'
                    : 'self-start bg-surface rounded-[20px] rounded-tl-sm py-3.5 px-4 max-w-[90%] border border-border mb-2'
                }
                style={msg.role === 'assistant' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 } : undefined}
              >
                <Text className={`text-[14px] leading-5 ${msg.role === 'user' ? 'text-text font-semibold' : 'text-text font-semibold'}`}>
                  {msg.role === 'user' ? msg.content : renderFormattedText(msg.content)}
                </Text>
              </View>

              {/* Recommended Items */}
              {msg.role === 'assistant' && msg.recommendedItems && msg.recommendedItems.length > 0 && (
                <View className="w-full mt-2 mb-4 pl-1">
                  <Text className="text-[11px] font-extrabold text-text-faint tracking-wider mb-2">
                    RECOMMENDED FROM YOUR CLOSET
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {msg.recommendedItems.map((item: any) => (
                      <View
                        key={item.id}
                        className="flex-row bg-surface rounded-2xl border-[1.5px] border-border-brand p-2.5 mr-3 w-[240px] items-center"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 }}
                      >
                        <Image
                          source={{ uri: item.photo || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' }}
                          className="w-16 h-16 rounded-xl bg-brand-light"
                          resizeMode="cover"
                        />
                        <View className="flex-1 ml-3 justify-center">
                          <Text className="text-[13px] font-extrabold text-text mb-0.5" numberOfLines={1}>{item.apparel_name}</Text>
                          <Text className="text-[11px] font-semibold text-text-muted mb-1.5">{item.material} • {item.color}</Text>
                          <View className="flex-row items-center gap-1 bg-brand-light px-2 py-0.5 rounded-lg self-start">
                            <MaterialCommunityIcons name="hanger" size={10} color="#5e5ce6" />
                            <Text className="text-[9px] font-extrabold text-brand">Wardrobe Item</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          ))
        )}

        {/* Typing Indicator */}
        {isLoading && (
          <View className="items-start mb-4 w-full">
            <View className="flex-row items-center mb-2">
              <View className="w-[26px] h-[26px] rounded-full bg-brand justify-center items-center mr-2">
                <MaterialCommunityIcons name="creation" size={14} color="#ffffff" />
              </View>
              <Text className="text-[11px] font-extrabold text-brand tracking-wider">AI STYLIST</Text>
            </View>
            <View className="flex-row items-center self-start bg-surface rounded-[20px] rounded-tl-sm py-3.5 px-4 border border-border gap-2.5">
              <ActivityIndicator size="small" color="#5e5ce6" />
              <Text className="text-[13px] font-semibold text-text-faint italic">Curating your look...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Row */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <View className="flex-row items-center py-3 border-t border-border mb-[75px]">
          <View className="flex-1 flex-row items-center bg-[#f1f0f6] rounded-full px-4 h-11 mr-2.5">
            <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#8b8a9f" />
            <TextInput
              placeholder="Ask your stylist..."
              placeholderTextColor="#8b8a9f"
              className="flex-1 text-[14px] text-text ml-2"
              value={aiQuery}
              onChangeText={setAiQuery}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
              editable={!isLoading}
              multiline={false}
            />
          </View>
          <TouchableOpacity
            className={`w-11 h-11 rounded-full bg-brand justify-center items-center ${(!aiQuery.trim() || isLoading) ? 'opacity-50' : ''}`}
            onPress={() => sendMessage()}
            disabled={!aiQuery.trim() || isLoading}
          >
            <MaterialCommunityIcons name="arrow-up" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <ConfirmationModal
        isVisible={isClearModalVisible}
        onClose={() => setIsClearModalVisible(false)}
        onConfirm={handleClearConfirm}
        title="Clear Styling History"
        message="Are you sure you want to permanently clear your conversation with the stylist?"
        confirmText="Clear Chat"
        cancelText="Cancel"
        iconName="broom"
        isDestructive
      />
    </View>
  );
};

export default AiTab;
