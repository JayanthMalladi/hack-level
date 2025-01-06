import { motion } from 'framer-motion';
import { Shield, Target, Award, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const benefits = [
    {
      icon: <Target className="w-8 h-8 text-green-500" />,
      title: "Data-Driven Decisions",
      description: "Make informed decisions based on comprehensive social media analytics and insights."
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: "Real-Time Monitoring",
      description: "Track your social media performance in real-time with instant updates and alerts."
    },
    {
      icon: <Award className="w-8 h-8 text-purple-500" />,
      title: "Performance Optimization",
      description: "Optimize your content strategy using advanced analytics and engagement metrics."
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-yellow-500" />,
      title: "Actionable Insights",
      description: "Convert complex data into actionable insights for better social media strategy."
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            About Our Analytics Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We help businesses transform their social media presence through powerful analytics and data-driven insights.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20"
        >
          <div className="space-y-6">
            <h2 className="text-3xl font-bold gradient-text">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              We're dedicated to empowering businesses with the tools and insights they need to succeed in the digital age. Our platform transforms complex social media data into clear, actionable insights.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-green-500"></div>
                </div>
                <p className="text-gray-600">Real-time analytics and performance tracking</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-blue-500"></div>
                </div>
                <p className="text-gray-600">Comprehensive engagement metrics and insights</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-purple-500"></div>
                </div>
                <p className="text-gray-600">Advanced audience demographics analysis</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-6 gradient-text">Why Choose Us?</h2>
            <div className="space-y-6">
              <p className="text-gray-600 leading-relaxed">
                Our platform provides comprehensive analytics solutions that help you:
              </p>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-center space-x-3">
                  <span className="text-green-500">✓</span>
                  <span>Understand your audience better</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-green-500">✓</span>
                  <span>Optimize your content strategy</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-green-500">✓</span>
                  <span>Improve engagement rates</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-green-500">✓</span>
                  <span>Make data-driven decisions</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="bg-gray-50 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-6 gradient-text">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transform your social media strategy with our powerful analytics platform.
            </p>
            <Link
              to="/dashboard"
              className="inline-block px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full font-semibold hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Try Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 