# Learnings

<!--
Record DISCOVERIES here - things that surprised you.
Format: brief, actionable insights (not session logs).

Examples:
- "Auth header requires 'Bearer ' prefix with trailing space"
- "JSON.parse throws on empty string - use try/catch"
- "The /api/v2 endpoint returns dates as Unix timestamps, not ISO"

DO NOT add established knowledge here - that goes in rules/*.md
-->

- Copying node_modules from another directory breaks .bin symlinks. Must rm -rf node_modules && npm install after copying a scaffolded project.
- Next.js 16.1.6 uses Turbopack by default for builds.
