export interface LangflowConfig {
  tweaks?: Record<string, any>;
  input_type?: string;
  output_type?: string;
}

export class LangflowClient {
  private readonly TWEAKS = {
    "ChatInput-607TC": {},
    "ParseData-N1SbE": {},
    "Prompt-UkRo0": {},
    "SplitText-gMLdN": {},
    "ChatOutput-XjUer": {},
    "AstraDB-7D7if": {},
    "AstraDB-CFram": {},
    "File-KaGXk": {},
    "AzureOpenAIEmbeddings-27D3Q": {},
    "AzureOpenAIEmbeddings-aOEe5": {},
    "AzureOpenAIModel-8Uo4q": {}
  };

  constructor(private applicationToken: string) {}

  async runFlow(
    message: string,
    config: LangflowConfig = {}
  ) {
    const payload = {
      input_value: message,
      output_type: config.output_type || "chat",
      input_type: config.input_type || "chat",
      tweaks: config.tweaks || this.TWEAKS
    };

    console.log('API Request:', {
      payload,
      headers: {
        Authorization: 'Bearer ****'
      }
    });

    try {
      const response = await fetch('/api/langflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const data = await response.json();
      console.log('API Response Data:', data);
      return data;
    } catch (error) {
      console.error('Request Error Details:', {
        error,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}

export const langflowClient = new LangflowClient(
  import.meta.env.VITE_LANGFLOW_ACCESS_TOKEN || ''
);

if (!import.meta.env.VITE_LANGFLOW_ACCESS_TOKEN) {
  console.error('Missing required environment variable: VITE_LANGFLOW_ACCESS_TOKEN');
} 