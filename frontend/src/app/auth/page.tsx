import { login, signup, signInWithMagicLink } from './actions'
import { Logo } from "@/components/ui/Logo"

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams.error as string | undefined;
  const message = resolvedSearchParams.message as string | undefined;

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md p-10 bg-card border border-card-border rounded-2xl relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-8">
            <Logo className="text-3xl" />
          </div>
          <h1 className="hero-headline !text-2xl mb-2">Welcome Back.</h1>
          <p className="subheadline !text-sm">
            Enter your credentials to access your security dashboard.
          </p>
        </div>

        <div className="space-y-6">
          {error && <div className="text-fail text-xs font-mono p-4 bg-fail/5 border border-fail/20 rounded-md uppercase tracking-wider">{error}</div>}
          {message && <div className="text-pass text-xs font-mono p-4 bg-pass/5 border border-pass/20 rounded-md uppercase tracking-wider">{message}</div>}
          
          <form className="space-y-6 text-left">
            <div className="space-y-3">
              <label className="code-text !text-[10px] !tracking-[0.2em] font-bold">EMAIL ADDRESS</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="ops@lynce.io" 
                required 
                className="w-full h-12 bg-background border border-card-border rounded-md px-4 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-30"
              />
            </div>
            <div className="space-y-3">
              <label className="code-text !text-[10px] !tracking-[0.2em] font-bold">PASSWORD</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="w-full h-12 bg-background border border-card-border rounded-md px-4 text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button formAction={login} className="btn-scan-now !h-12 !text-[11px]">SIGN IN</button>
              <button formAction={signup} className="h-12 rounded-md border border-card-border text-[11px] font-bold uppercase tracking-widest hover:border-accent hover:text-accent transition-all font-mono">SIGN UP</button>
            </div>
            
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-card-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-[0.3em]">
                <span className="bg-card px-4 text-muted">
                  Or
                </span>
              </div>
            </div>
            
            <button 
              formAction={signInWithMagicLink} 
              className="w-full h-12 bg-white/5 border border-white/10 rounded-md text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all font-mono"
            >
              Send Magic Link
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
