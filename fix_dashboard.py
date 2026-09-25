import re

with open("frontend/src/app/(app)/dashboard/page.tsx", "r") as f:
    content = f.read()

# Add useRouter
content = content.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\nimport { useRouter } from 'next/navigation';")
content = content.replace("const [error, setError] = useState<boolean>(false);", "const [error, setError] = useState<boolean>(false);\n  const router = useRouter();\n  const [loadingNext, setLoadingNext] = useState(false);")

handle_next = """
  const handleResumePractice = async () => {
    setLoadingNext(true);
    try {
      const res = await fetchApi('/api/next-problem');
      if (res && res.id) {
        router.push(`/problem/${res.id}${res.hint_pre_expanded ? '?hint=1' : ''}`);
      } else {
        router.push('/problems');
      }
    } catch (e) {
      console.error(e);
      router.push('/problems');
    } finally {
      setLoadingNext(false);
    }
  };
"""

content = content.replace("export default function DashboardPage() {", f"export default function DashboardPage() {{{handle_next}")

old_link = """<Link href="/problems" className="bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-bold text-label-bold px-lg py-sm rounded-lg flex items-center gap-2 shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-[20px]" data-icon="play_arrow" data-weight="fill">play_arrow</span>
                Resume Practice
              </Link>"""

new_link = """<button onClick={handleResumePractice} disabled={loadingNext} className="bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-bold text-label-bold px-lg py-sm rounded-lg flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50">
                <span className="material-symbols-outlined text-[20px]" data-icon="play_arrow" data-weight="fill">
                  {loadingNext ? 'hourglass_empty' : 'play_arrow'}
                </span>
                {loadingNext ? 'Loading...' : 'Resume Practice'}
              </button>"""

content = content.replace(old_link, new_link)

with open("frontend/src/app/(app)/dashboard/page.tsx", "w") as f:
    f.write(content)

print("Modified dashboard to fetch next problem on resume practice.")
