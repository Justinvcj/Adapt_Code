with open("frontend/src/app/(app)/problem/[id]/page.tsx", "r") as f:
    content = f.read()

# N5: Add useSearchParams
content = content.replace(
    "import { useRouter } from 'next/navigation';",
    "import { useRouter, useSearchParams } from 'next/navigation';"
)

content = content.replace(
    "const router = useRouter();",
    "const router = useRouter();\n  const searchParams = useSearchParams();"
)

content = content.replace(
    "const [hintUsed, setHintUsed] = useState(false);",
    "const [hintUsed, setHintUsed] = useState(false);\n\n  useEffect(() => {\n    if (searchParams?.get('hint') === '1') {\n      setHintUsed(true);\n    }\n  }, [searchParams]);"
)

# N3: visibilitychange instead of sendBeacon
old_unload = """  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!solved && problem) {
        navigator.sendBeacon(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/abandon`, JSON.stringify({
          problem_id: problem.id,
          compile_error_count: compileErrors,
          time_on_task_seconds: (Date.now() - startTime) / 1000,
          attempt_count: attemptCount,
        }));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [solved, compileErrors, attemptCount, problem, startTime]);"""

new_unload = """  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !solved && problem) {
        const token = localStorage.getItem('access_token');
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/abandon`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            problem_id: problem.problem_id || problem.id,
            compile_error_count: compileErrors,
            time_on_task_seconds: (Date.now() - startTime) / 1000,
            attempt_count: attemptCount,
            hint_used: hintUsed,
          }),
          keepalive: true,
        }).catch(err => console.error("Abandon telemetry failed", err));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [solved, compileErrors, attemptCount, problem, startTime, hintUsed]);"""

content = content.replace(old_unload, new_unload)

# Fix hint button
content = content.replace(
    "onClick={() => setHintUsed(true)}",
    "onClick={handleHint}"
)

# Fix router.push to include hint_pre_expanded param
content = content.replace(
    "onClick={() => router.push('/problem/' + nextProblemInfo.id)}",
    "onClick={() => router.push('/problem/' + nextProblemInfo.id + (nextProblemInfo.hint_pre_expanded ? '?hint=1' : ''))}"
)

with open("frontend/src/app/(app)/problem/[id]/page.tsx", "w") as f:
    f.write(content)
print("Done fixing page.tsx")
