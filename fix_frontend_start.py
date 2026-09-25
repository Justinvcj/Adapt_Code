import re

with open("frontend/src/app/(app)/problem/[id]/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

start_logic = """
  // Call backend to log start time
  useEffect(() => {
    if (problem) {
      const token = localStorage.getItem('access_token');
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ problem_id: problem.problem_id || problem.id })
      }).catch(err => console.error("Start telemetry failed", err));
    }
  }, [problem]);
"""

if "/api/start" not in content:
    content = content.replace("  const [showConfetti, setShowConfetti] = useState(false);", "  const [showConfetti, setShowConfetti] = useState(false);\n" + start_logic)

with open("frontend/src/app/(app)/problem/[id]/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated frontend to call /api/start.")
