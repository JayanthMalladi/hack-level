export interface StreamCallbacks {
  onUpdate?: (data: any) => void;
  onClose?: (message: string) => void;
  onError?: (error: any) => void;
}

export class LangflowClient {
  constructor(
    private baseURL: string,
    private applicationToken: string
  ) {}

  async post(endpoint: string, body: any, headers: Record<string, string> = {}) {
    headers["Authorization"] = `Bearer ${this.applicationToken}`;
    headers["Content-Type"] = "application/json";
    
    const url = `/api${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Request Error:', error);
      return {
        result: "Uh-oh! There seems to be an error on our side. Please try again later."
      };
    }
  }

  private handleStream(streamUrl: string, callbacks: StreamCallbacks) {
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = event => {
      const data = JSON.parse(event.data);
      callbacks.onUpdate?.(data);
    };

    eventSource.onerror = event => {
      console.error('Stream Error:', event);
      callbacks.onError?.(event);
      eventSource.close();
    };

    eventSource.addEventListener("close", () => {
      callbacks.onClose?.('Stream closed');
      eventSource.close();
    });

    return eventSource;
  }

  async initiateSession(
    flowId: string,
    langflowId: string,
    inputValue: string,
    stream = false,
    tweaks: Record<string, any> = {}
  ) {
    const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}?stream=${stream}`;
    return this.post(endpoint, {
      input_value: inputValue,
      input_type: "chat",
      output_type: "chat",
      tweaks: tweaks
    });
  }

  async runFlow(
    message: string,
    flowId: string,
    langflowId: string,
    tweaks: Record<string, any> = {},
    stream = false
  ) {
    const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}`;
    const response = await this.post(endpoint, {
      input_value: message,
      input_type: "text",
      output_type: "text",
      tweaks: tweaks
    });

    if (response && response.output && response.output.length > 0) {
      return {
        result: response.output[0].text || response.output[0].message || "No response"
      };
    }

    return response;
  }
}

export const langflowClient = new LangflowClient(
  '',
  import.meta.env.VITE_LANGFLOW_ACCESS_TOKEN || ''
);

if (!import.meta.env.VITE_LANGFLOW_ACCESS_TOKEN) {
  console.error('Missing required environment variables');
} 