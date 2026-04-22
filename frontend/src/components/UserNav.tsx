"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, LayoutDashboard, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function UserNav() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (!user) {
    return (
      <Link
        href="/auth"
        className="text-[11px] font-medium text-muted hover:text-white transition-colors uppercase tracking-[0.2em] font-mono"
      >
        Log in
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 text-[11px] font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-md transition-all font-mono uppercase tracking-[0.2em]"
      >
        <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center border border-accent/20 text-accent">
          <User className="h-3 w-3" />
        </div>
        <span className="hidden sm:inline truncate max-w-[120px]">
          {user.email?.split("@")[0]}
        </span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 bg-[#0D1117] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-white/5">
                <p className="text-[10px] text-muted font-mono uppercase tracking-widest truncate">
                  {user.email}
                </p>
              </div>
              <div className="p-1">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-medium text-muted hover:text-white hover:bg-white/5 rounded transition-colors uppercase tracking-widest font-mono"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-3 py-2 text-[11px] font-medium text-fail hover:bg-fail/10 rounded transition-colors uppercase tracking-widest font-mono"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
