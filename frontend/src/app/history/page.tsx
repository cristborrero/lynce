import Link from "next/link";
import { format } from "date-fns";

const fetchHistory = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  const res = await fetch(`${apiUrl}/scan/history`, { cache: "no-store" });
  if (!res.ok) {
    return [];
  }
  return res.json();
};

export default async function HistoryPage() {
  const history = await fetchHistory();

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#50e3c2";
    if (score >= 70) return "#f5a623";
    if (score >= 50) return "#f5a623";
    return "#ff4444";
  };

  return (
    <div className="max-w-[960px] mx-auto py-24 px-6 bg-black min-h-screen">
      <div className="flex justify-between items-end border-b border-[#1a1a1a] pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Scan History</h1>
          <p className="text-sm text-[#888888]">Recent security audits run on the platform.</p>
        </div>
        <Link 
          href="/" 
          className="flex items-center h-10 px-4 text-sm font-medium bg-white border border-[#333333] text-black hover:bg-[#e6e6e6] rounded-md transition-colors"
        >
          New Scan
        </Link>
      </div>

      <div className="rounded-lg border border-[#1a1a1a] overflow-hidden bg-[#0a0a0a]">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#111111] border-b border-[#1a1a1a]">
            <tr>
              <th className="px-6 py-4 font-medium text-[#888888]">Target URL</th>
              <th className="px-6 py-4 font-medium text-[#888888]">Date</th>
              <th className="px-6 py-4 font-medium text-[#888888]">Health</th>
              <th className="px-6 py-4 font-medium text-[#888888] text-right">Report</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {history.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[#888888]">
                  No scans found.
                </td>
              </tr>
            ) : (
              history.map((scan: { id: string; target_url: string; created_at: string; score: number }) => (
                <tr key={scan.id} className="hover:bg-[#111] transition-colors group">
                  <td className="px-6 py-4 font-mono text-white tracking-tight">{scan.target_url}</td>
                  <td className="px-6 py-4 text-[#888888]">
                    {format(new Date(scan.created_at), "MMM d, yyyy h:mm a")}
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-[#1a1a1a]"
                      style={{ color: getScoreColor(scan.score) }}
                    >
                      {scan.score}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/results/${scan.id}`} 
                      className="text-sm font-medium text-[#888888] group-hover:text-white transition-colors"
                    >
                      View &rarr;
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
