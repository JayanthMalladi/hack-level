import { useState, useEffect, useMemo } from 'react';
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
import { TrendingUp, Users, Eye, Share2, MessageCircle, ThumbsUp } from 'lucide-react';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { motion } from 'framer-motion';

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

export default function Dashboard() {
  const [data, setData] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            const processedData = results.data.map(row => ({
              ...row,
              likes: Number(row.likes) || 0,
              comments: Number(row.comments) || 0,
              shares: Number(row.shares) || 0,
              views: Number(row.views) || 0,
              engagement_rate: Number(row.engagement_rate) || 0
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
  } = useMemo(() => {
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
    const postTypes = [...new Set(data.map(post => post.post_type))];
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
            data.filter(post => post.post_type === type).length
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
              .filter(post => post.post_type === type)
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
          weight: 'bold'
        }
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart'
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
      ...chartOptions.plugins,
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: 'bold' }
        }
      },
      datalabels: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return ` ${value.toFixed(1)}%`;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    },
    layout: { padding: 20 },
    radius: '90%',
    offset: 20,
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const LoadingAnimation = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 pt-24 max-w-6xl mx-auto"
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        <p className="text-xl text-gray-600">Loading dashboard data...</p>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return <LoadingAnimation />;
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
    <div className="p-6 pt-24 max-w-7xl mx-auto bg-gray-50 min-h-screen overflow-auto">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="space-y-8"
      >
        <motion.div 
          variants={fadeInUp}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Social Media Analytics Dashboard
          </h1>
          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </motion.div>
        
        <motion.div 
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${cardStyle} bg-white p-6 rounded-xl shadow transition-all duration-300`}
          >
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
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${cardStyle} bg-white p-6 rounded-xl shadow transition-all duration-300`}
          >
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
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${cardStyle} bg-white p-6 rounded-xl shadow transition-all duration-300`}
          >
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
          </motion.div>
        </motion.div>

        <motion.div 
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${cardStyle} bg-white p-6 rounded-xl shadow transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Total Shares</h2>
                <p className="text-3xl font-bold text-indigo-600">{totalShares.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <Share2 className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${cardStyle} bg-white p-6 rounded-xl shadow transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Total Comments</h2>
                <p className="text-3xl font-bold text-orange-600">{totalComments.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <MessageCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${cardStyle} bg-white p-6 rounded-xl shadow transition-all duration-300`}
          >
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
          </motion.div>
        </motion.div>

        <motion.div 
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            className={`${cardStyle} bg-white p-6 rounded-xl shadow`}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Content Performance</h2>
            <Bar data={postTypeData} options={barChartOptions} />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className={`${cardStyle} bg-white p-6 rounded-xl shadow`}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Engagement Distribution</h2>
            <Pie 
              data={{
                labels: engagementByType.labels,
                datasets: [{
                  data: engagementByType.datasets[0].data,
                  backgroundColor: chartColors.primary,
                  borderColor: chartColors.borders,
                  borderWidth: 3,
                  hoverOffset: 30,
                  hoverBorderWidth: 4,
                  offset: 10,
                  spacing: 5,
                }]
              }}
              options={pieChartOptions}
            />
          </motion.div>
        </motion.div>

        <motion.div 
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            className={`${cardStyle} bg-white p-6 rounded-xl shadow`}
          >
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
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className={`${cardStyle} bg-white p-6 rounded-xl shadow`}
          >
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
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
} 