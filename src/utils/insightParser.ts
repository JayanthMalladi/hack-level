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
    const metricsMatch = response.match(/Metrics:\s*([^]*?)(?=Format Insights:|$)/i);
    if (metricsMatch) {
      const metricsText = metricsMatch[1];

      // Extract metrics with flexible patterns
      const extractMetric = (pattern: string): string => {
        const match = metricsText.match(new RegExp(pattern, 'i'));
        return match ? match[1].replace(/,/g, '') : '0';
      };

      insights.metrics.engagement = extractMetric('engagement rate[^\\d]*(\\d+(?:\\.\\d+)?)%') + '%';
      insights.metrics.likes = extractMetric('(?:average )?likes[^\\d]*(\\d[\\d,]*)');
      insights.metrics.shares = extractMetric('(?:average )?shares[^\\d]*(\\d[\\d,]*)');
      insights.metrics.comments = extractMetric('(?:average )?comments[^\\d]*(\\d[\\d,]*)');
      insights.metrics.views = extractMetric('(?:average )?views[^\\d]*(\\d[\\d,]*)');

      // Extract age groups
      const ageGroupsMatch = metricsText.match(/(?:age groups?|demographics?)[^:]*?(\d+(?:-\d+)?)/gi);
      if (ageGroupsMatch) {
        insights.metrics.ageGroups = ageGroupsMatch.map(match => {
          const numbers = match.match(/\d+(?:-\d+)?/);
          return numbers ? numbers[0] : '';
        }).filter(Boolean);
      }
    }

    // Extract format insights
    const formatMatch = response.match(/Format Insights:\s*([^]*?)(?=Direct Answer:|$)/i);
    if (formatMatch) {
      insights.formatInsights = formatMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-') || line.startsWith('•'))
        .map(line => line.replace(/^[•-]\s*/, '').trim());
    }

    // Extract predictions
    const directMatch = response.match(/Direct Answer:\s*([^]*?)(?=Explanation:|$)/i);
    if (directMatch) {
      const directText = directMatch[1];

      const extractPrediction = (pattern: string): string => {
        const match = directText.match(new RegExp(pattern, 'i'));
        return match ? match[1].replace(/,/g, '').replace(/around|about|approximately/i, '').trim() : '0';
      };

      insights.predictions.likes = extractPrediction('Expected Likes:[^\\d]*(\\d[\\d,]*)');
      insights.predictions.shares = extractPrediction('Expected Shares:[^\\d]*(\\d[\\d,]*)');
      insights.predictions.comments = extractPrediction('Expected Comments:[^\\d]*(\\d[\\d,]*)');
      insights.predictions.views = extractPrediction('Expected Views:[^\\d]*(\\d[\\d,]*)');
    }

    // Extract explanation
    const explanationMatch = response.match(/Explanation:\s*([^]*?)(?=Suggestion:|$)/i);
    if (explanationMatch) {
      insights.analysis = explanationMatch[1].trim();
    }

    // Extract recommendations
    const suggestionsMatch = response.match(/Suggestion:\s*([^]*?)$/i);
    if (suggestionsMatch) {
      const suggestionsText = suggestionsMatch[1];

      // Extract timing
      const timingMatch = suggestionsText.match(/Optimal Posting Time:\s*([^]*?)(?=Hashtags:|$)/i);
      insights.recommendations.timing = timingMatch ? timingMatch[1].trim() : '';

      // Extract hashtags
      const hashtagsMatch = suggestionsText.match(/Hashtags:\s*([^]*?)(?=Content Quality:|$)/i);
      if (hashtagsMatch) {
        insights.recommendations.hashtags = hashtagsMatch[1]
          .match(/#[\w\d]+/g) || [];
      }

      // Extract content tips
      const contentMatch = suggestionsText.match(/Content Quality:\s*([^]*?)(?=Target Audience:|$)/i);
      insights.recommendations.contentTips = contentMatch ? contentMatch[1].trim() : '';

      // Extract audience info
      const audienceMatch = suggestionsText.match(/Target Audience:\s*([^]*?)(?=\n|$)/i);
      insights.recommendations.audience = audienceMatch ? audienceMatch[1].trim() : '';
    }

  } catch (error) {
    console.error('Error parsing insights:', error);
  }

  return insights;
} 