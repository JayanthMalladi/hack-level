import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnalyticsIllustration from './illustrations/AnalyticsIllustration';
import { BarChart2, TrendingUp, Users, Zap } from 'lucide-react';

export default function Hero() {
  const textAnimation = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.04 * i },
    }),
  };

  const letterAnimation = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const title = "Elevate Your Social Media Analytics";
  const titleArray = Array.from(title);

  const features = [
    {
      icon: <BarChart2 className="w-6 h-6 text-green-500" />,
      title: "Real-time Analytics",
      description: "Track your social media performance with live data visualization"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
      title: "Engagement Metrics",
      description: "Monitor likes, shares, and comments across all platforms"
    },
    {
      icon: <Users className="w-6 h-6 text-purple-500" />,
      title: "Audience Insights",
      description: "Understand your audience demographics and behavior"
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: "Performance Tracking",
      description: "Measure content performance and engagement rates"
    }
  ];

  return (
    <div className="relative min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-8 gradient-text flex justify-center flex-wrap"
            variants={textAnimation}
            initial="hidden"
            animate="visible"
          >
            {titleArray.map((letter, index) => (
              <motion.span
                key={index}
                variants={letterAnimation}
                className={letter === " " ? "mr-4" : ""}
              >
                {letter}
              </motion.span>
            ))}
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto"
          >
            Transform your social media data into actionable insights with our powerful analytics dashboard.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex justify-center gap-4 mb-16"
          >
            <Link
              to="/dashboard"
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full font-semibold hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="px-8 py-3 bg-white text-gray-800 rounded-full font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Learn More
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="max-w-3xl mx-auto mb-20"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl transform rotate-1"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-4">
              <div className="w-3/4 mx-auto">
                <AnalyticsIllustration />
              </div>
            </div>
          </div>
        </motion.div>

        <section id="features" className="py-20">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-center mb-12 gradient-text"
          >
            Powerful Features for Better Insights
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-gray-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-12 text-center"
          >
            <h2 className="text-3xl font-bold mb-6 gradient-text">Ready to Transform Your Analytics?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Start making data-driven decisions today with our comprehensive analytics dashboard.
            </p>
            <Link
              to="/dashboard"
              className="inline-block px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full font-semibold hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started Now
            </Link>
          </motion.div>
        </section>
      </div>

      {/* Animated background elements */}
      <div className="absolute top-40 left-0 neon-circle opacity-20"></div>
      <div className="absolute bottom-40 right-0 neon-circle opacity-20"></div>
    </div>
  );
}