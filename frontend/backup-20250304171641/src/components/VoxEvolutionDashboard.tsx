import React, { useEffect, useState } from 'react';
import { useVox } from '@/contexts/VoxContext';
import { motion } from 'framer-motion';
import { Brain, Zap, Award, Lightbulb, BarChart3 } from 'lucide-react';

const VoxEvolutionDashboard: React.FC = () => {
  const { evolution, commandHistory } = useVox();
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!evolution) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg shadow-sm">
        <div className="text-gray-400">Loading evolution data...</div>
      </div>
    );
  }

  // Calculate level progress
  const levelProgress = Math.min(
    (evolution.learningPoints % 100) / 100,
    1
  );

  // Calculate next level
  const nextLevel = evolution.intelligenceLevel + 1;

  // Calculate points needed for next level
  const pointsNeeded = 100 - (evolution.learningPoints % 100);

  // Get top skills
  const topSkills = Object.entries(evolution.skills || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-md p-6 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-indigo-800">Vox Evolution Dashboard</h2>
        <div className="flex items-center bg-indigo-100 px-3 py-1 rounded-full">
          <Brain className="w-5 h-5 text-indigo-600 mr-2" />
          <span className="text-indigo-800 font-semibold">Level {evolution.intelligenceLevel}</span>
        </div>
      </div>

      {/* Intelligence Level Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Intelligence Progress</span>
          <span className="text-sm font-medium text-indigo-600">
            {Math.floor(evolution.learningPoints % 100)}/100 XP
          </span>
        </div>
        <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          {pointsNeeded} points until Level {nextLevel}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(evolution.stats).map(([stat, value], index) => (
          <motion.div
            key={stat}
            className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
          >
            <div className="text-xs font-medium text-gray-500 mb-1 capitalize">{stat}</div>
            <div className="relative w-16 h-16 mb-1">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E6E6E6"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={
                    stat === 'accuracy' ? '#3B82F6' :
                    stat === 'helpfulness' ? '#10B981' :
                    stat === 'creativity' ? '#F59E0B' :
                    '#8B5CF6'
                  }
                  strokeWidth="3"
                  strokeDasharray={`${value * 100}, 100`}
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${value * 100}, 100` }}
                  transition={{ duration: 1.5, delay: 0.2 }}
                />
                <text
                  x="18"
                  y="20.5"
                  textAnchor="middle"
                  className="text-xs font-semibold"
                  fill="#4B5563"
                >
                  {Math.round(value * 100)}%
                </text>
              </svg>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="flex items-center mb-4">
          <Award className="w-5 h-5 text-purple-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Top Skills</h3>
        </div>
        
        {topSkills.length > 0 ? (
          <div className="space-y-4">
            {topSkills.map(([skill, level], index) => (
              <motion.div
                key={skill}
                className="space-y-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 * index, duration: 0.5 }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium capitalize">{skill}</span>
                  <span className="text-xs font-medium text-purple-600">Lv. {level}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-purple-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((level as number) * 10, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 * index }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            Vox is still developing skills. Keep interacting!
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center mb-4">
          <BarChart3 className="w-5 h-5 text-indigo-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        </div>
        
        {commandHistory.length > 0 ? (
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {commandHistory.slice(0, 5).map((command, index) => (
              <motion.div
                key={command.id}
                className="text-sm border-l-2 border-indigo-200 pl-3 py-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <div className="font-medium text-gray-800 truncate">{command.command}</div>
                <div className="text-xs text-gray-500">
                  {new Date(command.createdAt).toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            No recent activity. Start talking to Vox!
          </div>
        )}
      </div>
    </div>
  );
};

export default VoxEvolutionDashboard;
