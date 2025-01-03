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
    // Extract metrics with more precise patterns
    const metricsMatch = response.match(/Metrics:([^]*?)(?=Direct Answer:|$)/i);
    if (metricsMatch) {
      const metricsText = metricsMatch[1];
      
      // Extract engagement rate with exact pattern
      const engagementMatch = metricsText.match(/Engagement Rate:\s*([\d.]+)%/i);
      insights.metrics.engagement = engagementMatch ? `${engagementMatch[1]}%` : '0%';

      // Extract numeric values with exact patterns
      const likesMatch = metricsText.match(/Likes:\s*(\d+)/i);
      insights.metrics.likes = likesMatch ? likesMatch[1] : '0';

      const sharesMatch = metricsText.match(/Shares:\s*(\d+)/i);
      insights.metrics.shares = sharesMatch ? sharesMatch[1] : '0';

      const commentsMatch = metricsText.match(/Comments:\s*(\d+)/i);
      insights.metrics.comments = commentsMatch ? commentsMatch[1] : '0';

      const viewsMatch = metricsText.match(/Views:\s*(\d+)/i);
      insights.metrics.views = viewsMatch ? viewsMatch[1] : '0';

      // Extract age groups with exact pattern
      const ageGroupMatch = metricsText.match(/Primary Age Group:\s*([\d-]+)/i);
      insights.metrics.ageGroups = ageGroupMatch ? [ageGroupMatch[1]] : [];
    }

    // Extract predictions with exact patterns
    const directMatch = response.match(/Direct Answer:([^]*?)(?=Explanation:|$)/i);
    if (directMatch) {
      const directText = directMatch[1];
      
      // Look for exact number patterns
      const expectedLikes = directText.match(/Expected Likes:\s*Around\s*(\d+)/i);
      insights.predictions.likes = expectedLikes ? expectedLikes[1] : '0';

      const expectedShares = directText.match(/Expected Shares:\s*(?:Around|Approximately)\s*(\d+)/i);
      insights.predictions.shares = expectedShares ? expectedShares[1] : '0';

      const expectedComments = directText.match(/Expected Comments:\s*Around\s*(\d+)/i);
      insights.predictions.comments = expectedComments ? expectedComments[1] : '0';

      const expectedViews = directText.match(/Expected Views:\s*(?:Around|Approximately)\s*(\d+)/i);
      insights.predictions.views = expectedViews ? expectedViews[1] : '0';
    }

    // Extract analysis with improved pattern
    const explanationMatch = response.match(/Explanation:([^]*?)(?=Suggestions:|$)/i);
    if (explanationMatch) {
      insights.analysis = explanationMatch[1].trim();
    }

    // Extract recommendations with improved patterns
    const suggestionsMatch = response.match(/Suggestions:([^]*?)$/i);
    if (suggestionsMatch) {
      const suggestionsText = suggestionsMatch[1];
      
      // Extract timing with better pattern
      const timingMatch = suggestionsText.match(/(?:Optimal|Best)[^:]*Time[^:]*:([^-\n]*)/i);
      insights.recommendations.timing = timingMatch ? timingMatch[1].trim() : '';

      // Extract hashtags - look for words starting with #
      insights.recommendations.hashtags = Array.from(
        suggestionsText.matchAll(/#[\w\d]+/g),
        match => match[0]
      );

      // Extract content tips
      const contentMatch = suggestionsText.match(/Content Quality[^:]*:([^-\n]*)/i);
      insights.recommendations.contentTips = contentMatch ? contentMatch[1].trim() : '';

      // Extract audience info
      const audienceMatch = suggestionsText.match(/Target Audience[^:]*:([^-\n]*)/i);
      insights.recommendations.audience = audienceMatch ? audienceMatch[1].trim() : '';
    }
  } catch (error) {
    console.error('Error parsing insights:', error);
  }

  return insights;
} 