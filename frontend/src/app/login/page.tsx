import Link from 'next/link';

export default function LoginPage() {
  return (
    <>
      

<div className="w-full max-w-md bg-surface-elevated border border-border-default rounded-xl p-xl shadow-2xl backdrop-blur-md relative overflow-hidden">

<div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-container/10 rounded-full blur-3xl pointer-events-none"></div>

<div className="text-center mb-xl">
<h1 className="font-headline-lg text-headline-lg text-primary mb-sm tracking-tight">AdaptCode</h1>
<p className="font-body-md text-body-md text-on-surface-variant">Sign in to continue solving problems.</p>
</div>

<form className="space-y-md">
<div>
<label className="block font-label-bold text-label-bold text-on-surface-variant mb-xs" htmlFor="email">Email / Username</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-sm top-1/2 transform -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>person</span>
<input className="w-full bg-surface-elevated border border-border-default rounded text-text-primary placeholder-on-surface-variant/50 pl-lg py-sm font-body-md text-body-md focus:outline-none input-glow transition-all" id="email" placeholder="Enter your email" type="text"/>
</div>
</div>
<div>
<label className="block font-label-bold text-label-bold text-on-surface-variant mb-xs" htmlFor="password">Password</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-sm top-1/2 transform -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>lock</span>
<input className="w-full bg-surface-elevated border border-border-default rounded text-text-primary placeholder-on-surface-variant/50 pl-lg py-sm font-body-md text-body-md focus:outline-none input-glow transition-all" id="password" placeholder="Enter password" type="password"/>
</div>
</div>
<div className="flex items-center justify-between mt-sm">
<label className="flex items-center space-x-xs cursor-pointer group">
<input className="form-checkbox bg-surface-elevated border-border-default rounded text-primary-container focus:ring-primary-container focus:ring-offset-surface-elevated focus:ring-offset-2" type="checkbox"/>
<span className="font-body-md text-body-md text-on-surface-variant group-hover:text-text-primary transition-colors">Remember me</span>
</label>
<a className="font-body-md text-body-md text-primary-container hover:text-primary transition-colors" href="#">Forgot password?</a>
</div>
<button className="w-full bg-success text-surface-container-lowest font-headline-sm text-headline-sm py-sm rounded hover:bg-opacity-90 transition-all mt-lg font-bold" type="submit">
                Sign In
            </button>
</form>
<div className="mt-lg relative flex items-center justify-center">
<hr className="w-full border-border-default absolute"/>
<span className="bg-surface-elevated px-sm font-label-bold text-label-bold text-on-surface-variant relative z-10 uppercase tracking-widest">or continue with</span>
</div>

<div className="mt-lg flex space-x-md">
<button className="flex-1 flex items-center justify-center space-x-sm bg-surface-elevated border border-border-default py-sm rounded hover:border-border-hover hover:bg-surface-secondary transition-all group">
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-text-primary transition-colors" data-weight="fill">language</span>
<span className="font-label-bold text-label-bold text-on-surface-variant group-hover:text-text-primary transition-colors">Google</span>
</button>
<button className="flex-1 flex items-center justify-center space-x-sm bg-surface-elevated border border-border-default py-sm rounded hover:border-border-hover hover:bg-surface-secondary transition-all group">
<span className="material-symbols-outlined text-on-surface-variant group-hover:text-text-primary transition-colors" data-weight="fill">code</span>
<span className="font-label-bold text-label-bold text-on-surface-variant group-hover:text-text-primary transition-colors">GitHub</span>
</button>
</div>
<div className="mt-xl text-center">
<p className="font-body-md text-body-md text-on-surface-variant">Don't have an account? <a className="text-primary-container hover:text-primary transition-colors font-bold" href="#">Sign up free</a></p>
</div>
</div>

    </>
  );
}