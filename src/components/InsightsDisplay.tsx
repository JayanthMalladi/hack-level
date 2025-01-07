import { InsightData } from '../utils/insightParser';
import { TrendingUp, Clock, Hash, Target, BookOpen, BarChart2 } from 'lucide-react';

interface InsightsDisplayProps {
  insights: InsightData;
}

export function InsightsDisplay({ insights }: InsightsDisplayProps) {
  return (
    <div className="space-y-6 p-4">
      {/* Metrics Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Performance Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-600">Engagement Rate</div>
            <div className="text-xl font-bold text-green-600">{insights.metrics.engagement}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-600">Avg. Likes</div>
            <div className="text-xl font-bold text-blue-600">{insights.metrics.likes}</div>
          </div>
          {/* Add other metrics similarly */}
        </div>
      </div>

      {insights.formatInsights.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-500" />
            Format Performance
          </h3>
          <ul className="space-y-2">
            {insights.formatInsights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                <span className="text-gray-700">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Predictions Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          Expected Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(insights.predictions).map(([key, value]) => (
            <div key={key} className="p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
              <div className="text-xl font-bold text-purple-600">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          Recommendations
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-indigo-400 mt-1" />
            <div>
              <div className="font-medium text-gray-700">Best Time to Post</div>
              <div className="text-gray-600">{insights.recommendations.timing}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Hash className="w-5 h-5 text-indigo-400 mt-1" />
            <div>
              <div className="font-medium text-gray-700">Recommended Hashtags</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {insights.recommendations.hashtags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Add other recommendations similarly */}
        </div>
      </div>

      {/* Analysis Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Analysis</h3>
        <p className="text-gray-600 leading-relaxed">{insights.analysis}</p>
      </div>
    </div>
  );
} 