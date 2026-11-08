# Original User Request

## Initial Request — 2026-11-08T05:40:17Z

Perform a complete, detailed technical and non-technical analysis of AdaptCode, compare the local repository against GitHub for differences, investigate AWS and Google Cloud backend deployment configurations in the repository context, and audit for any existing problems, saving findings into a single comprehensive report.

Working directory: c:\Users\Justin\The Global Projects Folder\Adapt_Code
Integrity mode: demo
The team must NOT: modify any existing codebase files, run unneeded external scripts, or assume or speculate on missing details without explicit evidence in code or configurations

## Requirements

### R1. Comprehensive Combined Codebase Explanation
Analyze the entire codebase and write a combined technical and non-technical explanation of AdaptCode that is sufficiently detailed for another AI to understand the full architecture, components, and workflows and resume development from where it was left off.

### R2. Local vs. GitHub Codebase Comparison
Compare the local codebase with the remote GitHub repository (inspecting remotes, branches, and commit history as determined by the team) to identify and document all uncommitted changes, divergent commits, modified files, and differences between the environments.

### R3. Cloud Backend Deployment Investigation (AWS & Google Cloud)
Investigate the codebase, configuration files, environment templates, and commit history for evidence of backend deployments across Amazon Web Services (AWS) and Google Cloud Platform (GCP). Document deployment architectures, endpoints, service configurations, and deployment scripts found, and explicitly state "unknown" for any detail lacking concrete evidence in the repository.

### R4. Codebase Problem and Defect Audit
Audit the complete codebase for existing issues, including broken configurations, syntax or runtime errors, missing dependencies, security or credential concerns, and architectural defects, and catalog each identified problem.

### R5. Deliverable and Non-Destructive Constraints
Deliver all findings in a single comprehensive markdown document named `ADAPTCODE_ANALYSIS.md` in the repository root. Do not modify any existing codebase files, do not hallucinate or make things up, and explicitly state when information is unknown.

## Acceptance Criteria

### Codebase Explanation
- [ ] `ADAPTCODE_ANALYSIS.md` contains a non-technical overview explaining the product purpose, target users, and high-level concepts.
- [ ] `ADAPTCODE_ANALYSIS.md` contains an in-depth technical explanation covering architecture, directory structure, module responsibilities, tech stack, data flows, and onboarding/setup instructions for another AI.

### Local vs GitHub Comparison
- [ ] `ADAPTCODE_ANALYSIS.md` documents the detected GitHub remote URL, target branch, and tracking status.
- [ ] All local uncommitted changes, modified/added/deleted files, and divergent commits relative to the GitHub remote are itemized.

### Cloud Deployment Audit
- [ ] `ADAPTCODE_ANALYSIS.md` reports all identified backend deployment configurations, infrastructure files, and deployment history for AWS and GCP.
- [ ] Any missing deployment credentials, endpoints, or hosting details are explicitly marked as unknown rather than assumed.

### Problem Audit
- [ ] `ADAPTCODE_ANALYSIS.md` includes a categorized list of all identified issues, bugs, and configuration discrepancies across the codebase.

### Integrity and Safety
- [ ] No pre-existing codebase files are modified or deleted; only `ADAPTCODE_ANALYSIS.md` is added.
- [ ] All claims trace directly to verified repository files, git diffs, or commit logs without speculation.
