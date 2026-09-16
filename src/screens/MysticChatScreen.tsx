import { useTheme, useThemeStyles, withOpacity, type AppTheme } from '../theme/ThemeProvider';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { chatWithOracle } from '../services/geminiService';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  time: string;
}

export const MysticChatScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = useThemeStyles(createStyles);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: 'Chào mừng bạn đến với AuraMystic Oracle! ✨🔮 Tôi ở đây để cùng bạn soi sáng những băn khoăn về Tarot, Chiêm tinh, Tử vi, giấc mơ, hoặc bất kỳ dấu hiệu huyền bí nào từ vũ trụ. Bạn đang muốn tìm kiếm câu trả lời cho điều gì hôm nay?',
      time: 'Vừa xong',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const suggestionPrompts = [
    '🌙 Giải mã giấc mơ thấy bay lên bầu trời',
    '✨ Con số 1111 xuất hiện có ý nghĩa gì?',
    '🔮 Làm sao để tăng trực giác tâm linh?',
    '🌿 Phong thủy phòng ngủ giúp ngủ ngon',
    '🖐️ Ý nghĩa đường chỉ tay sinh đạo',
  ];

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageToSend) setInputText('');
    setIsLoading(true);

    try {
      const historyForAI = messages.map((m) => ({ role: m.role, text: m.text }));
      const responseText = await chatWithOracle(historyForAI, text);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Vũ trụ tạm thời gián đoạn tín hiệu. Vui lòng thử gửi lại câu hỏi của bạn nhé! ✨',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title="Tiên Tri Vũ Trụ (Oracle AI)"
        subtitle="Trò chuyện trực tiếp cùng Gemini AI 3.6 Flash"
        iconName="chatbubbles-outline"
        rightAction={() => {
          setMessages([
            {
              id: Date.now().toString(),
              role: 'model',
              text: 'Không gian tâm linh đã được thanh tẩy sạch sẽ. Bạn muốn chia sẻ câu hỏi mới nào? 🌟',
              time: 'Vừa xong',
            },
          ]);
        }}
        rightActionIcon="trash-outline"
      />

      {/* Suggestion Chips */}
      <View style={styles.suggestionsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {suggestionPrompts.map((prompt, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.suggestionChip}
              onPress={() => handleSend(prompt)}
            >
              <Text style={styles.suggestionText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chat Messages Stream */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatStream}
        contentContainerStyle={styles.chatContentContainer}
      >
        {messages.map((item) => {
          const isUser = item.role === 'user';
          return (
            <View
              key={item.id}
              style={[styles.messageRow, isUser ? styles.userRow : styles.modelRow]}
            >
              {!isUser && (
                <View style={styles.oracleAvatar}>
                  <Text style={styles.avatarEmoji}>🔮</Text>
                </View>
              )}

              <View
                style={[
                  styles.bubble,
                  isUser ? styles.userBubble : styles.modelBubble,
                ]}
              >
                <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                  {item.text}
                </Text>
                <Text style={styles.timestamp}>{item.time}</Text>
              </View>
            </View>
          );
        })}

        {isLoading && (
          <View style={[styles.messageRow, styles.modelRow]}>
            <View style={styles.oracleAvatar}>
              <Text style={styles.avatarEmoji}>🔮</Text>
            </View>
            <View style={[styles.bubble, styles.modelBubble, styles.loadingBubble]}>
              <ActivityIndicator size="small" color={theme.colors.accent} />
              <Text style={styles.loadingText}>Oracle đang kết nối linh cảm...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Hỏi Oracle bất kỳ điều gì về tâm linh..."
          placeholderTextColor={theme.colors.textSubtle}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons name="send" size={18} color={theme.colors.background} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  suggestionsWrapper: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: withOpacity(theme.colors.text, 0.06),
  },
  chipsScroll: {
    paddingHorizontal: 16,
  },
  suggestionChip: {
    backgroundColor: withOpacity(theme.colors.accent, 0.1),
    borderWidth: 0.8,
    borderColor: withOpacity(theme.colors.accent, 0.3),
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  suggestionText: {
    color: theme.colors.accentText,
    fontSize: 12,
  },
  chatStream: {
    flex: 1,
  },
  chatContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  modelRow: {
    justifyContent: 'flex-start',
  },
  oracleAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: withOpacity(theme.colors.secondaryAccent, 0.4),
    borderWidth: 1,
    borderColor: theme.colors.secondaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  avatarEmoji: {
    fontSize: 16,
  },
  bubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#D97706',
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    backgroundColor: withOpacity(theme.colors.surfaceHighlight, 0.85),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.25),
    borderBottomLeftRadius: 4,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textBody,
    fontSize: 12,
    marginLeft: 8,
  },
  messageText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 21,
  },
  userMessageText: {
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: 10,
    color: withOpacity(theme.colors.text, 0.5),
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: withOpacity(theme.colors.navigation, 0.95),
    borderTopWidth: 1,
    borderTopColor: withOpacity(theme.colors.accent, 0.2),
  },
  input: {
    flex: 1,
    backgroundColor: withOpacity(theme.colors.text, 0.06),
    borderWidth: 1,
    borderColor: withOpacity(theme.colors.accentBorder, 0.3),
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: theme.colors.text,
    fontSize: 14,
    maxHeight: 90,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendBtnDisabled: {
    opacity: 0.4,
    backgroundColor: theme.colors.textSubtle,
  },
});

