import { langflowClient } from './LangflowClient';

const FLOW_ID = 'bca2b923-d854-4755-86a8-0b51c350c42b';
const LANGFLOW_ID = '396deb1c-aadd-4f18-bd9e-a350c13098df';

export interface ChatRequest {
  dashboardData: any;
  userMessage: string;
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export const sendChatMessage = async (request: ChatRequest) => {
  try {
    const formattedRequest = {
      data: request.dashboardData,
      message: request.userMessage,
      history: request.chatHistory,
      timestamp: new Date().toISOString()
    };

    const response = await langflowClient.runFlow(
      JSON.stringify(formattedRequest),
      FLOW_ID,
      LANGFLOW_ID
    );
    
    if (response && response.result) {
      return response;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}; 