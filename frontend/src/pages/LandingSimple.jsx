import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../lib/auth';

export default function LandingSimple() {
  const navigate = useNavigate();
  const [token] = useState(getToken());

  const handleLoginClick = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Secure Access for your Enterprise
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            Initialize your session to access the central command dashboard.
          </p>
          
          <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              {token ? 'Session Active' : 'Welcome Back'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {token ? 'You are already logged in. Continue to your dashboard.' : 'Enter your credentials to continue.'}
            </p>
            
            <div className="space-y-4">
              {!token && (
                <>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </>
              )}
              <button 
                onClick={handleLoginClick}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                {token ? 'Go to Dashboard' : 'Initiate Session'}
              </button>
            </div>
            
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
              New to the system? <a href="/login-test" className="text-indigo-600 hover:underline">Register Node</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
