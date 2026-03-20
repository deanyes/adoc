import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  isAuthenticated,
  getRepoConfig,
  clearToken,
  clearRepoConfig,
  resetOctokit,
  fetchUser,
  GitHubUser,
  RepoConfig,
} from './github';

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repoConfig, setRepoConfig] = useState<RepoConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    const config = getRepoConfig();
    setRepoConfig(config);
    fetchUser()
      .then(setUser)
      .catch(() => {
        handleLogout();
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    clearToken();
    clearRepoConfig();
    resetOctokit();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">ADoc</h1>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2">
                <img src={user.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                <span className="text-sm text-gray-600">{user.login}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {repoConfig && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {repoConfig.owner}/{repoConfig.repo}
                </h2>
                <p className="text-xs text-gray-400">分支: {repoConfig.branch}</p>
              </div>
              <button
                onClick={() => {
                  clearRepoConfig();
                  navigate('/login');
                }}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg transition"
              >
                切换仓库
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => navigate('/edit')}
                className="bg-white border border-gray-200 rounded-xl p-6 cursor-pointer hover:shadow-md hover:border-gray-300 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">编辑文档</h3>
                <p className="text-xs text-gray-400">使用 Milkdown 编辑器编辑仓库中的文档</p>
              </div>

              <div
                onClick={() => navigate('/docs')}
                className="bg-white border border-gray-200 rounded-xl p-6 cursor-pointer hover:shadow-md hover:border-gray-300 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">阅读文档</h3>
                <p className="text-xs text-gray-400">Tome 风格的文档阅读体验</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
