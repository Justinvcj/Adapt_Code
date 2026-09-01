import Link from 'next/link';

export default function InterviewPrepPage() {
  return (
    <>
      

<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
<div>
<h1 className="font-headline-lg text-headline-lg mb-xs">Interview Preparation</h1>
<p className="text-on-surface-variant font-body-lg text-body-lg">Curated questions and company-specific assessments.</p>
</div>
<button className="bg-primary-container text-on-primary-container font-label-bold text-label-bold px-lg py-sm rounded-DEFAULT hover:bg-primary transition-colors flex items-center gap-sm">
<span className="material-symbols-outlined" data-weight="fill">videocam</span>
                Start Mock Interview
            </button>
</div>

<div className="flex border-b border-border-default mb-lg">
<button className="px-md py-sm font-label-bold text-label-bold text-primary border-b-2 border-primary">Online Assessment</button>
<button className="px-md py-sm font-label-bold text-label-bold text-on-surface-variant hover:text-primary transition-colors">Phone Screen</button>
<button className="px-md py-sm font-label-bold text-label-bold text-on-surface-variant hover:text-primary transition-colors">Onsite</button>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">

<div className="lg:col-span-8 flex flex-col gap-md">
<div className="bg-surface-elevated border border-border-default rounded-lg p-md">
<h2 className="font-headline-md text-headline-md mb-md">Top Interview Questions</h2>
<div className="flex flex-col gap-sm">

<div className="flex items-center justify-between p-sm rounded-DEFAULT hover:bg-surface-secondary transition-colors border-b border-border-default last:border-b-0 cursor-pointer group">
<div className="flex items-center gap-md">
<span className="text-on-surface-variant font-code-md w-8">1.</span>
<span className="font-body-md text-body-md group-hover:text-secondary-fixed-dim transition-colors">Two Sum</span>
</div>
<div className="flex items-center gap-md">
<span className="bg-easy/10 text-easy font-label-bold text-label-bold px-sm py-xs rounded-full">Easy</span>
<span className="text-on-surface-variant font-code-sm text-code-sm">Freq: High</span>
</div>
</div>

<div className="flex items-center justify-between p-sm rounded-DEFAULT hover:bg-surface-secondary transition-colors border-b border-border-default last:border-b-0 cursor-pointer group">
<div className="flex items-center gap-md">
<span className="text-on-surface-variant font-code-md w-8">42.</span>
<span className="font-body-md text-body-md group-hover:text-secondary-fixed-dim transition-colors">Trapping Rain Water</span>
</div>
<div className="flex items-center gap-md">
<span className="bg-hard/10 text-hard font-label-bold text-label-bold px-sm py-xs rounded-full">Hard</span>
<span className="text-on-surface-variant font-code-sm text-code-sm">Freq: High</span>
</div>
</div>

<div className="flex items-center justify-between p-sm rounded-DEFAULT hover:bg-surface-secondary transition-colors border-b border-border-default last:border-b-0 cursor-pointer group">
<div className="flex items-center gap-md">
<span className="text-on-surface-variant font-code-md w-8">200.</span>
<span className="font-body-md text-body-md group-hover:text-secondary-fixed-dim transition-colors">Number of Islands</span>
</div>
<div className="flex items-center gap-md">
<span className="bg-medium/10 text-medium font-label-bold text-label-bold px-sm py-xs rounded-full">Medium</span>
<span className="text-on-surface-variant font-code-sm text-code-sm">Freq: Med</span>
</div>
</div>
</div>
</div>
</div>

<div className="lg:col-span-4 flex flex-col gap-md">
<h3 className="font-headline-sm text-headline-sm">Company Specific</h3>

<div className="bg-surface-elevated border border-border-default rounded-lg p-md hover:border-border-hover transition-colors cursor-pointer group flex items-center gap-md">
<div className="w-12 h-12 rounded-DEFAULT bg-surface-secondary border border-border-default flex items-center justify-center overflow-hidden">
<img alt="Google Logo" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" data-alt="A minimalist, highly abstracted 'G' logo placeholder, rendered in flat, vibrant primary colors, set against a dark grey background to fit a developer tool aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3zQCdyInhk5CPzejdRdj86w-RqaPj2NSK56necW7AJbxUjo8QY1eMktvp2WzAupKl71uEcB6YoSKAQAnGBtrG7W0UISQ91HwivPp7w2fCCDUyS9uDWJGz4ofVY2WKYAUX2-tF3GMFH5V7BmISVViiNmrzsM-zpACXNvhy6WhD02YyvCkcrgtUIhdgt_7M0qT2yd3_1ozLI2hMoneLLFBOEb0-2JFNEAMcKwZk6TREJS252W3lUDbE"/>
</div>
<div>
<h4 className="font-label-bold text-label-bold group-hover:text-secondary-fixed-dim transition-colors">Google</h4>
<p className="text-on-surface-variant font-body-sm text-code-sm mt-xs">1,245 Problems</p>
</div>
</div>

<div className="bg-surface-elevated border border-border-default rounded-lg p-md hover:border-border-hover transition-colors cursor-pointer group flex items-center gap-md">
<div className="w-12 h-12 rounded-DEFAULT bg-surface-secondary border border-border-default flex items-center justify-center overflow-hidden">
<img alt="Meta Logo" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" data-alt="A stylized infinity symbol logo placeholder in a vibrant electric blue, representing a major tech company, placed on a dark slate background, designed for a modern UI." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVUN5_W-p0GiOOdM4SDT5dSCxWuvccQnfPbVgTGQ_AoEdmtjZnUDPYG2TZCDJCN8iVYTDauEeaEmcd-LZFa8UqXALVUfiiI8L96j0Umz-sFD0fXvUtKC4QaV9fAG5UuSziZ8LvD53s6hmA6bTimi3-jQEyXPkExeUJGt6rF2XLcBklJPfPOyEZ6cVentTN8AcWzoqjrCggU1P_qPR16cCW_rlrIjcz7gIkhwAtkW4fEy48QCdjeTht"/>
</div>
<div>
<h4 className="font-label-bold text-label-bold group-hover:text-secondary-fixed-dim transition-colors">Meta</h4>
<p className="text-on-surface-variant font-body-sm text-code-sm mt-xs">890 Problems</p>
</div>
</div>
<button className="w-full py-sm border border-border-default rounded-DEFAULT text-on-surface-variant font-label-bold text-label-bold hover:bg-surface-secondary transition-colors">View All Companies</button>
</div>
</div>

    </>
  );
}