import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../contexts/ContextProvider';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useStateContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login({ username, password });
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-main-bg dark:bg-main-dark-bg">
      <div className="p-8 rounded-md shadow-md bg-white dark:bg-secondary-dark-bg w-full max-w-md">
        <h2 className="text-2xl mb-4">Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Username</label>
            <input
              className="w-full p-2 border rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
            />
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <div className="flex items-center justify-between">
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Sign in</button>
            <div className="text-sm text-gray-600">Use <strong>admin</strong>/<strong>admin123</strong></div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
