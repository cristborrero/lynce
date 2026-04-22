import { createClient } from "@/lib/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export const revalidate = 3600;

async function getPost(slug: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateStaticParams() {
  const supabase = createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("published", true);
  
  return (data || []).map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-background text-white selection:bg-accent selection:text-background font-sans pt-32 pb-16">
      <div className="hero-pulse" />
      
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="logo-accent">✦</span>
            <span className="logo">LYNCE</span>
          </Link>
          <nav className="flex gap-8 text-sm font-mono font-medium text-muted uppercase tracking-wider">
            <Link href="/blog" className="hover:text-white transition-colors">Intelligence</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 relative z-10">
        <Link 
          href="/blog"
          className="inline-flex items-center text-sm font-mono text-muted hover:text-white transition-colors mb-12 uppercase tracking-widest"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Archive
        </Link>
        
        <p className="text-xs font-mono text-accent mb-4 tracking-widest uppercase">
          {new Date(post.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter mb-16 leading-tight">{post.title}</h1>
        
        <div className="prose prose-invert prose-lg max-w-none 
          prose-headings:text-white prose-headings:tracking-tight prose-headings:font-semibold
          prose-p:text-muted prose-p:leading-relaxed 
          prose-strong:text-white prose-code:text-accent prose-code:bg-accent/5 prose-code:px-1 prose-code:rounded
          prose-pre:bg-white/[0.02] prose-pre:border prose-pre:border-white/5
          prose-blockquote:border-accent prose-blockquote:text-white/80">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        <div className="mt-24 p-12 border border-white/5 rounded-3xl bg-white/[0.02] relative overflow-hidden group">
          <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 text-center">
            <span className="section-label mb-4 block">Secure Your Asset</span>
            <h3 className="text-3xl font-semibold mb-6 tracking-tight">Ready to audit your site?</h3>
            <p className="text-muted text-lg mb-10 max-w-md mx-auto">Identify vulnerabilities before they become breaches. Start with a comprehensive enterprise scan.</p>
            <Link 
              href="/"
              className="btn-scan-now inline-block"
            >
              Analyze Now ✦
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
