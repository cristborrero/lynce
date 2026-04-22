import PricingSection from "@/components/PricingSection"
import { createClient } from "@/lib/supabase/server"

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let tier = "free"
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier")
      .eq("id", user.id)
      .single()
    tier = profile?.tier || "free"
  }

  return (
    <div className="bg-black min-h-screen pt-20">
      <PricingSection currentTier={tier} />
    </div>
  )
}
