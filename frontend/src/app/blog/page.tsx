import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const revalidate = 3600; // revalidate every hour

async function getPosts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
  return data;
}

export default async function BlogPage() {
  const posts = await getPosts();

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
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="mb-20">
          <span className="section-label mb-4 block">Archive</span>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-6">Security Insights</h1>
          <p className="text-muted text-xl max-w-2xl">
            Deep dives into the latest WordPress vulnerabilities, security best practices, and enterprise auditing techniques.
          </p>
        </div>
        
        <div className="space-y-24">
          {posts.map((post) => (
            <article key={post.slug} className="group relative">
              <div className="absolute -inset-x-6 -inset-y-8 rounded-2xl bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <p className="text-xs font-mono text-accent mb-4 tracking-widest uppercase">{post.date}</p>
                <h2 className="text-3xl md:text-4xl font-semibold mb-4 leading-tight">
                  <Link href={`/blog/${post.slug}`} className="hover:text-accent transition-colors">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-lg text-muted mb-8 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
                <Link 
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-sm font-mono font-bold uppercase tracking-widest group/link"
                >
                  Read Intelligence <ArrowRight className="ml-2 h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
