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
    // Extract metrics section
    const metricsMatch = response.match(/Metrics:([^]*?)(?=Direct Answer:|$)/i);
    if (metricsMatch) {
      const metricsText = metricsMatch[1];

      // Extract specific metrics with approximate values
      const likesMatch = metricsText.match(/Likes:\s*(?:Approximately|About|Around|Roughly)\s*([\d,]+)/i);
      insights.metrics.likes = likesMatch ? likesMatch[1].replace(/,/g, '') : '0';

      const sharesMatch = metricsText.match(/Shares:\s*(?:Approximately|About|Around|Roughly)\s*([\d,]+)/i);
      insights.metrics.shares = sharesMatch ? sharesMatch[1].replace(/,/g, '') : '0';

      const commentsMatch = metricsText.match(/Comments:\s*(?:Approximately|About|Around|Roughly)\s*([\d,]+)/i);
      insights.metrics.comments = commentsMatch ? commentsMatch[1].replace(/,/g, '') : '0';

      const viewsMatch = metricsText.match(/Views:\s*(?:Approximately|About|Around|Roughly)\s*([\d,]+)/i);
      insights.metrics.views = viewsMatch ? viewsMatch[1].replace(/,/g, '') : '0';

      const engagementMatch = metricsText.match(/Engagement Rate:\s*(?:Approximately|About|Around|Roughly)\s*([\d.]+)%/i);
      insights.metrics.engagement = engagementMatch ? `${engagementMatch[1]}%` : '0%';

      // Extract age groups
      const ageMatch = metricsText.match(/(\d+(?:-\d+)?)\s*year-olds?/i);
      if (ageMatch) {
        insights.metrics.ageGroups = [ageMatch[1]];
      }
    }

    // Extract predictions from Direct Answer section
    const directMatch = response.match(/Direct Answer:([^]*?)(?=Explanation:|$)/i);
    if (directMatch) {
      const directText = directMatch[1];
      
      // Use the same metrics for predictions since they match
      insights.predictions = {
        likes: insights.metrics.likes,
        shares: insights.metrics.shares,
        comments: insights.metrics.comments,
        views: insights.metrics.views
      };
    }

    // Extract explanation
    const explanationMatch = response.match(/Explanation:([^]*?)(?=Suggestions:|$)/i);
    if (explanationMatch) {
      insights.analysis = explanationMatch[1].trim();
    }

    // Extract recommendations
    const suggestionsMatch = response.match(/Suggestions:([^]*?)$/i);
    if (suggestionsMatch) {
      const suggestionsText = suggestionsMatch[1];

      // Extract timing
      const timingMatch = suggestionsText.match(/Optimal Posting Time:([^]*?)(?=Hashtags:|$)/i);
      insights.recommendations.timing = timingMatch ? timingMatch[1].trim() : '';

      // Extract hashtags - look for words starting with #
      insights.recommendations.hashtags = Array.from(
        suggestionsText.matchAll(/#[\w\d]+/g),
        match => match[0]
      );

      // Extract content tips
      const contentMatch = suggestionsText.match(/Content Quality:([^]*?)(?=Target Audience:|$)/i);
      insights.recommendations.contentTips = contentMatch ? contentMatch[1].trim() : '';

      // Extract audience info
      const audienceMatch = suggestionsText.match(/Target Audience:([^]*?)$/i);
      insights.recommendations.audience = audienceMatch ? audienceMatch[1].trim() : '';
    }

  } catch (error) {
    console.error('Error parsing insights:', error);
  }

  return insights;
} 