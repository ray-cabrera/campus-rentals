import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboard as dashboardApi } from '../utils/api';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Earnings = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getEarningsChart(period)
        ]);
        setStats(statsRes.data);

        // Transform chart data
        const chartPoints = Object.entries(chartRes.data).map(([date, amount]) => ({
          date: format(new Date(date), period === 'year' ? 'MMM yyyy' : 'MMM d'),
          amount: amount
        }));
        setChartData(chartPoints);
      } catch (error) {
        console.error('Failed to fetch earnings data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-princeton-orange border-t-transparent"></div>
      </div>
    );
  }

  const earnings = stats?.earnings || {};
  const transactions = stats?.recent_transactions || [];

  // Calculate projections
  const weeklyAvg = earnings.this_week || 0;
  const monthlyProjection = weeklyAvg * 4;
  const semesterProjection = monthlyProjection * 4;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
            <p className="text-gray-600 mt-1">Track your rental income and projections</p>
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Earnings</span>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">${earnings.total_earnings?.toFixed(2) || '0.00'}</p>
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              All time
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">This Month</span>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">${earnings.this_month?.toFixed(2) || '0.00'}</p>
            <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {earnings.completed_rentals || 0} rentals
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Pending</span>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">${earnings.pending_earnings?.toFixed(2) || '0.00'}</p>
            <p className="text-sm text-yellow-600 mt-2 flex items-center gap-1">
              {earnings.active_rentals || 0} active rentals
            </p>
          </div>

          <div className="stat-card bg-gradient-to-br from-princeton-orange to-orange-500 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-100 text-sm">Semester Projection</span>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold">${semesterProjection.toFixed(2)}</p>
            <p className="text-sm text-orange-100 mt-2">Based on current activity</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Earnings Over Time</h2>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                {['week', 'month', 'year'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      period === p ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6600" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FF6600" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Earnings']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#FF6600"
                      strokeWidth={2}
                      fill="url(#colorAmount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No earnings data for this period
                </div>
              )}
            </div>
          </div>

          {/* Projections */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Projections</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-semibold text-gray-900">${earnings.this_week?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Monthly Est.</span>
                  <span className="font-semibold text-gray-900">${monthlyProjection.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-princeton-orange font-medium">Semester Est.</span>
                  <span className="font-bold text-princeton-orange">${semesterProjection.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Fee breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Fee Breakdown</h2>
              <p className="text-sm text-gray-600 mb-4">Platform takes 15% to cover:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-princeton-orange rounded-full" />
                  Payment processing
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-princeton-orange rounded-full" />
                  $2,000 insurance coverage
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-princeton-orange rounded-full" />
                  24/7 customer support
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-princeton-orange rounded-full" />
                  Platform maintenance
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Transaction history */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-8 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
            <button className="btn-secondary text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(tx.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{tx.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${tx.type === 'earning' ? 'badge-green' : 'badge-blue'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="badge badge-green">{tx.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`font-semibold ${tx.type === 'earning' ? 'text-green-600' : 'text-gray-900'}`}>
                          {tx.type === 'earning' ? '+' : ''}${tx.amount.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              No transactions yet. Start renting out items to earn!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Earnings;
