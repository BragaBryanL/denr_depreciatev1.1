import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Shield, Users, Plus, Crown, UserCheck } from 'lucide-react';

function Login({ onLogin }) {
  const [loginType, setLoginType] = useState('user'); // 'admin' or 'user'
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
    setCreateError('');
    setCreateSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Get stored users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Separate admin and user credentials
    const adminCredentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'penro', password: 'denr2024' },
      { username: 'denr', password: 'penro2024' }
    ];

    let validCredentials = [];
    if (loginType === 'admin') {
      validCredentials = adminCredentials;
    } else {
      // Only allow active users (not pending)
      validCredentials = storedUsers.filter(user => user.status !== 'pending');
    }

    setTimeout(() => {
      const isValid = validCredentials.some(
        cred => cred.username === formData.username && cred.password === formData.password
      );

      // Check if user exists but is pending
      const pendingUser = storedUsers.some(
        user => user.username === formData.username && user.password === formData.password && user.status === 'pending'
      );

      if (isValid) {
        // Store login info in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', formData.username);
        localStorage.setItem('userType', loginType);
        onLogin(formData.username);
      } else if (pendingUser) {
        setError('Your account is pending admin approval');
        setIsLoading(false);
      } else {
        setError(`Invalid ${loginType} credentials`);
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setIsCreatingAccount(true);
    setCreateError('');
    setCreateSuccess('');

    // Validate passwords match
    if (newUser.password !== newUser.confirmPassword) {
      setCreateError('Passwords do not match');
      setIsCreatingAccount(false);
      return;
    }

    // Get existing users
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if username already exists
    if (existingUsers.some(user => user.username === newUser.username)) {
      setCreateError('Username already exists');
      setIsCreatingAccount(false);
      return;
    }

    // Add new user
    const updatedUsers = [...existingUsers, {
      username: newUser.username,
      password: newUser.password,
      role: 'user',
      status: 'pending',
      createdAt: new Date().toISOString()
    }];

    // Store users in localStorage
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Notify admin about new user registration with accept/reject buttons
    if (window.addNotification) {
      window.addNotification({
        type: 'pending_account',
        message: `New user account pending: ${newUser.username}`,
        username: newUser.username,
        userId: Date.now().toString()
      });
    }

    setTimeout(() => {
      setCreateSuccess(`Account submitted for approval! Username: ${newUser.username}, Password: ${newUser.password}. Please wait for admin approval.`);
      setNewUser({ username: '', password: '', confirmPassword: '', role: 'user' });
      setIsCreatingAccount(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-200 via-emerald-200 to-teal-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Environmental Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-emerald-600 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-36 h-36 bg-teal-600 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Login Type Selector */}
        <div className="mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-denr-green/30 p-1">
            <div className="flex">
              <button
                onClick={() => setLoginType('user')}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-200 ${
                  loginType === 'user'
                    ? 'bg-denr-green text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                User Login
              </button>
              <button
                onClick={() => setLoginType('admin')}
                className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg transition-all duration-200 ${
                  loginType === 'admin'
                    ? 'bg-denr-green text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Crown className="w-4 h-4 mr-2" />
                Admin Login
              </button>
            </div>
          </div>
        </div>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className={`bg-gradient-to-r p-3 rounded-full shadow-xl border-4 border-white/50 ${
              loginType === 'admin' 
                ? 'from-denr-green to-green-700' 
                : 'from-blue-500 to-blue-600'
            }`}>
              <img 
                src="/denrlogo.jpg" 
                alt="DENR Logo" 
                className="w-16 h-16 logo-circular"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = loginType === 'admin'
                    ? '<svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
                    : '<svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                }}
              />
            </div>
          </div>
          <p className="text-2xl font-bold text-denr-green mt-1">Property Depreciation Management System</p>
          <div className="mt-3 inline-flex items-center px-3 py-1 bg-denr-green/20 rounded-full">
            <span className="text-xs font-semibold text-denr-green">
              {loginType === 'admin' ? 'ADMIN PORTAL' : 'USER PORTAL'}
            </span>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-denr-green/30 p-8">
          <div className="mb-6 text-center">
            <h2 className={`text-xl font-bold mb-2 ${
              loginType === 'admin' ? 'text-denr-green' : 'text-blue-600'
            }`}>
              {loginType === 'admin' ? 'Admin Secure Access' : 'User Login Portal'}
            </h2>
            <p className="text-sm text-gray-600">
              {loginType === 'admin' 
                ? 'Administrative Access Only' 
                : 'Enter your credentials to access the system'
              }
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-1 text-denr-green" />
                  Username
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="pl-10 pr-3 py-3 w-full border border-denr-green/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green/50 focus:border-denr-green bg-white/95 backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter your username"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-denr-green/50" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="flex items-center">
                  <Lock className="w-4 h-4 mr-1 text-denr-green" />
                  Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="pl-10 pr-10 py-3 w-full border border-denr-green/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-denr-green/50 focus:border-denr-green bg-white/95 backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-denr-green/50" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-denr-green/50 hover:text-denr-green" />
                  ) : (
                    <Eye className="h-5 w-5 text-denr-green/50 hover:text-denr-green" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-medium">Authentication Failed</p>
                <p className="text-red-500 text-xs mt-1">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold ${
                loginType === 'admin'
                  ? 'bg-gradient-to-r from-denr-green to-green-700 text-white hover:from-green-700 hover:to-green-800'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Authenticating...
                </div>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          {/* Create Account Button - Only for User Registration */}
          {loginType === 'user' && (
            <div className="mt-4">
              <button
                onClick={() => setShowCreateAccount(!showCreateAccount)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Account
              </button>
            </div>
          )}

          {/* Create Account Form */}
          {showCreateAccount && (
            <div className="mt-6 p-6 bg-gradient-to-br from-white to-blue-50/50 rounded-xl border border-blue-500/30 shadow-lg">
              <div className="flex items-center mb-4">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-blue-600">Create New Account</h3>
              </div>
              
              <form onSubmit={handleCreateAccount} className="space-y-4">
                {/* Username Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={newUser.username}
                    onChange={handleNewUserChange}
                    required
                    className="w-full px-3 py-2 border border-blue-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/95 backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter username"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleNewUserChange}
                    required
                    className="w-full px-3 py-2 border border-blue-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/95 backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter password"
                  />
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={newUser.confirmPassword}
                    onChange={handleNewUserChange}
                    required
                    className="w-full px-3 py-2 border border-blue-500/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/95 backdrop-blur-sm transition-all duration-200"
                    placeholder="Confirm password"
                  />
                </div>

                {/* Error Message */}
                {createError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{createError}</p>
                  </div>
                )}

                {/* Success Message */}
                {createSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-600 text-sm font-semibold">Success!</p>
                    <p className="text-green-500 text-xs mt-1">{createSuccess}</p>
                  </div>
                )}

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={isCreatingAccount}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold"
                >
                  {isCreatingAccount ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-denr-green/10 rounded-lg border border-denr-green/20">
            <p className="text-sm font-semibold text-denr-green mb-2">Test Credentials:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>Admin: <span className="font-mono bg-white px-2 py-1 rounded border border-denr-green/30">admin / admin123</span></p>
              <p>PENRO: <span className="font-mono bg-white px-2 py-1 rounded border border-denr-green/30">penro / denr2024</span></p>
              <p>DENR: <span className="font-mono bg-white px-2 py-1 rounded border border-denr-green/30">denr / penro2024</span></p>
            </div>
          </div>
        </div>

              </div>
    </div>
  );
}

export default Login;
