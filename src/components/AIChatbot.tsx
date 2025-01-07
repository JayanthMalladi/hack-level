import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { sendChatMessage } from '../utils/api';
import { parseInsights } from '../utils/insightParser';
import { InsightsDisplay } from './InsightsDisplay';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string | JSX.Element;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardData: any;
}

const ThinkingAnimation = () => (
  <div className="flex items-center space-x-2 p-2">
    <motion.div
      className="w-2 h-2 bg-blue-500 rounded-full"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    />
    <motion.div
      className="w-2 h-2 bg-blue-500 rounded-full"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
    />
    <motion.div
      className="w-2 h-2 bg-blue-500 rounded-full"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
    />
  </div>
);

export default function AIChatbot({ isOpen, onClose, dashboardData }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message: string = inputMessage) => {
    if (!message.trim()) return;

    if (message === inputMessage) {
      const formattedMessage = `Please analyze this aspect of the social media data: "${message}"

Provide your response in the following format:

Metrics:
  [Relevant metrics with proper spacing and indentation]

Direct Answer:
  [Clear, structured predictions or recommendations]

Explanation:
  [Detailed analysis with proper formatting]

Suggestions:
  [Well-formatted, actionable recommendations]`;

      setMessages(prev => [...prev, { role: 'user', content: message }]);
      setInputMessage('');
      setIsLoading(true);

      try {
        const chatRequest: ChatRequest = {
          dashboardData: dashboardData,
          userMessage: formattedMessage,
          chatHistory: messages
        };
        
        const result = await sendChatMessage(chatRequest);
        if (result && result.result) {
          const insights = parseInsights(result.result);
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: <InsightsDisplay insights={insights} />
          }]);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error details:', error);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Connection error. Please check your network connection and try again.' 
        }]);
      }
      setIsLoading(false);
    }
  };

  const initializeChat = async () => {
    if (messages.length === 0) {
      const initialPrompt = `Analyze the social media data and provide insights in exactly this format:

### Metrics
- **Engagement Rate:** [average engagement rate]%
- **Likes:** [average likes]
- **Shares:** [average shares]
- **Comments:** [average comments]
- **Views:** [average views]
- **Primary Age Group:** [most common age group]
- **Gender Split:** [percentage split between male/female/other]

### Format Insights
- [Compare performance of different post types (photo, video, carousel, reel, story)]
- [Include specific percentage differences in engagement]

### Predictions
- **Expected Likes:** [number]
- **Expected Shares:** [number]
- **Expected Comments:** [number]
- **Expected Views:** [number]

### Explanation
- [Analysis based on post_type, post_day, post_time, and engagement patterns]
- [Include correlations between hashtags and engagement]
- [Mention demographic preferences]

### Suggestions
- **Optimal Posting Time:** [Best performing day and time based on engagement_rate]
- **Hashtags:** [Top performing hashtags from hashtags_used]
- **Content Quality:** [Recommendations based on post_type performance]
- **Target Audience:** [Recommendations based on primary_age_group and engagement]`;

      await handleSendMessage(initialPrompt);
    }
  };

  useEffect(() => {
    if (isOpen) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add a helper function to format responses
  const formatResponse = (response: string): string => {
    // First, normalize line endings and remove extra spaces
    let formatted = response
      .replace(/\r\n/g, '\n')
      .replace(/\n\s+/g, '\n')
      .trim();

    // Add double line breaks before main sections
    const sections = ['Metrics:', 'Direct Answer:', 'Explanation:', 'Suggestions:'];
    sections.forEach(section => {
      formatted = formatted.replace(
        new RegExp(`(${section})`, 'g'),
        '\n\n$1'
      );
    });

    // Format bullet points and lists
    formatted = formatted
      // Add newline before bullet points and dashes
      .replace(/^[•-]/gm, '\n•')
      .replace(/(?<=\n)- /gm, '  - ') // Indent list items
      // Format numbered lists
      .replace(/(\d+\.)/gm, '\n$1')
      // Add space after colons in headers
      .replace(/^(.*?):\s*/gm, '$1:\n')
      // Indent content under sections
      .replace(/\n([^-•\n][^\n]*)/g, '\n  $1')
      // Fix double spacing
      .replace(/\n{3,}/g, '\n\n')
      // Ensure consistent spacing around sections
      .split('\n\n')
      .map(section => section.trim())
      .join('\n\n')
      .trim();

    return formatted;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl w-full max-w-2xl h-[600px] flex flex-col relative"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">AI Insights</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={index}
                  className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className="flex items-start max-w-[80%] gap-2">
                    {message.role === 'assistant' ? (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 order-2">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-lg ${
                        message.role === 'assistant'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-600 text-white order-1'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                      <ThinkingAnimation />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about your social media data..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 