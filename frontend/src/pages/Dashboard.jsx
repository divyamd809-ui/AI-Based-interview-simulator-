import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/interview/history');
      setHistory(res.data.history);
    } catch (error) {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  const startInterview = (topic) => {
    navigate(`/interview/${topic.toLowerCase()}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome, {user.name}!</h1>
        
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Start New Interview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {['DSA', 'DBMS', 'OS', 'System Design'].map((topic) => (
              <div 
                key={topic} 
                onClick={() => startInterview(topic)}
                className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition duration-150 ease-in-out border border-gray-100 p-6 flex items-center justify-center text-center"
              >
                <span className="text-lg font-medium text-blue-600">{topic}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Interviews</h2>
          {loading ? (
            <p className="text-gray-500">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-500 bg-white p-6 rounded-lg shadow-sm border border-gray-100">No past interviews found. Start one above!</p>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {history.map((session) => (
                  <li key={session._id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">{session.topic}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${session.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {session.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Difficulty: {session.difficulty}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Started on <time dateTime={session.startTime}>{new Date(session.startTime).toLocaleDateString()}</time>
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
