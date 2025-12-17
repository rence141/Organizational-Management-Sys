import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, DollarSign, Activity, Calendar, Download, Filter, Eye, Target, Zap, Globe } from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("overview");

  const timeRanges = [
    { id: "24h", name: "Last 24 Hours" },
    { id: "7d", name: "Last 7 Days" },
    { id: "30d", name: "Last 30 Days" },
    { id: "90d", name: "Last 90 Days" },
  ];

  const metrics = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "users", name: "User Analytics", icon: Users },
    { id: "revenue", name: "Revenue", icon: DollarSign },
    { id: "performance", name: "Performance", icon: Zap },
  ];

  const mockData = {
    overview: {
      totalUsers: 12543,
      activeUsers: 8932,
      totalRevenue: "$124,563",
      growthRate: "+23.5%",
      conversionRate: "3.2%",
      avgSessionTime: "4m 32s",
    },
    users: {
      newUsers: 342,
      returningUsers: 892,
      userSatisfaction: "4.8/5",
      topCountries: ["United States", "United Kingdom", "Canada", "Germany", "Australia"],
      userGrowth: [12, 19, 15, 25, 22, 30, 28],
    },
    revenue: {
      monthlyRevenue: "$45,231",
      yearlyRevenue: "$542,772",
      avgOrderValue: "$127.50",
      revenueByPlan: {
        Basic: "$12,500",
        Pro: "$23,800",
        Enterprise: "$8,931",
      },
      revenueGrowth: [15, 22, 18, 28, 25, 32, 30],
    },
    performance: {
      uptime: "99.9%",
      avgResponseTime: "145ms",
      errorRate: "0.12%",
      serverLoad: "45%",
      apiCalls: "1.2M",
    },
  };

  const currentData = mockData[selectedMetric] || mockData.overview;

  const MetricCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${
            trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</h3>
        <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">{title}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-2 dark:text-slate-500">{subtitle}</p>}
      </div>
    </motion.div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={currentData.totalUsers}
          icon={Users}
          color="bg-indigo-500"
          trend="+12.5%"
          subtitle="All time"
        />
        <MetricCard
          title="Active Users"
          value={currentData.activeUsers}
          icon={Activity}
          color="bg-green-500"
          trend="+8.2%"
          subtitle="Last 30 days"
        />
        <MetricCard
          title="Total Revenue"
          value={currentData.totalRevenue}
          icon={DollarSign}
          color="bg-purple-500"
          trend="+23.5%"
          subtitle="This month"
        />
        <MetricCard
          title="Growth Rate"
          value={currentData.growthRate}
          icon={TrendingUp}
          color="bg-orange-500"
          subtitle="Month over month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 dark:text-slate-100">User Activity</h3>
          <div className="space-y-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="flex items-center gap-4">
                <span className="text-sm text-slate-600 w-8 dark:text-slate-400">{day}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden dark:bg-slate-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.random() * 80 + 20}%` }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full bg-indigo-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 dark:text-slate-100">Key Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg dark:bg-slate-700/50">
              <span className="text-sm text-slate-600 dark:text-slate-400">Conversion Rate</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{currentData.conversionRate}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg dark:bg-slate-700/50">
              <span className="text-sm text-slate-600 dark:text-slate-400">Avg Session Time</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{currentData.avgSessionTime}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg dark:bg-slate-700/50">
              <span className="text-sm text-slate-600 dark:text-slate-400">Bounce Rate</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">32.4%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="New Users"
          value={currentData.newUsers}
          icon={Users}
          color="bg-blue-500"
          subtitle="This week"
        />
        <MetricCard
          title="Returning Users"
          value={currentData.returningUsers}
          icon={Activity}
          color="bg-green-500"
          subtitle="This week"
        />
        <MetricCard
          title="User Satisfaction"
          value={currentData.userSatisfaction}
          icon={Target}
          color="bg-purple-500"
          subtitle="Average rating"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 dark:text-slate-100">User Growth Trend</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {currentData.userGrowth.map((value, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${value * 3}px` }}
              transition={{ delay: index * 0.1 }}
              className="flex-1 bg-indigo-500 rounded-t-lg"
              title={`Day ${index + 1}: ${value} users`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 dark:text-slate-100">Top Countries</h3>
        <div className="space-y-3">
          {currentData.topCountries.map((country, index) => (
            <div key={country} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{country}</span>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {Math.floor(Math.random() * 5000 + 1000)} users
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Monthly Revenue"
          value={currentData.monthlyRevenue}
          icon={DollarSign}
          color="bg-green-500"
          trend="+15.3%"
        />
        <MetricCard
          title="Yearly Revenue"
          value={currentData.yearlyRevenue}
          icon={TrendingUp}
          color="bg-purple-500"
          trend="+28.7%"
        />
        <MetricCard
          title="Avg Order Value"
          value={currentData.avgOrderValue}
          icon={Target}
          color="bg-orange-500"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 dark:text-slate-100">Revenue by Plan</h3>
        <div className="space-y-4">
          {Object.entries(currentData.revenueByPlan).map(([plan, revenue]) => (
            <div key={plan} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg dark:bg-slate-700/50">
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{plan}</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{revenue}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 dark:text-slate-100">Revenue Growth</h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {currentData.revenueGrowth.map((value, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${value * 2}px` }}
              transition={{ delay: index * 0.1 }}
              className="flex-1 bg-green-500 rounded-t-lg"
              title={`Day ${index + 1}: $${value}k`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Uptime"
          value={currentData.uptime}
          icon={Activity}
          color="bg-green-500"
        />
        <MetricCard
          title="Avg Response Time"
          value={currentData.avgResponseTime}
          icon={Zap}
          color="bg-blue-500"
        />
        <MetricCard
          title="Error Rate"
          value={currentData.errorRate}
          icon={Eye}
          color="bg-red-500"
        />
        <MetricCard
          title="API Calls"
          value={currentData.apiCalls}
          icon={BarChart3}
          color="bg-purple-500"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 dark:text-slate-100">Server Performance</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600 dark:text-slate-400">Server Load</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{currentData.serverLoad}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden dark:bg-slate-700">
              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${currentData.serverLoad}` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600 dark:text-slate-400">Memory Usage</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">67%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden dark:bg-slate-700">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '67%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600 dark:text-slate-400">Disk Space</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">45%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden dark:bg-slate-700">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedMetric) {
      case "overview": return renderOverview();
      case "users": return renderUsers();
      case "revenue": return renderRevenue();
      case "performance": return renderPerformance();
      default: return renderOverview();
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen dark:bg-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Analytics</h1>
          <p className="text-slate-500 text-sm dark:text-slate-400">Monitor system performance and user metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
          >
            {timeRanges.map(range => (
              <option key={range.id} value={range.id}>{range.name}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm shadow-indigo-200 transition-all dark:bg-indigo-900 dark:hover:bg-indigo-800">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex flex-wrap gap-2">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedMetric === metric.id
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-600"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/50"
                }`}
              >
                <Icon size={16} />
                {metric.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={selectedMetric}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}
