import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import {
  Home,
  TrendingUp,
  Calendar,
  Users,
  Settings,
  Search,
  Bell,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  User,
  DollarSign,
  X,
  Upload,
  Camera,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Tesseract from 'tesseract.js';

// Sample Data
const dashboardStats = {
  totalIncome: 3433.0,
  totalPayers: 11443,
  totalTime: 11443,
  totalWagered: 3433.0,
  percentageOfTotalBets: 34,
  eventCount: 35
};

const sportCategoriesData = [
  { name: 'Soccer', value: 1200, color: '#84CC16', icon: '⚽' },
  { name: 'Basketball', value: 800, color: '#F59E0B', icon: '🏀' },
  { name: 'Baseball', value: 600, color: '#EF4444', icon: '⚾' },
  { name: 'Football', value: 400, color: '#8B5CF6', icon: '🏈' },
  { name: 'Tennis', value: 223.55, color: '#06B6D4', icon: '🎾' }
];

const leaguesData = [
  { name: 'NFL', percentage: 38, color: '#84CC16' },
  { name: 'NHL', percentage: 78, color: '#F59E0B' },
  { name: 'NBA', percentage: 78, color: '#EF4444' }
];

const fundsActivityData = [
  { day: 'Sat', active: 1443, playing: 440 },
  { day: 'Mon', active: 1200, playing: 520 },
  { day: 'Tue', active: 1600, playing: 380 },
  { day: 'Wed', active: 1300, playing: 600 },
  { day: 'Thu', active: 1800, playing: 320 },
  { day: 'Fri', active: 1500, playing: 450 },
  { day: 'Sat', active: 1443, playing: 440 }
];

const transactions = [
  { id: 1, type: 'Income', amount: 445, time: '22 Dec at 01:32 am', game: 'Parlay', positive: true },
  { id: 2, type: 'Loss', amount: -230, time: '21 Dec at 11:15 pm', game: 'Single', positive: false },
  { id: 3, type: 'Income', amount: 120, time: '21 Dec at 06:45 pm', game: 'Parlay', positive: true }
];

const sportsBooks = [
  'DraftKings',
  'FanDuel', 
  'BetMGM',
  'Caesars',
  'PointsBet',
  'BetRivers',
  'Unibet',
  'William Hill',
  'Other'
];

const betTypes = [
  'Single',
  'Parlay',
  'Teaser',
  'Prop Bet',
  'Futures',
  'Live Bet',
  'Other'
];

const sports = [
  'Football (NFL)',
  'Basketball (NBA)', 
  'Baseball (MLB)',
  'Hockey (NHL)',
  'Soccer (MLS)',
  'Tennis',
  'Golf',
  'Boxing/MMA',
  'Other'
];

const bestPlayers = [
  { id: 1, name: 'PSG', avatar: 'https://images.pexels.com/photos/9884917/pexels-photo-9884917.jpeg?w=40&h=40&fit=crop' },
  { id: 2, name: 'Capitals', avatar: 'https://images.unsplash.com/photo-1631607054640-876e1cd7ea27?w=40&h=40&fit=crop' },
  { id: 3, name: 'Porsche', avatar: 'https://images.unsplash.com/photo-1710161468204-9a92f533d7d6?w=40&h=40&fit=crop' },
  { id: 4, name: 'Ice Family', avatar: 'https://images.unsplash.com/photo-1728555864830-499254793e04?w=40&h=40&fit=crop' }
];

const StatCard = ({ title, value, change, changeType, bgColor, icon: Icon }) => (
  <div className={`${bgColor} rounded-2xl p-6 relative overflow-hidden`}>
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-black/20 rounded-lg">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <ArrowUpRight className="w-4 h-4 text-white/60" />
    </div>
    <div className="text-white/70 text-sm mb-1">{title}</div>
    <div className="text-white text-2xl font-bold mb-2">
      {typeof value === 'number' ? (title.includes('$') || title.includes('Income') || title.includes('Wagered') ? `$${value.toLocaleString()}` : value.toLocaleString()) : value}
    </div>
    {change && (
      <div className={`text-sm flex items-center ${changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
        {changeType === 'positive' ? '+' : ''}{change}%
      </div>
    )}
  </div>
);

const AddBetModal = ({ isOpen, onClose, onAddBet }) => {
  const [betData, setBetData] = useState({
    sportsBook: '',
    betType: '',
    sport: '',
    teams: '',
    amount: '',
    odds: '',
    potentialPayout: '',
    league: ''
  });
  
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedText, setExtractedText] = useState('');

  const handleInputChange = (field, value) => {
    setBetData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-calculate potential payout when amount or odds change
    if (field === 'amount' || field === 'odds') {
      const amount = field === 'amount' ? parseFloat(value) : parseFloat(betData.amount);
      const odds = field === 'odds' ? value : betData.odds;
      
      if (amount && odds) {
        let payout = 0;
        if (odds.startsWith('+')) {
          // American odds positive
          const oddsNum = parseFloat(odds.slice(1));
          payout = amount * (oddsNum / 100);
        } else if (odds.startsWith('-')) {
          // American odds negative
          const oddsNum = parseFloat(odds.slice(1));
          payout = amount * (100 / oddsNum);
        } else if (odds.includes('.')) {
          // Decimal odds
          payout = amount * (parseFloat(odds) - 1);
        }
        
        setBetData(prev => ({
          ...prev,
          potentialPayout: payout.toFixed(2)
        }));
      }
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      setImagePreview(e.target.result);
      setIsProcessingImage(true);
      
      try {
        const result = await Tesseract.recognize(e.target.result, 'eng', {
          logger: m => console.log(m)
        });
        
        const text = result.data.text;
        setExtractedText(text);
        
        // Smart parsing of bet slip text
        const parsedData = parseBetSlipText(text);
        setBetData(prev => ({
          ...prev,
          ...parsedData
        }));
        
      } catch (error) {
        console.error('OCR Error:', error);
        alert('Error processing image. Please try again or enter manually.');
      } finally {
        setIsProcessingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const parseBetSlipText = (text) => {
    const parsed = {};
    const lines = text.toLowerCase().split('\n');
    
    // Try to extract common sportsbook names
    const sportsbookPatterns = {
      'draftkings': 'DraftKings',
      'fanduel': 'FanDuel',
      'betmgm': 'BetMGM',
      'caesars': 'Caesars',
      'pointsbet': 'PointsBet'
    };
    
    for (const [pattern, name] of Object.entries(sportsbookPatterns)) {
      if (text.toLowerCase().includes(pattern)) {
        parsed.sportsBook = name;
        break;
      }
    }
    
    // Try to extract bet amount
    const amountMatch = text.match(/\$(\d+(?:\.\d{2})?)/);
    if (amountMatch) {
      parsed.amount = amountMatch[1];
    }
    
    // Try to extract odds
    const oddsMatch = text.match(/([+-]\d+)|(\d+\.\d+)/);
    if (oddsMatch) {
      parsed.odds = oddsMatch[0];
    }
    
    // Try to identify bet type
    if (text.toLowerCase().includes('parlay')) {
      parsed.betType = 'Parlay';
    } else if (text.toLowerCase().includes('teaser')) {
      parsed.betType = 'Teaser';
    } else {
      parsed.betType = 'Single';
    }
    
    // Try to identify sport
    const sportPatterns = {
      'nfl': 'Football (NFL)',
      'nba': 'Basketball (NBA)',
      'mlb': 'Baseball (MLB)',
      'nhl': 'Hockey (NHL)',
      'mls': 'Soccer (MLS)'
    };
    
    for (const [pattern, sport] of Object.entries(sportPatterns)) {
      if (text.toLowerCase().includes(pattern)) {
        parsed.sport = sport;
        break;
      }
    }
    
    return parsed;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!betData.sportsBook || !betData.amount) {
      alert('Please fill in at least Sport Book and Amount fields');
      return;
    }
    
    const newBet = {
      id: Date.now(),
      ...betData,
      timestamp: new Date().toISOString(),
      status: 'Active'
    };
    
    onAddBet(newBet);
    setBetData({
      sportsBook: '',
      betType: '',
      sport: '',
      teams: '',
      amount: '',
      odds: '',
      potentialPayout: '',
      league: ''
    });
    setImagePreview(null);
    setExtractedText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Add New Bet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Image Upload Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">📷 Upload Bet Slip (Optional)</h3>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-lime-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                className="hidden"
                id="bet-slip-upload"
              />
              <label htmlFor="bet-slip-upload" className="cursor-pointer flex flex-col items-center">
                <Camera className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-gray-400">Click to upload bet slip image</span>
                <span className="text-sm text-gray-500">We'll try to extract bet details automatically</span>
              </label>
            </div>
            
            {isProcessingImage && (
              <div className="flex items-center justify-center mt-4">
                <Loader2 className="w-6 h-6 animate-spin text-lime-400" />
                <span className="ml-2 text-white">Processing image...</span>
              </div>
            )}
            
            {imagePreview && (
              <div className="mt-4">
                <img src={imagePreview} alt="Bet slip preview" className="max-w-full h-32 object-contain rounded-lg" />
              </div>
            )}
          </div>

          {/* Manual Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Sport Book *</label>
                <select
                  value={betData.sportsBook}
                  onChange={(e) => handleInputChange('sportsBook', e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  required
                >
                  <option value="">Select Sport Book</option>
                  {sportsBooks.map(book => (
                    <option key={book} value={book}>{book}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Bet Type</label>
                <select
                  value={betData.betType}
                  onChange={(e) => handleInputChange('betType', e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-lime-400"
                >
                  <option value="">Select Bet Type</option>
                  {betTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Sport</label>
                <select
                  value={betData.sport}
                  onChange={(e) => handleInputChange('sport', e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-lime-400"
                >
                  <option value="">Select Sport</option>
                  {sports.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">League</label>
                <input
                  type="text"
                  value={betData.league}
                  onChange={(e) => handleInputChange('league', e.target.value)}
                  placeholder="e.g., NFL, NBA, Premier League"
                  className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Teams/Event</label>
              <input
                type="text"
                value={betData.teams}
                onChange={(e) => handleInputChange('teams', e.target.value)}
                placeholder="e.g., Lakers vs Warriors, Over 45.5 Points"
                className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Bet Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={betData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="100.00"
                  className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-lime-400"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Odds</label>
                <input
                  type="text"
                  value={betData.odds}
                  onChange={(e) => handleInputChange('odds', e.target.value)}
                  placeholder="-110, +250, 2.50"
                  className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Potential Payout</label>
                <input
                  type="number"
                  step="0.01"
                  value={betData.potentialPayout}
                  onChange={(e) => handleInputChange('potentialPayout', e.target.value)}
                  placeholder="190.91"
                  className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>
            </div>

            {extractedText && (
              <div className="mt-4">
                <label className="block text-white font-medium mb-2">Extracted Text (for reference)</label>
                <textarea
                  value={extractedText}
                  readOnly
                  className="w-full bg-gray-700 text-gray-300 rounded-lg p-3 h-20 text-sm"
                />
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-lime-600 hover:bg-lime-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Add Bet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ 
  currentView, 
  setCurrentView, 
  activeTab, 
  setActiveTab, 
  isAddBetModalOpen, 
  setIsAddBetModalOpen, 
  userBets, 
  setUserBets, 
  userTransactions, 
  setUserTransactions, 
  handleAddBet, 
  handleBetStatusChange 
}) => {

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Add Bet Modal */}
      <AddBetModal 
        isOpen={isAddBetModalOpen}
        onClose={() => setIsAddBetModalOpen(false)}
        onAddBet={handleAddBet}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 bg-gray-800 flex flex-col items-center py-6 space-y-6 z-10">
        <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-gray-900 rounded-sm"></div>
        </div>
        <nav className="flex flex-col space-y-4">
          <Home 
            className={`w-6 h-6 cursor-pointer ${currentView === 'dashboard' ? 'text-lime-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setCurrentView('dashboard')}
          />
          <TrendingUp className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
          <Calendar 
            className={`w-6 h-6 cursor-pointer ${currentView === 'calendar' ? 'text-lime-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setCurrentView('calendar')}
          />
          <Users className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
          <Settings className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-16 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center space-x-2 text-gray-400">
              <span className="text-lime-400">⚡ Overview</span>
              <span>⭐ Favorites</span>
              <span>⚡ PPC</span>
              <span># Customize</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search" 
                className="bg-gray-800 rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>
            <button 
              onClick={() => setIsAddBetModalOpen(true)}
              className="w-10 h-10 bg-lime-400 hover:bg-lime-500 rounded-full flex items-center justify-center transition-colors"
              title="Add New Bet"
            >
              <Plus className="w-5 h-5 text-gray-900" />
            </button>
            <Bell className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Stats Cards - Top Row */}
          <div className="col-span-3">
            <StatCard 
              title="Total Income" 
              value={dashboardStats.totalIncome}
              change={4.5}
              changeType="positive"
              bgColor="bg-gradient-to-br from-lime-600 to-lime-700"
              icon={DollarSign}
            />
          </div>
          <div className="col-span-3">
            <StatCard 
              title="Total Payers" 
              value={dashboardStats.totalPayers}
              bgColor="bg-gradient-to-br from-orange-600 to-orange-700"
              icon={Users}
            />
          </div>
          <div className="col-span-3">
            <StatCard 
              title="Total Time" 
              value={dashboardStats.totalTime}
              bgColor="bg-gradient-to-br from-red-600 to-red-700"
              icon={TrendingUp}
            />
          </div>

          {/* User Profile */}
          <div className="col-span-3 row-span-2 bg-gray-800 rounded-2xl p-6">
            <div className="flex items-center space-x-4 mb-6">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face" 
                alt="John Williams" 
                className="w-15 h-15 rounded-full"
              />
              <div>
                <h3 className="text-white font-semibold">John Williams</h3>
                <p className="text-gray-400 text-sm">Last activity:</p>
                <p className="text-gray-400 text-sm">6 Dec, 2025 at 12:43 pm</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard 
                title="Earned" 
                value={3433.0}
                change={4.5}
                changeType="positive"
                bgColor="bg-gradient-to-br from-lime-600 to-lime-700"
                icon={ArrowUpRight}
              />
              <StatCard 
                title="Lost" 
                value={11443}
                change={5.2}
                changeType="negative"
                bgColor="bg-gradient-to-br from-red-600 to-red-700"
                icon={ArrowDownRight}
              />
            </div>

            {/* Funds Activity Chart */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center justify-between">
                Funds Activity
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={fundsActivityData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis hide />
                  <Line type="monotone" dataKey="active" stroke="#84CC16" strokeWidth={2} dot={{ fill: '#84CC16', r: 4 }} />
                  <Line type="monotone" dataKey="playing" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-sm mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
                  <span className="text-gray-400">Active</span>
                  <span className="text-white font-semibold">$1,443</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-gray-400">Playing</span>
                  <span className="text-white font-semibold">$440</span>
                </div>
              </div>
            </div>
          </div>

          {/* Second Row Stats */}
          <div className="col-span-3">
            <StatCard 
              title="Total Wagered" 
              value={dashboardStats.totalWagered}
              change={4.5}
              changeType="positive"
              bgColor="bg-gradient-to-br from-lime-600 to-lime-700"
              icon={DollarSign}
            />
          </div>
          <div className="col-span-3">
            <StatCard 
              title="Percentage of Total Bets" 
              value={`${dashboardStats.percentageOfTotalBets}%`}
              change={4.6}
              changeType="positive"
              bgColor="bg-gradient-to-br from-gray-700 to-gray-800"
              icon={TrendingUp}
            />
          </div>
          <div className="col-span-3">
            <StatCard 
              title="Event Count" 
              value={dashboardStats.eventCount}
              change={4.6}
              changeType="positive"
              bgColor="bg-gradient-to-br from-orange-600 to-orange-700"
              icon={Calendar}
            />
          </div>

          {/* Charts Section */}
          <div className="col-span-6 bg-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Top 5 Sport Categories</h3>
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sportCategoriesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sportCategoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white">
                    <tspan x="50%" dy="-0.5em" className="text-2xl font-bold">$3,223.55</tspan>
                    <tspan x="50%" dy="1.5em" className="text-sm fill-gray-400">Total profit</tspan>
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              {sportCategoriesData.map((sport, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-gray-700`}>
                    {sport.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-6 bg-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Top 5 Leagues</h3>
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {leaguesData.map((league, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold">{league.name}</span>
                    </div>
                    <span className="text-white font-medium">{league.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${league.percentage}%`, 
                          backgroundColor: league.color 
                        }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold w-8">{league.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="col-span-6 bg-gray-800 rounded-2xl p-6">
            <div className="flex items-center space-x-6 border-b border-gray-700 mb-6">
              {['Events', 'Players', 'Bets', 'Plays'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 px-1 ${
                    activeTab === tab 
                      ? 'text-lime-400 border-b-2 border-lime-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Red Sox Event Card */}
            <div className="bg-gray-700 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">RS</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Red Sox</h4>
                    <p className="text-gray-400 text-sm">25% Pull</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lime-400 font-bold">$4,450</div>
                  <div className="text-gray-400 text-sm">Users: 67 | Funds: $22.4k</div>
                </div>
              </div>
            </div>

            {/* User Bets - Active */}
            {userBets.filter(bet => bet.status === 'Pending').length > 0 && (
              <div className="mb-4">
                <h4 className="text-white font-semibold mb-3">Your Active Bets</h4>
                <div className="space-y-3">
                  {userBets.filter(bet => bet.status === 'Pending').slice(0, 3).map((bet) => (
                    <div key={bet.id} className="bg-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-lime-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">
                              {bet.sportsBook === 'DraftKings' ? 'DK' : 
                               bet.sportsBook === 'FanDuel' ? 'FD' :
                               bet.sportsBook === 'BetMGM' ? 'MGM' :
                               bet.sportsBook === 'Caesars' ? 'CZR' :
                               bet.sportsBook === 'PointsBet' ? 'PB' :
                               bet.sportsBook.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">
                              {bet.teams || `${bet.sport} ${bet.betType}`}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              {bet.sportsBook} • {bet.betType} • {bet.odds}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">${bet.amount}</div>
                          <div className="text-lime-400 text-sm">
                            Win: ${bet.potentialPayout || 'TBD'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Selection Buttons - Only for Pending bets */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleBetStatusChange(bet.id, 'Won')}
                          className="flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors bg-gray-600 text-gray-300 hover:bg-green-600 hover:text-white"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Won</span>
                        </button>
                        <button
                          onClick={() => handleBetStatusChange(bet.id, 'Lost')}
                          className="flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors bg-gray-600 text-gray-300 hover:bg-red-600 hover:text-white"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Lost</span>
                        </button>
                        <div className="flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium bg-yellow-600 text-white">
                          <Clock className="w-4 h-4" />
                          <span>Pending</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Bets - Completed */}
            {userBets.filter(bet => bet.status === 'Won' || bet.status === 'Lost').length > 0 && (
              <div className="mb-4">
                <h4 className="text-white font-semibold mb-3">Completed Bets</h4>
                <div className="space-y-3">
                  {userBets.filter(bet => bet.status === 'Won' || bet.status === 'Lost').slice(0, 3).map((bet) => (
                    <div key={bet.id} className="bg-gray-700 rounded-xl p-4 opacity-75">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            bet.status === 'Won' ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                            <span className="text-white font-bold text-xs">
                              {bet.sportsBook === 'DraftKings' ? 'DK' : 
                               bet.sportsBook === 'FanDuel' ? 'FD' :
                               bet.sportsBook === 'BetMGM' ? 'MGM' :
                               bet.sportsBook === 'Caesars' ? 'CZR' :
                               bet.sportsBook === 'PointsBet' ? 'PB' :
                               bet.sportsBook.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">
                              {bet.teams || `${bet.sport} ${bet.betType}`}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              {bet.sportsBook} • {bet.betType} • {bet.odds}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">${bet.amount}</div>
                          <div className={`text-sm font-semibold ${
                            bet.status === 'Won' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {bet.status === 'Won' ? `+$${bet.potentialPayout || bet.amount}` : '-$' + bet.amount}
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Display - No longer clickable */}
                      <div className="flex space-x-2">
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium ${
                          bet.status === 'Won' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {bet.status === 'Won' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span>{bet.status}</span>
                        </div>
                        <div className="text-gray-400 text-sm px-3 py-1">
                          Completed: {new Date(bet.completedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Best Players */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lime-400">⭐</span>
                <span className="text-white font-semibold">Best Players</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-white font-bold">Pro 4</div>
                <div className="flex -space-x-2">
                  {bestPlayers.map((player) => (
                    <img
                      key={player.id}
                      src={player.avatar}
                      alt={player.name}
                      className="w-8 h-8 rounded-full border-2 border-gray-800"
                    />
                  ))}
                  <div className="w-8 h-8 bg-gray-600 rounded-full border-2 border-gray-800 flex items-center justify-center">
                    <span className="text-white text-xs">+145</span>
                  </div>
                </div>
                <Plus className="w-6 h-6 text-gray-400 bg-gray-700 rounded-full p-1" />
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="col-span-3 bg-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Transactions</h3>
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {userTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.positive ? 'bg-lime-600' : 'bg-red-600'
                    }`}>
                      $
                    </div>
                    <div>
                      <div className="text-white font-medium">{transaction.type}</div>
                      <div className="text-gray-400 text-sm">{transaction.time}</div>
                      {transaction.sportsBook && (
                        <div className="text-gray-500 text-xs">{transaction.sportsBook}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${transaction.positive ? 'text-lime-400' : 'text-red-400'}`}>
                      {transaction.positive ? '+' : ''}${Math.abs(transaction.amount)}
                    </div>
                    <div className="text-gray-400 text-sm">{transaction.game}</div>
                    {transaction.teams && (
                      <div className="text-gray-500 text-xs">{transaction.teams}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CalendarView = ({ 
  selectedDate, 
  setSelectedDate, 
  userBets, 
  generateCalendarData, 
  calculateStats 
}) => {
  const calendarData = generateCalendarData();
  const stats = calculateStats();
  
  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + direction);
    setSelectedDate(newDate);
  };

  const getColorIntensity = (profit) => {
    if (profit === 0) return 'bg-gray-700';
    if (profit > 0) {
      if (profit < 50) return 'bg-green-900';
      if (profit < 100) return 'bg-green-700';
      if (profit < 200) return 'bg-green-500';
      return 'bg-green-400';
    } else {
      if (profit > -50) return 'bg-red-900';
      if (profit > -100) return 'bg-red-700';
      if (profit > -200) return 'bg-red-500';
      return 'bg-red-400';
    }
  };

  // Pie chart data for bet outcomes
  const betOutcomeData = [
    { name: 'Won', value: stats.wonBets, color: '#22c55e' },
    { name: 'Lost', value: stats.lostBets, color: '#ef4444' },
    { name: 'Pending', value: stats.pendingBets, color: '#eab308' }
  ];

  // Pie chart data for sportsbooks
  const sportsbookData = userBets.reduce((acc, bet) => {
    const existing = acc.find(item => item.name === bet.sportsBook);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ 
        name: bet.sportsBook, 
        value: 1, 
        color: `hsl(${Math.random() * 360}, 70%, 50%)` 
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Betting Calendar</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-xl font-semibold text-white min-w-48 text-center">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard 
          title="Total Bets" 
          value={stats.totalBets}
          bgColor="bg-gradient-to-br from-blue-600 to-blue-700"
          icon={TrendingUp}
        />
        <StatCard 
          title="Won Bets" 
          value={stats.wonBets}
          bgColor="bg-gradient-to-br from-green-600 to-green-700"
          icon={CheckCircle}
        />
        <StatCard 
          title="Lost Bets" 
          value={stats.lostBets}
          bgColor="bg-gradient-to-br from-red-600 to-red-700"
          icon={XCircle}
        />
        <StatCard 
          title="Win Rate" 
          value={`${stats.winRate}%`}
          bgColor="bg-gradient-to-br from-purple-600 to-purple-700"
          icon={TrendingUp}
        />
        <StatCard 
          title="Total Profit" 
          value={stats.totalProfit}
          changeType={stats.totalProfit >= 0 ? 'positive' : 'negative'}
          bgColor="bg-gradient-to-br from-lime-600 to-lime-700"
          icon={DollarSign}
        />
      </div>

      {/* Calendar Grid */}
      <div className="bg-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Daily Performance Heatmap</h3>
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-gray-400 text-sm py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarData.map((dayData, index) => (
            <div
              key={index}
              className={`aspect-square flex items-center justify-center rounded text-sm font-medium relative group ${
                dayData 
                  ? `${getColorIntensity(dayData.performance.totalProfit)} text-white cursor-pointer hover:ring-2 hover:ring-lime-400` 
                  : 'bg-transparent'
              }`}
            >
              {dayData && (
                <>
                  {dayData.day}
                  {dayData.performance.totalBets > 0 && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-lime-400 rounded-full"></div>
                  )}
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                    <div>{dayData.date.toLocaleDateString()}</div>
                    <div>Bets: {dayData.performance.totalBets}</div>
                    <div>W: {dayData.performance.wins} L: {dayData.performance.losses}</div>
                    <div className={dayData.performance.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                      ${dayData.performance.totalProfit.toFixed(2)}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-gray-400 text-sm">Less</div>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-700 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-900 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
          </div>
          <div className="text-gray-400 text-sm">More Profit</div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bet Outcomes Pie Chart */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Bet Outcomes</h3>
          {betOutcomeData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={betOutcomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {betOutcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No bet data available
            </div>
          )}
        </div>

        {/* Sportsbook Distribution */}
        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Sportsbook Distribution</h3>
          {sportsbookData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sportsbookData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sportsbookData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No sportsbook data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('Events');
  const [isAddBetModalOpen, setIsAddBetModalOpen] = useState(false);
  const [userBets, setUserBets] = useState([]);
  const [userTransactions, setUserTransactions] = useState(transactions);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleBetStatusChange = (betId, newStatus) => {
    setUserBets(prev => 
      prev.map(bet => {
        if (bet.id === betId) {
          // Prevent changing status if bet is already Won or Lost
          if (bet.status === 'Won' || bet.status === 'Lost') {
            return bet;
          }
          
          const updatedBet = { ...bet, status: newStatus, completedDate: new Date().toISOString() };
          
          // Add transaction for win/loss only if changing from Pending
          if ((newStatus === 'Won' || newStatus === 'Lost') && bet.status === 'Pending') {
            const amount = newStatus === 'Won' 
              ? parseFloat(bet.potentialPayout || bet.amount) 
              : 0; // Don't subtract again for losses since bet placement already did
            
            const transaction = {
              id: Date.now() + Math.random(),
              type: newStatus === 'Won' ? 'Income' : 'Loss',
              amount: amount,
              time: new Date().toLocaleString(),
              game: bet.betType || 'Bet',
              positive: newStatus === 'Won',
              sportsBook: bet.sportsBook,
              teams: bet.teams
            };
            
            setUserTransactions(prev => [transaction, ...prev.slice(0, 9)]); // Keep only 10 transactions
          }
          
          return updatedBet;
        }
        return bet;
      })
    );
  };

  // Calculate daily performance for calendar
  const getDayPerformance = (date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayBets = userBets.filter(bet => {
      const betDate = new Date(bet.dateAdded);
      return betDate >= dayStart && betDate <= dayEnd && bet.status !== 'Pending';
    });
    
    const wins = dayBets.filter(bet => bet.status === 'Won').length;
    const losses = dayBets.filter(bet => bet.status === 'Lost').length;
    const totalProfit = dayBets.reduce((sum, bet) => {
      if (bet.status === 'Won') {
        return sum + parseFloat(bet.potentialPayout || bet.amount);
      } else if (bet.status === 'Lost') {
        return sum - parseFloat(bet.amount);
      }
      return sum;
    }, 0);
    
    return { wins, losses, totalProfit, totalBets: dayBets.length };
  };

  // Generate calendar data for current month
  const generateCalendarData = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const performance = getDayPerformance(date);
      calendarDays.push({
        date,
        day,
        performance
      });
    }
    
    return calendarDays;
  };

  // Calculate overall statistics
  const calculateStats = () => {
    const wonBets = userBets.filter(bet => bet.status === 'Won');
    const lostBets = userBets.filter(bet => bet.status === 'Lost');
    const pendingBets = userBets.filter(bet => bet.status === 'Pending');
    
    const totalProfit = wonBets.reduce((sum, bet) => sum + parseFloat(bet.potentialPayout || bet.amount), 0) -
                       lostBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    
    return {
      totalBets: userBets.length,
      wonBets: wonBets.length,
      lostBets: lostBets.length,
      pendingBets: pendingBets.length,
      totalProfit,
      winRate: userBets.length > 0 ? ((wonBets.length / (wonBets.length + lostBets.length)) * 100).toFixed(1) : 0
    };
  };

  if (currentView === 'calendar') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <AddBetModal 
          isOpen={isAddBetModalOpen}
          onClose={() => setIsAddBetModalOpen(false)}
          onAddBet={handleAddBet}
        />
        
        {/* Sidebar */}
        <div className="fixed left-0 top-0 h-full w-16 bg-gray-800 flex flex-col items-center py-6 space-y-6 z-10">
          <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-900 rounded-sm"></div>
          </div>
          <nav className="flex flex-col space-y-4">
            <Home 
              className={`w-6 h-6 cursor-pointer ${currentView === 'dashboard' ? 'text-lime-400' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setCurrentView('dashboard')}
            />
            <TrendingUp className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
            <Calendar 
              className={`w-6 h-6 cursor-pointer ${currentView === 'calendar' ? 'text-lime-400' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setCurrentView('calendar')}
            />
            <Users className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
            <Settings className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
          </nav>
        </div>

        {/* Main Content */}
        <div className="ml-16 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Betting Calendar</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="bg-gray-800 rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>
              <button 
                onClick={() => setIsAddBetModalOpen(true)}
                className="w-10 h-10 bg-lime-400 hover:bg-lime-500 rounded-full flex items-center justify-center transition-colors"
                title="Add New Bet"
              >
                <Plus className="w-5 h-5 text-gray-900" />
              </button>
              <Bell className="w-6 h-6 text-gray-400" />
            </div>
          </div>

          <CalendarView 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            userBets={userBets}
            generateCalendarData={generateCalendarData}
            calculateStats={calculateStats}
          />
        </div>
      </div>
    );
  }

  return (
    <Dashboard 
      currentView={currentView}
      setCurrentView={setCurrentView}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isAddBetModalOpen={isAddBetModalOpen}
      setIsAddBetModalOpen={setIsAddBetModalOpen}
      userBets={userBets}
      setUserBets={setUserBets}
      userTransactions={userTransactions}
      setUserTransactions={setUserTransactions}
      handleAddBet={handleAddBet}
      handleBetStatusChange={handleBetStatusChange}
    />
  );
}

export default App;