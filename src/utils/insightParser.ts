export interface InsightData {
  metrics: {
    engagement: string;
    likes: string;
    shares: string;
    comments: string;
    views: string;
    ageGroups: string[];
    genderSplit?: string;
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
      ageGroups: [],
      genderSplit: ''
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
    const metricsMatch = response.match(/### Metrics([^]*?)(?=### Format Insights|$)/i);
    if (metricsMatch) {
      const metricsText = metricsMatch[1];

      // Extract metrics using more precise patterns
      const extractMetric = (pattern: string): string => {
        const match = metricsText.match(new RegExp(pattern, 'i'));
        return match ? match[1].replace(/,/g, '').trim() : '0';
      };

      insights.metrics = {
        engagement: extractMetric('Engagement Rate:.*?([\\d.]+)%') + '%',
        likes: extractMetric('Likes:.*?([\\d,]+)'),
        shares: extractMetric('Shares:.*?([\\d,]+)'),
        comments: extractMetric('Comments:.*?([\\d,]+)'),
        views: extractMetric('Views:.*?([\\d,]+)'),
        ageGroups: [],
        genderSplit: metricsText.match(/Gender Split:.*?([^\n]+)/i)?.[1]?.trim() || ''
      };

      // Extract age groups
      const ageGroupMatch = metricsText.match(/Primary Age Group:.*?([^\n]+)/i);
      if (ageGroupMatch) {
        insights.metrics.ageGroups = ageGroupMatch[1]
          .split(/,|\band\b/)
          .map(group => group.trim())
          .filter(Boolean);
      }
    }

    // Extract format insights
    const formatMatch = response.match(/### Format Insights([^]*?)(?=### Predictions|$)/i);
    if (formatMatch) {
      insights.formatInsights = formatMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map(line => line.substring(1).trim());
    }

    // Extract predictions
    const predictionsMatch = response.match(/### Predictions([^]*?)(?=### Explanation|$)/i);
    if (predictionsMatch) {
      const predictionsText = predictionsMatch[1];
      
      const extractPrediction = (pattern: string): string => {
        const match = predictionsText.match(new RegExp(pattern, 'i'));
        return match ? match[1].replace(/,/g, '').trim() : '0';
      };

      insights.predictions = {
        likes: extractPrediction('Expected Likes:.*?([\\d,]+)'),
        shares: extractPrediction('Expected Shares:.*?([\\d,]+)'),
        comments: extractPrediction('Expected Comments:.*?([\\d,]+)'),
        views: extractPrediction('Expected Views:.*?([\\d,]+)')
      };
    }

    // Extract explanation
    const explanationMatch = response.match(/### Explanation([^]*?)(?=### Suggestions|$)/i);
    if (explanationMatch) {
      insights.analysis = explanationMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map(line => line.substring(1).trim())
        .join(' ');
    }

    // Extract suggestions
    const suggestionsMatch = response.match(/### Suggestions([^]*?)$/i);
    if (suggestionsMatch) {
      const suggestionsText = suggestionsMatch[1];

      // Extract timing
      const timingMatch = suggestionsText.match(/Optimal Posting Time:.*?([^\n]+)/i);
      insights.recommendations.timing = timingMatch ? timingMatch[1].trim() : '';

      // Extract hashtags
      const hashtagsMatch = suggestionsText.match(/Hashtags:.*?([^\n]+)/i);
      if (hashtagsMatch) {
        insights.recommendations.hashtags = hashtagsMatch[1]
          .match(/#[\w\d]+/g) || [];
      }

      // Extract content tips
      const contentMatch = suggestionsText.match(/Content Quality:.*?([^\n]+)/i);
      insights.recommendations.contentTips = contentMatch ? contentMatch[1].trim() : '';

      // Extract audience info
      const audienceMatch = suggestionsText.match(/Target Audience:.*?([^\n]+)/i);
      insights.recommendations.audience = audienceMatch ? audienceMatch[1].trim() : '';
    }

  } catch (error) {
    console.error('Error parsing insights:', error);
  }

  return insights;
} 