/**
 * Admin Dashboard Page
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { adminAPI } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [trainingNotes, setTrainingNotes] = useState('');
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [message, setMessage] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [csvNotes, setCsvNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Offers state
  const [offers, setOffers] = useState([]);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerData, setOfferData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    description: ''
  });

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, companiesRes, historyRes, offersRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAllUsers(),
        adminAPI.getAllCompanies(),
        adminAPI.getTrainingHistory(10),
        adminAPI.getAllOffers()
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setCompanies(companiesRes.data);
      setTrainingHistory(historyRes.data);
      setOffers(offersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createCompany({ name: newCompanyName });
      setMessage('Company created successfully!');
      setNewCompanyName('');
      setShowCompanyForm(false);
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Error creating company');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleTriggerTraining = async () => {
    try {
      setMessage('Training model...');
      await adminAPI.triggerTraining({ notes: trainingNotes });
      setMessage('Model training completed successfully!');
      setTrainingNotes('');
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error training model');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setMessage('Please select a CSV file');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      setCsvFile(file);
    }
  };

  const handleTrainWithCsv = async () => {
    if (!csvFile) {
      setMessage('Please select a CSV file first');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setUploading(true);
      setMessage('Uploading CSV and training model...');

      const formData = new FormData();
      formData.append('file', csvFile);
      if (csvNotes) {
        formData.append('notes', csvNotes);
      }

      await adminAPI.trainWithCsv(formData);
      
      setMessage('Model trained successfully with CSV data!');
      setCsvFile(null);
      setCsvNotes('');
      // Reset file input
      const fileInput = document.getElementById('csv-upload');
      if (fileInput) fileInput.value = '';
      
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Error training model with CSV');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createOffer({
        name: offerData.name,
        start_date: offerData.start_date,
        end_date: offerData.end_date,
        description: offerData.description
      });
      setMessage('Promotional campaign created successfully!');
      setOfferData({
        name: '',
        start_date: '',
        end_date: '',
        description: ''
      });
      setShowOfferForm(false);
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Error creating promotional campaign');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Admin Dashboard</h1>
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
        {/* Success/Error Message */}
        {message && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Total Users</div>
            <div className="text-3xl font-bold text-blue-600">{stats?.total_users || 0}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Total Companies</div>
            <div className="text-3xl font-bold text-green-600">{stats?.total_companies || 0}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Total Products</div>
            <div className="text-3xl font-bold text-purple-600">{stats?.total_products || 0}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Model Accuracy</div>
            <div className="text-3xl font-bold text-indigo-600">
              {stats?.model_accuracy ? `${(stats.model_accuracy * 100).toFixed(2)}%` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Model Training Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Model Training</h2>
          
          {/* Quick Training */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Training (Current Data)</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Notes (optional)
                </label>
                <input
                  type="text"
                  value={trainingNotes}
                  onChange={(e) => setTrainingNotes(e.target.value)}
                  placeholder="e.g., Updated with new data"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <button
                onClick={handleTriggerTraining}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Train Model
              </button>
            </div>
          </div>

          {/* CSV Upload Training */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Train with CSV File</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV Dataset
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {csvFile && (
                  <p className="mt-2 text-sm text-green-600">
                    Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
              
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Training Notes (optional)
                  </label>
                  <input
                    type="text"
                    value={csvNotes}
                    onChange={(e) => setCsvNotes(e.target.value)}
                    placeholder="e.g., Training with new smartwatch dataset"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <button
                  onClick={handleTrainWithCsv}
                  disabled={!csvFile || uploading}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    !csvFile || uploading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {uploading ? 'Training...' : 'Train with CSV'}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>CSV Format:</strong> Your CSV should contain columns like 'Brand', 'Model', or 'model_name' for optimal training results. The system will automatically process and train the model with your dataset.
                </p>
              </div>
            </div>
          </div>

          {/* Training History Chart */}
          {trainingHistory.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Training History</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trainingHistory.reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="training_date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <YAxis domain={[0, 1]} tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleString()}
                    formatter={(value) => `${(value * 100).toFixed(2)}%`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" name="Accuracy" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Companies Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Companies</h2>
            <button
              onClick={() => setShowCompanyForm(!showCompanyForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              {showCompanyForm ? 'Cancel' : 'Add Company'}
            </button>
          </div>

          {showCompanyForm && (
            <form onSubmit={handleCreateCompany} className="mb-6 flex gap-4">
              <input
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Company Name"
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Create
              </button>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{company.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(company.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Promotional Campaigns Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Promotional Campaigns</h2>
            <button
              onClick={() => setShowOfferForm(!showOfferForm)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
            >
              {showOfferForm ? 'Cancel' : 'Add Campaign'}
            </button>
          </div>

          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Create promotional campaigns (e.g., "Black Friday", "Holiday Sale") that companies can leverage. Companies will set their own discount percentages for their products during these campaigns.
            </p>
          </div>

          {showOfferForm && (
            <form onSubmit={handleCreateOffer} className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={offerData.name}
                    onChange={(e) => setOfferData({...offerData, name: e.target.value})}
                    placeholder="e.g., Black Friday Sale, Holiday Promotion, Summer Deals"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={offerData.start_date}
                    onChange={(e) => setOfferData({...offerData, start_date: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={offerData.end_date}
                    onChange={(e) => setOfferData({...offerData, end_date: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={offerData.description}
                    onChange={(e) => setOfferData({...offerData, description: e.target.value})}
                    placeholder="e.g., Massive savings event - Companies can set their own discounts!"
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition font-medium"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {offers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No promotional campaigns yet. Click "Add Campaign" to create one.
                    </td>
                  </tr>
                ) : (
                  offers.map((offer) => {
                    const isActive = new Date(offer.start_date) <= new Date() && new Date(offer.end_date) >= new Date() && offer.is_active;
                    const startDate = new Date(offer.start_date);
                    const endDate = new Date(offer.end_date);
                    const durationDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={offer.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {offer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {startDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {endDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {durationDays} day{durationDays !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {offer.description || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user_item) => (
                  <tr key={user_item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user_item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user_item.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user_item.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user_item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user_item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user_item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user_item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
