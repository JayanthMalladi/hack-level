export interface InsightData {
  metrics: {
    engagement: string;
    likes: string;
    shares: string;
    comments: string;
    views: string;
    ageGroups: string[];
  };
  formatInsights: string[];
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
    formatInsights: [],
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
    // Extract metrics section
    const metricsMatch = response.match(/METRICS:\n([^]*?)(?=\n\nFORMAT_INSIGHTS:)/i);
    if (metricsMatch) {
      const metricsText = metricsMatch[1];
      
      // Extract each metric with exact patterns
      const extractMetric = (pattern: string): string => {
        const match = metricsText.match(new RegExp(pattern, 'i'));
        return match ? match[1].replace(/,/g, '').trim() : '0';
      };

      insights.metrics = {
        engagement: extractMetric('Engagement Rate:\\s*([\\d.]+)%') + '%',
        likes: extractMetric('Average Likes:\\s*([\\d,]+)'),
        shares: extractMetric('Average Shares:\\s*([\\d,]+)'),
        comments: extractMetric('Average Comments:\\s*([\\d,]+)'),
        views: extractMetric('Average Views:\\s*([\\d,]+)'),
        ageGroups: (metricsText.match(/Primary Age Groups:\s*([^\n]+)/i)?.[1] || '')
          .split(',')
          .map(group => group.trim())
          .filter(Boolean)
      };
    }

    // Extract format insights
    const formatMatch = response.match(/FORMAT_INSIGHTS:\n([^]*?)(?=\n\nDIRECT_ANSWER:)/i);
    if (formatMatch) {
      insights.formatInsights = formatMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map(line => line.substring(1).trim());
    }

    // Extract predictions from Direct Answer
    const directMatch = response.match(/DIRECT_ANSWER:\n([^]*?)(?=\n\nEXPLANATION:)/i);
    if (directMatch) {
      const directText = directMatch[1];
      
      const extractPrediction = (pattern: string): string => {
        const match = directText.match(new RegExp(pattern, 'i'));
        return match ? match[1].replace(/,/g, '').trim() : '0';
      };

      insights.predictions = {
        likes: extractPrediction('Expected Likes:\\s*([\\d,]+)'),
        shares: extractPrediction('Expected Shares:\\s*([\\d,]+)'),
        comments: extractPrediction('Expected Comments:\\s*([\\d,]+)'),
        views: extractPrediction('Expected Views:\\s*([\\d,]+)')
      };
    }

    // Extract explanation
    const explanationMatch = response.match(/EXPLANATION:\n([^]*?)(?=\n\nSUGGESTIONS:)/i);
    if (explanationMatch) {
      insights.analysis = explanationMatch[1].trim();
    }

    // Extract recommendations
    const suggestionsMatch = response.match(/SUGGESTIONS:\n([^]*?)$/i);
    if (suggestionsMatch) {
      const suggestionsText = suggestionsMatch[1];

      // Extract timing
      const timingMatch = suggestionsText.match(/TIMING:\n([^]*?)(?=\n\nHASHTAGS:)/i);
      insights.recommendations.timing = timingMatch ? timingMatch[1].trim() : '';

      // Extract hashtags
      const hashtagsMatch = suggestionsText.match(/HASHTAGS:\n([^]*?)(?=\n\nCONTENT:)/i);
      if (hashtagsMatch) {
        insights.recommendations.hashtags = hashtagsMatch[1]
          .match(/#[\w\d]+/g) || [];
      }

      // Extract content tips
      const contentMatch = suggestionsText.match(/CONTENT:\n([^]*?)(?=\n\nAUDIENCE:)/i);
      insights.recommendations.contentTips = contentMatch ? contentMatch[1].trim() : '';

      // Extract audience info
      const audienceMatch = suggestionsText.match(/AUDIENCE:\n([^]*?)$/i);
      insights.recommendations.audience = audienceMatch ? audienceMatch[1].trim() : '';
    }

  } catch (error) {
    console.error('Error parsing insights:', error);
  }

  return insights;
} 