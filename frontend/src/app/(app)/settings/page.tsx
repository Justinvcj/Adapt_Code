import Link from 'next/link';

export default function SettingsPage() {
  return (
    <>
      

<section className="bg-surface-elevated border border-border-default rounded-xl overflow-hidden shadow-sm">
<div className="px-lg py-md border-b border-border-default bg-surface-secondary/50">
<h2 className="font-headline-sm text-headline-sm text-text-primary">General Information</h2>
<p className="font-body-md text-body-md text-on-surface-variant text-sm">Basic info to identify your account.</p>
</div>
<div className="flex flex-col">

<div className="flex items-center justify-between px-lg py-md border-b border-border-default hover:bg-surface-secondary/30 transition-colors group">
<div className="w-1/3">
<span className="font-label-bold text-label-bold text-on-surface-variant">AdaptCode ID</span>
</div>
<div className="w-2/3 flex items-center justify-between">
<span className="font-body-md text-body-md text-text-primary font-code-md">usr_9842aB7</span>
<button className="text-primary hover:text-primary-container font-label-bold text-label-bold opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>
</div>
</div>

<div className="flex items-center justify-between px-lg py-md border-b border-border-default hover:bg-surface-secondary/30 transition-colors group">
<div className="w-1/3">
<span className="font-label-bold text-label-bold text-on-surface-variant">Email Address</span>
</div>
<div className="w-2/3 flex items-center justify-between">
<span className="font-body-md text-body-md text-text-primary">dev.user@example.com</span>
<button className="px-md py-sm border border-border-default rounded-lg hover:border-border-hover text-text-primary font-label-bold text-label-bold transition-colors">Edit</button>
</div>
</div>

<div className="flex items-center justify-between px-lg py-md border-b border-border-default hover:bg-surface-secondary/30 transition-colors group">
<div className="w-1/3">
<span className="font-label-bold text-label-bold text-on-surface-variant">Phone Number</span>
</div>
<div className="w-2/3 flex items-center justify-between">
<span className="font-body-md text-body-md text-on-surface-variant italic">Not provided</span>
<button className="px-md py-sm border border-border-default rounded-lg hover:border-border-hover text-text-primary font-label-bold text-label-bold transition-colors">Add</button>
</div>
</div>

<div className="flex items-center justify-between px-lg py-md hover:bg-surface-secondary/30 transition-colors group">
<div className="w-1/3 flex flex-col">
<span className="font-label-bold text-label-bold text-on-surface-variant">Password</span>
<span className="text-xs text-on-surface-variant mt-1">Last updated 3 months ago</span>
</div>
<div className="w-2/3 flex items-center justify-between">
<span className="font-body-md text-body-md text-text-primary tracking-[0.2em] mt-1">••••••••••••</span>
<button className="px-md py-sm border border-border-default rounded-lg hover:border-border-hover text-text-primary font-label-bold text-label-bold transition-colors">Change</button>
</div>
</div>
</div>
</section>

<section className="bg-surface-elevated border border-border-default rounded-xl overflow-hidden shadow-sm">
<div className="px-lg py-md border-b border-border-default bg-surface-secondary/50">
<h2 className="font-headline-sm text-headline-sm text-text-primary">Social Accounts</h2>
<p className="font-body-md text-body-md text-on-surface-variant text-sm">Connected third-party logins.</p>
</div>
<div className="flex flex-col">

<div className="flex items-center justify-between px-lg py-md border-b border-border-default">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded bg-[#24292e] flex items-center justify-center text-white">

<span className="font-label-bold text-label-bold">GH</span>
</div>
<div className="flex flex-col">
<span className="font-label-bold text-label-bold text-text-primary">GitHub</span>
<span className="font-body-md text-body-md text-on-surface-variant text-sm">Connected as @devuser</span>
</div>
</div>
<button className="px-md py-sm border border-border-default rounded-lg text-on-error-container hover:bg-error-container/20 hover:border-error-container transition-colors font-label-bold text-label-bold">Disconnect</button>
</div>

<div className="flex items-center justify-between px-lg py-md">
<div className="flex items-center gap-md">
<div className="w-10 h-10 rounded bg-white flex items-center justify-center text-black">
<span className="font-label-bold text-label-bold">G</span>
</div>
<div className="flex flex-col">
<span className="font-label-bold text-label-bold text-text-primary">Google</span>
<span className="font-body-md text-body-md text-on-surface-variant text-sm">dev.user@gmail.com</span>
</div>
</div>
<button className="px-md py-sm border border-border-default rounded-lg text-on-error-container hover:bg-error-container/20 hover:border-error-container transition-colors font-label-bold text-label-bold">Disconnect</button>
</div>
</div>
</section>
<div className="flex justify-end mt-sm">
<button className="bg-primary-container text-on-primary-container hover:bg-primary font-label-bold text-label-bold px-xl py-sm rounded-lg transition-colors">Save Changes</button>
</div>

    </>
  );
}