import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, CreditCard, Key, History, Plus } from "lucide-react"
import { format } from "date-fns"
import { Navbar } from "@/components/Navbar"
import { TypographyDemo } from "@/components/TypographyDemo"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Fetch History (directly from DB)
  const { data: history } = await supabase
    .from("scans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  const tier = profile?.tier || "free"

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-32 space-y-8 px-4 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Welcome, {user.email?.split('@')[0]}</h1>
          <p className="text-muted-foreground">Manage your security scans and subscription.</p>
        </div>
        <Link href="/">
           <Button className="gap-2">
             <Plus className="h-4 w-4" /> New Security Audit
           </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Tier Card */}
        <Card className="bg-black/40 border-[#1a1a1a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold uppercase">{tier}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {tier === "free" ? "3 scans/month" : tier === "pro" ? "Unlimited Scans + PDF" : "Unlimited + API + White-label"}
            </p>
          </CardContent>
          <CardFooter>
            {tier === "free" && (
              <Link href="/pricing" className="w-full">
                <Button variant="secondary" className="w-full h-8 text-xs">Upgrade to Pro</Button>
              </Link>
            )}
          </CardFooter>
        </Card>

        {/* Scans Card */}
        <Card className="bg-black/40 border-[#1a1a1a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scans Performed</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{history?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total audits run on your sites</p>
          </CardContent>
        </Card>

        {/* API Access Card */}
        <Card className="bg-black/40 border-[#1a1a1a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Access</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {tier === "agency" ? (
               <div className="text-xs font-mono bg-zinc-900 p-2 rounded truncate">
                 {profile?.api_key || "No key generated"}
               </div>
             ) : (
               <div className="text-muted-foreground text-sm italic">Agency Tier Required</div>
             )}
          </CardContent>
          <CardFooter>
             {tier === "agency" && (
                <Button variant="outline" className="w-full h-8 text-xs">Rotate API Key</Button>
             )}
          </CardFooter>
        </Card>
      </div>

      {/* History Table */}
      <Card className="bg-black/40 border-[#1a1a1a]">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your last 10 security audits.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-[#1a1a1a]">
            {history && history.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1a1a1a] bg-zinc-950/50">
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">URL</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Date</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Score</th>
                    <th className="h-10 px-4 text-right font-medium text-muted-foreground">Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {history.map((scan) => (
                    <tr key={scan.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-4 font-mono truncate max-w-[200px]">{scan.target_url}</td>
                      <td className="p-4">{format(new Date(scan.created_at), "MMM d, yyyy")}</td>
                      <td className="p-4">
                        <Badge variant={scan.score >= 80 ? "default" : scan.score >= 50 ? "secondary" : "destructive"}>
                           {scan.score}/100
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/results/${scan.id}`} className="text-primary hover:underline font-medium">
                          Details &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-muted-foreground italic">No scans run yet.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="pt-8">
        <h2 className="section-label mb-8">Typography System</h2>
        <TypographyDemo />
      </div>
    </div>
  )
}
