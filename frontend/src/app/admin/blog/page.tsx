"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Save, 
  X,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

// MD Editor needs to be client-side only
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  author: string;
  created_at: string;
}

export default function BlogAdminPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    published: false
  });

  const checkAdmin = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      router.push("/");
      return;
    }

    setIsAdmin(true);
    fetchPosts();
  }, [supabase, router]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  const handleSave = async () => {
    if (!currentPost.title || !currentPost.slug) return;

    const payload = {
      ...currentPost,
      updated_at: new Date().toISOString()
    };

    if (currentPost.id) {
      const { error } = await supabase
        .from("blog_posts")
        .update(payload)
        .eq("id", currentPost.id);
      
      if (error) alert(error.message);
    } else {
      const { error } = await supabase
        .from("blog_posts")
        .insert([payload]);
      
      if (error) alert(error.message);
    }

    setIsEditing(false);
    setCurrentPost({ title: "", slug: "", excerpt: "", content: "", published: false });
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this intelligence report?")) return;
    
    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);
    
    if (error) alert(error.message);
    fetchPosts();
  };

  const togglePublish = async (post: BlogPost) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({ published: !post.published })
      .eq("id", post.id);
    
    if (error) alert(error.message);
    fetchPosts();
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white p-8 pt-32">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <Link href="/" className="text-xs font-mono text-muted hover:text-white flex items-center gap-2 mb-4 uppercase tracking-widest">
              <ArrowLeft className="h-3 w-3" /> Back to Terminal
            </Link>
            <h1 className="text-4xl font-semibold tracking-tighter">Blog Intelligence CMS</h1>
          </div>
          <button 
            onClick={() => {
              setCurrentPost({ title: "", slug: "", excerpt: "", content: "", published: false });
              setIsEditing(true);
            }}
            className="btn-scan-now flex items-center gap-2 px-6"
          >
            <Plus className="h-4 w-4" /> New Intelligence
          </button>
        </header>

        {isEditing ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{currentPost.id ? "Edit Report" : "Create New Intelligence"}</h2>
              <button onClick={() => setIsEditing(false)} className="text-muted hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted uppercase tracking-widest">Title</label>
                <input 
                  type="text" 
                  value={currentPost.title}
                  onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-white"
                  placeholder="The Breach of 2026..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted uppercase tracking-widest">Slug</label>
                <input 
                  type="text" 
                  value={currentPost.slug}
                  onChange={(e) => setCurrentPost({ ...currentPost, slug: e.target.value })}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent text-white"
                  placeholder="the-breach-2026"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-muted uppercase tracking-widest">Excerpt</label>
              <textarea 
                value={currentPost.excerpt}
                onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 h-24 focus:outline-none focus:border-accent text-white"
                placeholder="Brief summary for the archive..."
              />
            </div>

            <div className="space-y-2" data-color-mode="dark">
              <label className="text-xs font-mono text-muted uppercase tracking-widest mb-2 block">Intelligence Content (Markdown)</label>
              <MDEditor
                value={currentPost.content}
                onChange={(val) => setCurrentPost({ ...currentPost, content: val || "" })}
                preview="edit"
                height={400}
                className="rounded-xl overflow-hidden border border-white/10"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 border border-white/10 rounded-xl text-sm font-mono uppercase tracking-widest hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="btn-scan-now px-8 py-3 rounded-xl flex items-center gap-2"
              >
                <Save className="h-4 w-4" /> Save Intel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
                <AlertCircle className="h-12 w-12 text-muted mx-auto mb-4 opacity-20" />
                <p className="text-muted font-mono tracking-widest uppercase text-sm">No intelligence records found</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="group flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-accent/20 transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                      {post.published ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                          <CheckCircle2 className="h-2 w-2" /> Live
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-muted bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-muted tracking-wide uppercase opacity-50">/{post.slug}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => togglePublish(post)}
                      className="p-2 hover:text-accent transition-colors"
                      title={post.published ? "Unpublish" : "Publish"}
                    >
                      {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button 
                      onClick={() => {
                        setCurrentPost(post);
                        setIsEditing(true);
                      }}
                      className="p-2 hover:text-accent transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="p-2 hover:text-critical transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
