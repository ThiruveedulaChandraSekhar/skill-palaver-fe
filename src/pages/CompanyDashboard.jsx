/**
 * Company Dashboard Page
 */
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { companyAPI } from '../api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function CompanyDashboard() {
  const { user, logout, isCompany } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingForecast, setGeneratingForecast] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isCompany()) {
      navigate('/admin');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('📊 Loading company data from database...');
      const [productsRes, analyticsRes] = await Promise.all([
        companyAPI.getProducts(),
        companyAPI.getAnalytics()
      ]);

      console.log('✅ Products from database:', productsRes.data);
      console.log('✅ Analytics from database:', analyticsRes.data);

      setProducts(productsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('❌ Error loading data from database:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const loadPredictions = async () => {
    if (products.length === 0) {
      setMessage('No products found in database. Please upload sales data first.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setGeneratingForecast(true);
      console.log('🔮 Generating sales forecast from company data in database...');
      
      const [predictionsRes, featureImportanceRes] = await Promise.all([
        companyAPI.getPredictions(6),
        companyAPI.getFeatureImportance()
      ]);

      console.log('✅ Sales forecast generated for next 6 months:', predictionsRes.data);
      console.log('✅ Feature importance calculated:', featureImportanceRes.data);

      setPredictions(predictionsRes.data);
      setFeatureImportance(featureImportanceRes.data.feature_importance);
      setMessage('✅ Sales forecast generated successfully for next 6 months!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ Error generating forecast:', error);
      console.error('Error details:', error.response?.data);
      setMessage('Error generating forecast. Please ensure you have uploaded sales data.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setGeneratingForecast(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setMessage('Uploading CSV and adding data to database...');
      const response = await companyAPI.uploadSalesCSV(file);
      setMessage(response.data.message + ' - Refreshing products and analytics...');
      
      // Reload products and analytics data
      await loadData();
      
      setMessage('Upload complete! Products added to database. Go to Analytics to view forecasts.');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Error uploading CSV');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };



  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await companyAPI.deleteProduct(id);
      setMessage('Product deleted successfully!');
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error deleting product');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // Prepare chart data
  const regionData = analytics?.sales_by_region ? Object.entries(analytics.sales_by_region).map(([region, sales]) => ({
    region,
    sales
  })) : [];

  const monthlyData = analytics?.sales_by_month || [];

  console.log('Chart data prepared:');
  console.log('- Region data:', regionData);
  console.log('- Monthly data:', monthlyData);
  console.log('- Has predictions:', predictions?.predictions?.length || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Company Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex gap-8">
            {['overview', 'products', 'analytics', 'upload'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-gray-600 text-sm font-medium mb-2">Total Products</div>
                <div className="text-3xl font-bold text-blue-600">{products.length}</div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-gray-600 text-sm font-medium mb-2">Total Revenue</div>
                <div className="text-3xl font-bold text-green-600">
                  ${analytics?.revenue_stats?.total_revenue?.toLocaleString() || 0}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-gray-600 text-sm font-medium mb-2">Regions</div>
                <div className="text-3xl font-bold text-purple-600">{regionData.length}</div>
              </div>
            </div>

            {/* Top Products */}
            {analytics?.top_products && analytics.top_products.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Top Products</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.top_products}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#3b82f6" name="Total Sales" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Feature Importance */}
            {featureImportance.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Feature Impact Analysis</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-800">
                    <strong>Based on your uploaded CSV data:</strong> This analysis shows which product features correlate with higher sales performance.
                  </p>
                </div>
                <div className="space-y-3">
                  {featureImportance.slice(0, 8).map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.feature}</span>
                        <span className="text-sm font-semibold text-green-600">{item.impact}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${item.importance * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {products.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Data Available</h3>
                <p className="mt-2 text-sm text-gray-500">Upload your sales CSV file to get started with analytics, predictions, and insights.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Upload Sales Data
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Unique Products</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Products from Database:</strong> All unique products from your company's uploaded sales data are displayed here. Upload sales data in the "Upload" tab to add new products.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{product.model_name}</h3>
                      <p className="text-sm text-gray-600">{product.region}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Battery Life:</span>
                      <span className="font-medium">{product.battery_life}h</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-gray-600 mb-2">Features:</div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(product).filter(([key, val]) => 
                          typeof val === 'boolean' && val === true
                        ).map(([key]) => (
                          <span key={key} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {key.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products in database</h3>
                <p className="mt-1 text-sm text-gray-500">Upload a CSV file with your sales data to add products to the database</p>
                <div className="mt-6">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Go to Upload
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Forecast Generation Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Sales Forecast</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    AI-powered predictions based on your uploaded sales data from the database
                  </p>
                </div>
                <button
                  onClick={loadPredictions}
                  disabled={generatingForecast || products.length === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {generatingForecast ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Forecast...
                    </span>
                  ) : (
                    'Generate Sales Forecast'
                  )}
                </button>
              </div>
              {products.length === 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ No products found. Please upload a CSV file with sales data first.
                  </p>
                </div>
              )}
            </div>
            {/* Sales by Region */}
            {regionData.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Sales by Region</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={regionData}
                      dataKey="sales"
                      nameKey="region"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {regionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Monthly Sales Trend */}
            {monthlyData.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Sales Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#3b82f6" name="Sales" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Sales Predictions */}
            {predictions?.predictions && predictions.predictions.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Sales Predictions (Next 6 Months)</h2>
                  <p className="text-sm text-gray-600 mt-1">AI-powered forecasts based on your uploaded sales data</p>
                </div>
                {predictions.predictions.map((product) => (
                  <div key={product.product_id} className="mb-8 border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">{product.product_name}</h3>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {product.predictions.reduce((sum, p) => sum + p.predicted_sales, 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">Total predicted units</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={product.predictions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tickFormatter={(val) => `Month ${val}`} />
                        <YAxis />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                                  <p className="font-semibold">Month {data.month}</p>
                                  <p className="text-blue-600">Predicted Sales: {data.predicted_sales}</p>
                                  <p className="text-gray-600">Confidence: {(data.confidence * 100).toFixed(0)}%</p>
                                  {data.has_active_offer && (
                                    <p className="text-green-600 text-sm mt-1">✓ Active Promotion: {data.offer_name}</p>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="predicted_sales" fill="#3b82f6" name="Predicted Sales" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <div className="bg-green-50 p-2 rounded text-center">
                        <p className="text-xs text-gray-600">Avg Confidence</p>
                        <p className="text-lg font-bold text-green-600">
                          {(product.predictions.reduce((sum, p) => sum + p.confidence, 0) / product.predictions.length * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded text-center">
                        <p className="text-xs text-gray-600">Promotional Months</p>
                        <p className="text-lg font-bold text-purple-600">
                          {product.predictions.filter(p => p.has_active_offer).length} / 6
                        </p>
                      </div>
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <p className="text-xs text-gray-600">Peak Month</p>
                        <p className="text-lg font-bold text-blue-600">
                          {Math.max(...product.predictions.map(p => p.month))}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!regionData.length && !monthlyData.length && !predictions?.predictions?.length && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No sales data in database</h3>
                <p className="mt-1 text-sm text-gray-500">Upload your CSV file with sales data to enable forecasting</p>
                <div className="mt-6">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Go to Upload
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Sales Data</h2>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-900 mb-2">How it works:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✓ <strong>Step 1:</strong> Upload your CSV file with sales data</li>
                  <li>✓ <strong>Step 2:</strong> Products and sales data are added to the database</li>
                  <li>✓ <strong>Step 3:</strong> View your products in the "Products" tab</li>
                  <li>✓ <strong>Step 4:</strong> Go to "Analytics" tab and click "Generate Sales Forecast" to see predictions</li>
                </ul>
              </div>
              
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex flex-col items-center"
                  >
                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-lg font-medium text-gray-700 mb-2">Click to upload CSV file</span>
                    <span className="text-sm text-gray-500">or drag and drop</span>
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-3">CSV Format Requirements:</h3>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p><strong>Required columns:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li><strong>Model</strong> or model_name: Product model name</li>
                      <li><strong>Sales_Count</strong> or sales_count: Number of units sold</li>
                      <li><strong>Month</strong> (YYYY-MM format) or date (YYYY-MM-DD): Sales period</li>
                      <li><strong>Price_Rs</strong> or price: Product price</li>
                    </ul>
                    <p className="mt-3"><strong>Optional columns:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Region: Geographic region</li>
                      <li>Discount_Price_Rs or discount_price: Discounted price</li>
                      <li>Battery_Life_Days or battery_life: Battery life in hours/days</li>
                      <li>Display_Type: Type of display</li>
                      <li>Heart_Rate, SpO2, Sleep_Tracking, Step_Count: Health features (Yes/No or true/false)</li>
                      <li>Calorie_Tracking, Stress_Monitor: Fitness features (Yes/No or true/false)</li>
                      <li>Connectivity, WiFi: Connectivity features (Yes/No or true/false)</li>
                      <li>Smart_Fitness_Features: Overall fitness capability (Yes/No or true/false)</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Example CSV Format:</h3>
                  <pre className="text-xs bg-white p-4 rounded border border-gray-200 overflow-x-auto">
{`Month,Region,Model,Battery_Life_Days,Heart_Rate,SpO2,Sleep_Tracking,Sales_Count,Price_Rs,Discount_Price_Rs
2026-01,North America,Watch Pro,2,Yes,Yes,Yes,150,24999,21999
2026-01,Europe,Watch Lite,1.5,Yes,No,Yes,200,16999,14999
2026-02,Asia,Watch Ultra,3,Yes,Yes,Yes,180,34999,29999`}
                  </pre>
                  <p className="text-xs text-gray-600 mt-2">
                    <strong>Note:</strong> System supports both formats (Model/Month/Price_Rs) and (model_name/date/price)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
