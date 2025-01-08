import { langflowClient } from './LangflowClient';

export interface ChatRequest {
  dashboardData: any;
  userMessage: string;
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export const sendChatMessage = async (request: ChatRequest) => {
  try {
    console.log('Chat Request:', {
      dashboardData: request.dashboardData,
      messageLength: request.userMessage.length,
      historyLength: request.chatHistory.length
    });

    const formattedMessage = {
      data: request.dashboardData,
      message: request.userMessage,
      history: request.chatHistory
    };

    console.log('Formatted Message:', formattedMessage);

    const response = await langflowClient.runFlow(
      JSON.stringify(formattedMessage),
      {
        input_type: "chat",
        output_type: "chat"
      }
    );

    console.log('Langflow Response:', response);

    if (response && response.output && response.output.length > 0) {
      const result = {
        result: response.output[0].text || response.output[0].message || response.result
      };
      console.log('Parsed Result:', result);
      return result;
    }

    console.error('Invalid Response Format:', response);
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('API Error Full Details:', {
      error,
      message: error.message,
      stack: error.stack
    });
    return {
      result: "Uh-oh! There seems to be an error on our side. Please try again later."
    };
  }
}; 