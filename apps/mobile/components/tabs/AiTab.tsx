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
  StyleSheet,
  Dimensions,
  Image,
  Alert,
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

interface AiTabProps {
  styles: any;
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

export const AiTab: React.FC<AiTabProps> = ({
  styles: parentStyles,
  aiQuery,
  setAiQuery,
  weatherData,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClearModalVisible, setIsClearModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load chat history from AsyncStorage on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem('ai_chat_history');
        if (stored) {
          setMessages(JSON.parse(stored));
        }
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
        content:
          'Sorry, I encountered an error. Please check your connection and try again.',
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setIsClearModalVisible(true);
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
          <Text key={index} style={{ fontWeight: '800', color: '#5e5ce6' }}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      return part;
    });
  };

  return (
    <View style={localStyles.container}>
      {/* Header */}
      <View style={localStyles.header}>
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text style={localStyles.headerTitle}>Styling Assistant</Text>
          <Text style={localStyles.headerSub}>
            Your personal editorial concierge for effortless fashion decisions.
          </Text>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity onPress={clearChat} style={localStyles.clearBtn}>
            <MaterialCommunityIcons name="broom" size={18} color="#5e5ce6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Chat Area */}
      <ScrollView
        ref={scrollViewRef}
        style={localStyles.chatScroll}
        contentContainerStyle={localStyles.chatContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {messages.length === 0 ? (
          <View style={localStyles.emptyState}>
            <View style={localStyles.emptyIconWrapper}>
              <MaterialCommunityIcons
                name="creation"
                size={40}
                color="#5e5ce6"
              />
            </View>
            <Text style={localStyles.emptyTitle}>
              How can I style you today?
            </Text>
            <Text style={localStyles.emptySub}>
              Ask me anything about outfits, trends, or what to wear from your
              wardrobe.
            </Text>

            {/* Quick Prompts */}
            <View style={localStyles.quickPromptsGrid}>
              {QUICK_PROMPTS.map((prompt) => (
                <TouchableOpacity
                  key={prompt}
                  style={localStyles.quickPromptCard}
                  onPress={() => sendMessage(prompt)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="lightning-bolt"
                    size={14}
                    color="#5e5ce6"
                    style={{ marginBottom: 6 }}
                  />
                  <Text style={localStyles.quickPromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          messages.map((msg, idx) => (
            <View
              key={idx}
              style={
                msg.role === 'user'
                  ? localStyles.userBubbleWrapper
                  : localStyles.assistantBubbleWrapper
              }
            >
              {msg.role === 'assistant' && (
                <View style={localStyles.assistantLabel}>
                  <View style={localStyles.assistantIconBg}>
                    <MaterialCommunityIcons
                      name="creation"
                      size={14}
                      color="#ffffff"
                    />
                  </View>
                  <Text style={localStyles.assistantLabelText}>AI STYLIST</Text>
                </View>
              )}
              <View
                style={
                  msg.role === 'user'
                    ? localStyles.userBubble
                    : localStyles.assistantBubble
                }
              >
                <Text
                  style={
                    msg.role === 'user'
                      ? localStyles.userBubbleText
                      : localStyles.assistantBubbleText
                  }
                >
                  {msg.role === 'user' ? msg.content : renderFormattedText(msg.content)}
                </Text>
              </View>

              {/* Recommended Wardrobe Items Section */}
              {msg.role === 'assistant' && msg.recommendedItems && msg.recommendedItems.length > 0 && (
                <View style={localStyles.recommendedContainer}>
                  <Text style={localStyles.recommendedTitle}>RECOMMENDED FROM YOUR CLOSET</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={localStyles.recommendedScroll}>
                    {msg.recommendedItems.map((item: any) => (
                      <View key={item.id} style={localStyles.recommendedCard}>
                        <Image
                          source={{ uri: item.photo || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80' }}
                          style={localStyles.recommendedImage}
                        />
                        <View style={localStyles.recommendedInfo}>
                          <Text style={localStyles.recommendedName} numberOfLines={1}>{item.apparel_name}</Text>
                          <Text style={localStyles.recommendedMeta}>{item.material} • {item.color}</Text>
                          <View style={localStyles.linkBadge}>
                            <MaterialCommunityIcons name="hanger" size={10} color="#5e5ce6" />
                            <Text style={localStyles.linkBadgeText}>Wardrobe Item</Text>
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
          <View style={localStyles.assistantBubbleWrapper}>
            <View style={localStyles.assistantLabel}>
              <View style={localStyles.assistantIconBg}>
                <MaterialCommunityIcons
                  name="creation"
                  size={14}
                  color="#ffffff"
                    />
                  </View>
              <Text style={localStyles.assistantLabelText}>AI STYLIST</Text>
                </View>
            <View style={localStyles.typingBubble}>
              <ActivityIndicator size="small" color="#5e5ce6" />
              <Text style={localStyles.typingText}>Curating your look...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Row */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <View style={localStyles.inputRow}>
          <View style={localStyles.inputWrapper}>
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={20}
              color="#8b8a9f"
            />
            <TextInput
              placeholder="Ask your stylist..."
              placeholderTextColor="#8b8a9f"
              style={localStyles.inputField}
              value={aiQuery}
              onChangeText={setAiQuery}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
              editable={!isLoading}
              multiline={false}
            />
          </View>
          <TouchableOpacity
            style={[
              localStyles.sendBtn,
              (!aiQuery.trim() || isLoading) && localStyles.sendBtnDisabled,
            ]}
            onPress={() => sendMessage()}
            disabled={!aiQuery.trim() || isLoading}
          >
            <MaterialCommunityIcons
              name="arrow-up"
              size={22}
              color="#ffffff"
            />
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

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a24',
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 13,
    color: '#656475',
    fontWeight: '600',
    lineHeight: 18,
    maxWidth: '90%',
  },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f0fc',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Chat
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f1f0fc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a24',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b8a9f',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '80%',
    marginBottom: 30,
  },

  // Quick Prompts
  quickPromptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    maxWidth: '100%',
  },
  quickPromptCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e3e1f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  quickPromptText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a24',
    lineHeight: 18,
  },

  // User Bubble
  userBubbleWrapper: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#eef0f5',
    borderRadius: 20,
    borderTopRightRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: '85%',
  },
  userBubbleText: {
    fontSize: 14,
    color: '#1a1a24',
    fontWeight: '600',
    lineHeight: 20,
  },

  // Assistant Bubble
  assistantBubbleWrapper: {
    alignItems: 'flex-start',
    marginBottom: 16,
    width: '100%',
  },
  assistantLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assistantIconBg: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#5e5ce6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  assistantLabelText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5e5ce6',
    letterSpacing: 0.8,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderTopLeftRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 18,
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: '#f0eff6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  assistantBubbleText: {
    fontSize: 14,
    color: '#1a1a24',
    fontWeight: '600',
    lineHeight: 22,
  },

  // Recommended Clothes Container
  recommendedContainer: {
    width: '100%',
    marginTop: 8,
    marginBottom: 16,
    paddingLeft: 4,
  },
  recommendedTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8b8a9f',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  recommendedScroll: {
    flexDirection: 'row',
  },
  recommendedCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e3e1f5',
    padding: 10,
    marginRight: 12,
    width: 240,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendedImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#f5f4fd',
    resizeMode: 'cover',
  },
  recommendedInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  recommendedName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1a1a24',
    marginBottom: 2,
  },
  recommendedMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: '#656475',
    marginBottom: 6,
  },
  linkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f0fc',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  linkBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#5e5ce6',
  },

  // Typing
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderTopLeftRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#f0eff6',
    gap: 10,
  },
  typingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b8a9f',
    fontStyle: 'italic',
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0eff6',
    marginBottom: 75,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f0f6',
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 44,
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a24',
    marginLeft: 8,
    paddingVertical: 0,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5e5ce6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});

export default AiTab;
