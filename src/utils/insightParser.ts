export interface InsightData {
  metrics: {
    engagement: string;
    likes: string;
    shares: string;
    comments: string;
    views: string;
    ageGroups: string[];
  };
  predictions: {
    likes: string;
    shares: string;
    comments: string;
    views: string;
  };
  recommendations: {
    timing: string;
    hashtags: string[];
    contentTips: string;
    audience: string;
  };
  analysis: string;
}

export function parseInsights(response: string): InsightData {
  // Default values
  const insights: InsightData = {
    metrics: {
      engagement: '0%',
      likes: '0',
      shares: '0',
      comments: '0',
      views: '0',
      ageGroups: []
    },
    predictions: {
      likes: '0',
      shares: '0',
      comments: '0',
      views: '0'
    },
    recommendations: {
      timing: '',
      hashtags: [],
      contentTips: '',
      audience: ''
    },
    analysis: ''
  };

  try {
    // First, let's log the response to see what we're getting
    console.log('Raw response:', response);

    // Extract metrics section
    const metricsMatch = response.match(/Metrics:\s*([^]*?)(?=Direct Answer:|$)/i);
    if (metricsMatch) {
      const metricsText = metricsMatch[1];
      console.log('Metrics text:', metricsText);

      // Try different patterns for engagement rate
      const engagementMatch = metricsText.match(/(?:engagement rate|rate)[^\d]*?([\d.]+)%/i) ||
                             metricsText.match(/(\d+\.?\d*)%/);
      insights.metrics.engagement = engagementMatch ? `${engagementMatch[1]}%` : '0%';

      // Extract numbers more flexibly
      const numbers = Array.from(metricsText.matchAll(/(\d+(?:,\d+)*)/g), m => m[1].replace(/,/g, ''));
      console.log('Found numbers:', numbers);

      if (numbers.length >= 5) {
        [insights.metrics.likes, 
         insights.metrics.comments, 
         insights.metrics.shares, 
         insights.metrics.views] = numbers.slice(0, 4);
      }

      // Extract age groups
      const ageMatch = metricsText.match(/(\d+(?:-\d+)?)\s*(?:years?(?:\s*old)?)?/i);
      if (ageMatch) {
        insights.metrics.ageGroups = [ageMatch[1]];
      }
    }

    // Use the same numbers for predictions since they match
    insights.predictions = {
      likes: insights.metrics.likes,
      shares: insights.metrics.shares,
      comments: insights.metrics.comments,
      views: insights.metrics.views
    };

    // Extract explanation
    const explanationMatch = response.match(/Explanation:\s*([^]*?)(?=Suggestions:|$)/i);
    if (explanationMatch) {
      insights.analysis = explanationMatch[1].trim();
    }

    // Extract recommendations
    const suggestionsMatch = response.match(/Suggestions:\s*([^]*?)$/i);
    if (suggestionsMatch) {
      const suggestionsText = suggestionsMatch[1];

      // Extract timing
      const timingMatch = suggestionsText.match(/(?:Optimal|Best)[^:]*Time[^:]*:([^]*?)(?=\n|$)/i);
      insights.recommendations.timing = timingMatch ? timingMatch[1].trim() : '';

      // Extract hashtags
      insights.recommendations.hashtags = Array.from(
        suggestionsText.matchAll(/#[\w\d]+/g),
        match => match[0]
      );

      // Extract content tips
      const contentMatch = suggestionsText.match(/Content Quality[^:]*:([^]*?)(?=\n|$)/i);
      insights.recommendations.contentTips = contentMatch ? contentMatch[1].trim() : '';

      // Extract audience info
      const audienceMatch = suggestionsText.match(/Target Audience[^:]*:([^]*?)(?=\n|$)/i);
      insights.recommendations.audience = audienceMatch ? audienceMatch[1].trim() : '';
    }

    // Log the parsed insights for debugging
    console.log('Parsed insights:', insights);
  } catch (error) {
    console.error('Error parsing insights:', error);
  }

  return insights;
} 