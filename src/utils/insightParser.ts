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
    // Extract metrics with exact patterns
    const metricsMatch = response.match(/Metrics:\s*([^]*?)(?=Direct Answer:|$)/i);
    if (metricsMatch) {
      const metricsText = metricsMatch[1];

      // Extract exact numbers with specific patterns
      const extractMetric = (pattern: string): string => {
        const match = metricsText.match(new RegExp(pattern, 'i'));
        return match ? match[1].replace(/,/g, '') : '0';
      };

      insights.metrics.engagement = extractMetric('engagement rate:\\s*([\\d.]+)%') + '%';
      insights.metrics.likes = extractMetric('average likes:\\s*([\\d,]+)');
      insights.metrics.shares = extractMetric('average shares:\\s*([\\d,]+)');
      insights.metrics.comments = extractMetric('average comments:\\s*([\\d,]+)');
      insights.metrics.views = extractMetric('average views:\\s*([\\d,]+)');
      
      // Extract age groups
      const ageMatch = metricsText.match(/primary age groups?:\s*([\d-]+)/i);
      insights.metrics.ageGroups = ageMatch ? [ageMatch[1]] : [];
    }

    // Extract predictions with exact patterns
    const directMatch = response.match(/Direct Answer:\s*([^]*?)(?=Explanation:|$)/i);
    if (directMatch) {
      const directText = directMatch[1];

      const extractPrediction = (pattern: string): string => {
        const match = directText.match(new RegExp(pattern, 'i'));
        return match ? match[1].replace(/,/g, '') : '0';
      };

      insights.predictions.likes = extractPrediction('Expected Likes:\\s*([\\d,]+)');
      insights.predictions.shares = extractPrediction('Expected Shares:\\s*([\\d,]+)');
      insights.predictions.comments = extractPrediction('Expected Comments:\\s*([\\d,]+)');
      insights.predictions.views = extractPrediction('Expected Views:\\s*([\\d,]+)');
    }

    // Extract explanation
    const explanationMatch = response.match(/Explanation:\s*([^]*?)(?=Suggestions:|$)/i);
    if (explanationMatch) {
      insights.analysis = explanationMatch[1].trim();
    }

    // Extract recommendations
    const suggestionsMatch = response.match(/Suggestions:\s*([^]*?)$/i);
    if (suggestionsMatch) {
      const suggestionsText = suggestionsMatch[1];

      // Extract timing with exact pattern
      const timingMatch = suggestionsText.match(/Optimal Posting Time:\s*([^]*?)(?=-|$)/i);
      insights.recommendations.timing = timingMatch ? timingMatch[1].trim() : '';

      // Extract hashtags
      insights.recommendations.hashtags = Array.from(
        suggestionsText.matchAll(/#[\w\d]+/g),
        match => match[0]
      );

      // Extract content tips
      const contentMatch = suggestionsText.match(/Content Quality:\s*([^]*?)(?=-|$)/i);
      insights.recommendations.contentTips = contentMatch ? contentMatch[1].trim() : '';

      // Extract audience info
      const audienceMatch = suggestionsText.match(/Target Audience:\s*([^]*?)(?=-|$)/i);
      insights.recommendations.audience = audienceMatch ? audienceMatch[1].trim() : '';
    }

  } catch (error) {
    console.error('Error parsing insights:', error);
  }

  return insights;
} 