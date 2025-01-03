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
    
    // Always use the full URL in production
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        mode: 'cors',
        credentials: 'omit', // Change to 'omit' to avoid CORS preflight
        body: JSON.stringify(body)
      });

      const responseMessage = await response.json();
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText} - ${JSON.stringify(responseMessage)}`);
      }
      return responseMessage;
    } catch (error) {
      console.error('Request Error:', error);
      throw error;
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
    stream = false,
    callbacks?: StreamCallbacks
  ) {
    try {
      const response = await this.initiateSession(flowId, langflowId, message, stream, tweaks);
      
      if (stream && callbacks && response.outputs?.[0]?.outputs?.[0]?.artifacts?.stream_url) {
        const streamUrl = response.outputs[0].outputs[0].artifacts.stream_url;
        console.log(`Streaming from: ${streamUrl}`);
        return this.handleStream(streamUrl, callbacks);
      }

      if (response.outputs) {
        const output = response.outputs[0]?.outputs?.[0]?.outputs?.message;
        return {
          result: output?.message?.text || response.result
        };
      }

      return response;
    } catch (error) {
      console.error('Error running flow:', error);
      callbacks?.onError?.('Error initiating session');
      throw error;
    }
  }
}

// Update the singleton instance
export const langflowClient = new LangflowClient(
  'https://api.langflow.astra.datastax.com',
  'AstraCS:YKRGKfIXjCsXShKGmPoWZLoQ:3c2bcc8d06a34fd2fe32d8a084a9e5dee0e63617c1eab8d0f7f6243e15f5c68f'
); 