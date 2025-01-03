import { useState, useEffect, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import type { PostData } from '../types/PostData';
import { TrendingUp, Users, Eye, Share2, MessageCircle, ThumbsUp, Sparkles, X, Send } from 'lucide-react';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import AIChatbot from './AIChatbot';
import { sendChatMessage } from '../utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

// Add interface for parsed row
interface ParsedRow {
  likes: string;
  comments: string;
  shares: string;
  views: string;
  engagement_rate: string;
  post_type: string;
  post_day: string;
  primary_age_group: string;
  [key: string]: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

// Add this type definition at the top with other interfaces
type ValidPostType = 'story' | 'video' | 'photo' | 'carousel' | 'reel';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Dashboard() {
  const [data, setData] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Define chartColors here, before useMemo
  const chartColors = {
    primary: [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)'
    ],
    borders: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)'
    ]
  };

  useEffect(() => {
    setIsLoading(true);
    fetch('/social_media_simulated_data.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch CSV file');
        }
        return response.text();
      })
      .then(csvString => {
        Papa.parse(csvString, {
          header: true,
          dynamicTyping: true,
          transform: (value, field) => {
            // Convert numeric fields to numbers
            if (['likes', 'comments', 'shares', 'views', 'engagement_rate'].includes(field)) {
              return Number(value) || 0;
            }
            return value;
          },
          complete: (results) => {
            if (results.errors.length > 0) {
              console.error('CSV parsing errors:', results.errors);
            }
            
            // Process the data to ensure numeric values
            const processedData = results.data.map((row: unknown) => ({
              ...row as ParsedRow,
              likes: Number((row as ParsedRow).likes) || 0,
              comments: Number((row as ParsedRow).comments) || 0,
              shares: Number((row as ParsedRow).shares) || 0,
              views: Number((row as ParsedRow).views) || 0,
              engagement_rate: Number((row as ParsedRow).engagement_rate) || 0
            }));

            console.log('First row of processed data:', processedData[0]);
            setData(processedData as PostData[]);
            setIsLoading(false);
          },
          error: (error) => {
            console.error('Papa Parse error:', error);
            setError(error.message);
            setIsLoading(false);
          }
        });
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setError(error.message);
        setIsLoading(false);
      });
  }, []);

  const {
    totalEngagement,
    avgEngagement,
    totalLikes,
    totalViews,
    totalShares,
    totalComments,
    postTypeData,
    engagementByType,
    engagementByDay,
    ageGroupDistribution
  } = useMemo<{
    totalEngagement: number;
    avgEngagement: number;
    totalLikes: number;
    totalViews: number;
    totalShares: number;
    totalComments: number;
    postTypeData: ChartData;
    engagementByType: ChartData;
    engagementByDay: ChartData;
    ageGroupDistribution: ChartData;
  }>(() => {
    if (data.length === 0) return {
      totalEngagement: 0,
      avgEngagement: 0,
      totalLikes: 0,
      totalViews: 0,
      totalShares: 0,
      totalComments: 0,
      postTypeData: { labels: [], datasets: [{ label: '', data: [], backgroundColor: [] }] },
      engagementByType: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
      engagementByDay: { labels: [], datasets: [{ label: '', data: [], backgroundColor: '' }] },
      ageGroupDistribution: { labels: [], datasets: [{ label: '', data: [], backgroundColor: '' }] }
    };

    const totalEng = data.reduce((sum, post) => sum + Number(post.engagement_rate || 0), 0);
    const avgEng = data.length > 0 ? totalEng / data.length : 0;
    const likes = data.reduce((sum, post) => sum + Number(post.likes || 0), 0);
    const views = data.reduce((sum, post) => sum + Number(post.views || 0), 0);
    const shares = data.reduce((sum, post) => sum + Number(post.shares || 0), 0);
    const comments = data.reduce((sum, post) => sum + Number(post.comments || 0), 0);

    // Get unique post types and days
    const postTypes = ['story', 'video', 'photo', 'carousel', 'reel'] as ValidPostType[];
    const days = [...new Set(data.map(post => post.post_day))];

    return {
      totalEngagement: totalEng,
      avgEngagement: avgEng,
      totalLikes: likes,
      totalViews: views,
      totalShares: shares,
      totalComments: comments,
      postTypeData: {
        labels: postTypes,
        datasets: [{
          label: 'Posts by Type',
          data: postTypes.map(type => 
            data.filter(post => 
              post.post_type?.toLowerCase() === type
            ).length
          ),
          backgroundColor: chartColors.primary,
          borderColor: chartColors.borders,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          hoverOffset: 4
        }]
      },
      engagementByType: {
        labels: postTypes,
        datasets: [{
          data: postTypes.map(type =>
            data
              .filter(post => post.post_type?.toLowerCase() === type)
              .reduce((sum, post) => sum + (post.engagement_rate as number), 0)
          ),
          backgroundColor: chartColors.primary,
          borderColor: chartColors.borders,
          borderWidth: 2,
          hoverOffset: 15,
          offset: 10
        }]
      },
      engagementByDay: {
        labels: days,
        datasets: [{
          label: 'Engagement by Day',
          data: days.map(day =>
            data
              .filter(post => post.post_day === day)
              .reduce((sum, post) => sum + (post.engagement_rate as number), 0)
          ),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }]
      },
      ageGroupDistribution: {
        labels: [...new Set(data.map(post => post.primary_age_group))],
        datasets: [{
          label: 'Posts by Age Group',
          data: [...new Set(data.map(post => post.primary_age_group))].map(
            age => data.filter(post => post.primary_age_group === age).length
          ),
          backgroundColor: chartColors.primary,
          borderColor: chartColors.borders,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      }
    };
  }, [data]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Social Media Analytics',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutCubic' as const
    }
  };

  // Add hover animation styles
  const cardStyle = "transform transition-all duration-300 hover:scale-105 hover:shadow-lg";

  // Add these chart-specific options
  const lineChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        ...chartOptions.plugins.title,
        text: 'Daily Performance Trends'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
    }
  };

  const barChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      datalabels: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const pieChartOptions = {
    ...chartOptions,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { 
            size: 13,
            weight: 'medium'
          },
          color: '#4B5563'
        }
      },
      datalabels: {
        color: (context: any) => {
          const value = context.dataset.backgroundColor[context.dataIndex];
          const rgb = value.match(/\d+/g);
          const brightness = Math.round(((parseInt(rgb[0]) * 299) +
                                      (parseInt(rgb[1]) * 587) +
                                      (parseInt(rgb[2]) * 114)) / 1000);
          return brightness > 140 ? '#1F2937' : '#FFFFFF';
        },
        font: {
          weight: 'bold',
          size: 14
        },
        formatter: (value: number, ctx: any) => {
          const sum = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = (value * 100 / sum).toFixed(0) + '%';
          return percentage;
        },
        display: true
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}%`;
          }
        }
      }
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
      }
    },
    cutout: '0%',
    radius: '85%'
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetInsights = async () => {
    setIsModalOpen(true);
    if (messages.length === 0) {
      setIsLoading(true);
      try {
        const chatRequest: ChatRequest = {
          dashboardData: data,
          userMessage: "Provide a comprehensive analysis of the social media performance data shown in the dashboard.",
          chatHistory: []
        };
        
        const result = await sendChatMessage(chatRequest);
        setMessages([{ role: 'assistant', content: result.result }]);
      } catch (error) {
        console.error('Error getting AI insights:', error);
        setMessages([{ 
          role: 'assistant', 
          content: 'Sorry, I encountered an error while analyzing the data. Please try again.' 
        }]);
      }
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user' as const, content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.langflow.astra.datastax.com/lf/396deb1c-aadd-4f18-bd9e-a350c13098df/api/v1/run/bca2b923-d854-4755-86a8-0b51c350c42b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer AstraCS:YKRGKfIXjCsXShKGmPoWZLoQ:3c2bcc8d06a34fd2fe32d8a084a9e5dee0e63617c1eab8d0f7f6243e15f5c68f'
        },
        body: JSON.stringify({
          input_value: inputMessage,
          output_type: "chat",
          input_type: "chat"
        })
      });
      
      const result = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: result.result }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="p-6 pt-24 max-w-6xl mx-auto">
        <div className="text-center">
          <p className="text-xl">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 pt-24 max-w-6xl mx-auto">
        <div className="text-center text-red-600">
          <p className="text-xl">Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-24 max-w-7xl mx-auto bg-gray-50">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Social Media Analytics Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleGetInsights}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-5 h-5" />
            Get Insights with AI!
          </button>
          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${cardStyle} bg-white p-6 rounded-xl shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">Total Engagement</h2>
              <p className="text-3xl font-bold text-green-600">{totalEngagement.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {`${avgEngagement.toFixed(1)}% avg. engagement rate`}
          </p>
        </div>

        <div className={`${cardStyle} bg-white p-6 rounded-xl shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">Total Views</h2>
              <p className="text-3xl font-bold text-blue-600">{totalViews.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {`${(totalViews / data.length).toFixed(0)} avg. views per post`}
          </p>
        </div>

        <div className={`${cardStyle} bg-white p-6 rounded-xl shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">Total Likes</h2>
              <p className="text-3xl font-bold text-purple-600">{totalLikes.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <ThumbsUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {`${(totalLikes / data.length).toFixed(0)} avg. likes per post`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${cardStyle} bg-white p-6 rounded-xl shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">Total Shares</h2>
              <p className="text-3xl font-bold text-indigo-600">{totalShares.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <Share2 className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className={`${cardStyle} bg-white p-6 rounded-xl shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">Total Comments</h2>
              <p className="text-3xl font-bold text-orange-600">{totalComments.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <MessageCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className={`${cardStyle} bg-white p-6 rounded-xl shadow`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">Audience Reach</h2>
              <p className="text-3xl font-bold text-teal-600">
                {(totalViews + totalEngagement).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-teal-100 rounded-full">
              <Users className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className={`${cardStyle} bg-white p-6 rounded-xl shadow`}>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Content Performance</h2>
          <Bar 
            data={postTypeData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Posts by Type'
                }
              }
            }} 
          />
        </div>
        <div className={`${cardStyle} bg-white p-6 rounded-xl shadow`}>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Engagement Distribution</h2>
          <Pie 
            data={{
              labels: engagementByType.labels,
              datasets: [{
                data: engagementByType.datasets[0].data,
                backgroundColor: [
                  'rgba(59, 130, 246, 0.9)',
                  'rgba(16, 185, 129, 0.9)',
                  'rgba(245, 158, 11, 0.9)',
                  'rgba(239, 68, 68, 0.9)',
                  'rgba(139, 92, 246, 0.9)',
                  'rgba(14, 165, 233, 0.9)'
                ],
                borderColor: 'white',
                borderWidth: 2,
                hoverOffset: 15,
                hoverBorderWidth: 0
              }]
            }}
            options={pieChartOptions}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`${cardStyle} bg-white p-6 rounded-xl shadow`}>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Daily Performance</h2>
          <Line 
            data={{
              labels: engagementByDay.labels,
              datasets: [{
                label: 'Engagement',
                data: engagementByDay.datasets[0].data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointHoverBorderWidth: 2
              }]
            }}
            options={{
              ...lineChartOptions,
              plugins: {
                ...lineChartOptions.plugins,
                datalabels: {
                  display: false
                }
              }
            }}
          />
        </div>
        <div className={`${cardStyle} bg-white p-6 rounded-xl shadow`}>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Audience Demographics</h2>
          <Bar 
            data={{
              labels: ageGroupDistribution.labels,
              datasets: [{
                label: 'Posts by Age Group',
                data: ageGroupDistribution.datasets[0].data,
                backgroundColor: chartColors.primary,
                borderColor: chartColors.borders,
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
                hoverBackgroundColor: chartColors.primary.map(color => color.replace('0.8', '1')),
                hoverBorderWidth: 3,
              }]
            }}
            options={barChartOptions}
          />
        </div>
      </div>

      <AIChatbot 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        dashboardData={data}
      />
    </div>
  );
} 