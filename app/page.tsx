'use client'
import { useEffect, useState } from "react";

interface Post {
  id: number;
  title: string;
  description: string;
  date: string;
}

interface FormData {
  title: string;
  description: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: ''
  });

  // 全記事を取得
  const fetchPosts = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/blog');
      const data = await response.json();
      // 配列だけ state にセット
      if (data.posts && Array.isArray(data.posts)) {
        setPosts(data.posts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('記事の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  // 記事を作成
  const createPost = async (postData: FormData): Promise<void> => {
    try {
      const response = await fetch('http://localhost:3000/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      if (response.ok) {
        fetchPosts();
        resetForm();
      }
    } catch (error) {
      console.error('記事の作成に失敗しました:', error);
    }
  };

  // 記事を更新
  const updatePost = async (id: number, postData: FormData): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:3000/api/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      if (response.ok) {
        fetchPosts();
        resetForm();
      }
    } catch (error) {
      console.error('記事の更新に失敗しました:', error);
    }
  };

  // 記事を削除
  const deletePost = async (id: number): Promise<void> => {
    if (window.confirm('この記事を削除しますか？')) {
      try {
        const response = await fetch(`http://localhost:3000/api/blog/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchPosts();
        }
      } catch (error) {
        console.error('記事の削除に失敗しました:', error);
      }
    }
  };

  // フォームをリセット
  const resetForm = (): void => {
    setFormData({ title: '', description: '' });
    setEditingPost(null);
    setShowForm(false);
  };

  // 編集モードに切り替え
  const startEdit = (post: Post): void => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      description: post.description
    });
    setShowForm(true);
  };

  // フォーム送信
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (editingPost) {
      updatePost(editingPost.id, formData);
    } else {
      createPost(formData);
    }
  };

  // 初回読み込み
  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">ブログ記事管理</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {showForm ? 'キャンセル' : '新規記事作成'}
          </button>
        </div>

        {/* 記事作成・編集フォーム */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingPost ? '記事を編集' : '新規記事作成'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  内容
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {editingPost ? '更新' : '作成'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 記事一覧 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">記事一覧</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">読み込み中...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              記事がありません
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {posts.map((post: Post) => (
                <div key={post.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {post.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        作成日: {new Date(post.date).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => startEdit(post)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}