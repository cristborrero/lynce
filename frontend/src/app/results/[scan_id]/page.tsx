import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResultsUI } from "./ResultsUI";

const fetchScanResults = async (scanId: string, token?: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  const res = await fetch(`${apiUrl}/scan/${scanId}`, { 
    cache: "no-store",
    headers: token ? { "Authorization": `Bearer ${token}` } : {}
  });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch scan results: ${res.status} ${res.statusText}`);
  }
  return res.json();
};

export default async function ResultsPage({ params }: { params: Promise<{ scan_id: string }> }) {
  const { scan_id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const data = await fetchScanResults(scan_id, session?.access_token);
  const user = session?.user || null;

  if (!data) {
    notFound();
  }

  const { scan, findings } = data;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  return (
    <ResultsUI 
      scan={scan} 
      findings={findings} 
      user={user} 
      accessToken={session?.access_token}
      apiUrl={apiUrl} 
    />
  );
}
