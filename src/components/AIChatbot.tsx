import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { sendChatMessage } from '../utils/api';
import { parseInsights } from '../utils/insightParser';
import { InsightsDisplay } from './InsightsDisplay';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardData: any;
}

// Add this interface for structured responses
interface AnalysisResponse {
  metrics: {
    engagement_rate: number;
    avg_likes: number;
    avg_shares: number;
    avg_comments: number;
    avg_views: number;
    primary_age_groups: string[];
  };
  direct_answer: {
    expected_likes: number;
    expected_shares: number;
    expected_comments: number;
    expected_views: number;
  };
  explanation: string;
  suggestions: {
    optimal_posting_time: string;
    hashtags: string[];
    content_quality: string;
    target_audience: string;
  };
}

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
      const initialPrompt = `Please analyze the social media data and provide insights in the following format:

Metrics:
  Provide detailed metrics including:
  - Average engagement rate across all posts
  - Average number of likes per post
  - Average shares per post
  - Average comments per post
  - Average views per post
  - Primary age groups that engage most

Direct Answer:
  - Expected Likes: [number]
  - Expected Shares: [number]
  - Expected Comments: [number]
  - Expected Views: [number]

Explanation:
  Provide a clear analysis of the data and factors affecting engagement.

Suggestions:
  - Optimal Posting Time: [specific time recommendation]
  - Hashtags: [list of recommended hashtags]
  - Content Quality: [specific content recommendations]
  - Target Audience: [audience targeting suggestions]

Please maintain consistent formatting with proper spacing and indentation.`;

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl h-[600px] flex flex-col relative">
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
            <div
              key={index}
              className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'assistant'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                Thinking...
              </div>
            </div>
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
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 