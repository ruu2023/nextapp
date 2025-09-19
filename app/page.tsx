import React from 'react'

const page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* メインタイトル */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white tracking-tight">
            Dev<span className="text-purple-400">Hub</span>
          </h1>
          <p className="text-xl text-slate-300">開発学習プラットフォーム</p>
        </div>

        {/* ナビゲーションリンク */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/blog"
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out"
          >
            <span className="relative z-10">📝 BLOG</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>

          <a
            href="/todo"
            className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out"
          >
            <span className="relative z-10">🚀 Now Craft</span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
        </div>

        {/* フッター */}
        <div className="pt-8">
          <p className="text-slate-400 text-sm">Learning & Building 🔥</p>
        </div>
      </div>
    </div>
  )
}

export default page
