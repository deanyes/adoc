import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  setToken,
  setRepoConfig,
  getToken,
  fetchUser,
  fetchRepos,
  resetOctokit,
  GitHubUser,
} from '../github';

export default function LoginPage() {
  const navigate = useNavigate();
  const [token, setTokenInput] = useState(getToken() || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<{ full_name: string; default_branch: string }[]>([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [customRepo, setCustomRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [step, setStep] = useState<'token' | 'repo'>('token');

  const handleVerifyToken = async () => {
    if (!token.trim()) return;
    setLoading(true);
    setError('');

    try {
      setToken(token.trim());
      resetOctokit();
      const userData = await fetchUser();
      setUser(userData);
      const repoList = await fetchRepos();
      setRepos(repoList);
      setStep('repo');
    } catch (err: any) {
      setError('Token 无效或网络错误: ' + (err.message || '请重试'));
      setToken('');
    }
    setLoading(false);
  };

  const handleSelectRepo = () => {
    const repoFullName = customRepo.trim() || selectedRepo;
    if (!repoFullName || !repoFullName.includes('/')) {
      setError('请选择或输入仓库（格式: owner/repo）');
      return;
    }

    const [owner, repo] = repoFullName.split('/');
    const repoInfo = repos.find((r) => r.full_name === repoFullName);
    const finalBranch = branch || repoInfo?.default_branch || 'main';

    setRepoConfig({ owner, repo, branch: finalBranch });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">ADoc</h1>
        <p className="text-sm text-gray-400 mb-6">连接你的 GitHub 仓库来管理文档</p>

        {step === 'token' && (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyToken()}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 mb-3"
            />
            <p className="text-xs text-gray-400 mb-4">
              需要 <code className="bg-gray-100 px-1 rounded">repo</code> 权限。
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=ADoc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline ml-1"
              >
                创建 Token
              </a>
            </p>
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <button
              onClick={handleVerifyToken}
              disabled={loading || !token.trim()}
              className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {loading ? '验证中...' : '验证 Token'}
            </button>
          </>
        )}

        {step === 'repo' && user && (
          <>
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name || user.login}</p>
                <p className="text-xs text-gray-400">@{user.login}</p>
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择文档仓库
            </label>
            <select
              value={selectedRepo}
              onChange={(e) => {
                setSelectedRepo(e.target.value);
                setCustomRepo('');
                const r = repos.find((r) => r.full_name === e.target.value);
                if (r) setBranch(r.default_branch);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 mb-3"
            >
              <option value="">-- 选择仓库 --</option>
              {repos.map((r) => (
                <option key={r.full_name} value={r.full_name}>
                  {r.full_name}
                </option>
              ))}
            </select>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-400">或手动输入</span>
              </div>
            </div>

            <input
              value={customRepo}
              onChange={(e) => {
                setCustomRepo(e.target.value);
                setSelectedRepo('');
              }}
              placeholder="owner/repo"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 mb-3"
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">
              分支
            </label>
            <input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 mb-4"
            />

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            <button
              onClick={handleSelectRepo}
              className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
            >
              开始使用
            </button>

            <button
              onClick={() => {
                setStep('token');
                setUser(null);
              }}
              className="w-full mt-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
            >
              返回更换 Token
            </button>
          </>
        )}
      </div>
    </div>
  );
}
