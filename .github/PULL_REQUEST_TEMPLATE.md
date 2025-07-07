# ICUPA PWA Refactor PR Template

## Checklist (MUST be checked before merge)
- [ ] No hallucinated data, screens, or behaviors
- [ ] No task marked done until verified in the running PWA
- [ ] No changes beyond explicit requirements
- [ ] Mobile-first for Rwanda and Malta only; payments: MoMo USSD (RWA), Revolut link (MLT)
- [ ] WhatsApp Business API, Firebase/Firestore, and Supabase respected
- [ ] OpenAI Agent SDK and GPT-4o maximized in all AI components
- [ ] TypeScript strict mode everywhere; zero `any`
- [ ] Zero TypeScript errors and ESLint warnings in CI
- [ ] All critical user journeys pass Playwright tests
- [ ] Mobile Lighthouse PWA score ≥ 95
- [ ] Supabase migrations run clean on a fresh database
- [ ] OpenAI agents produce structured JSON outputs and respect HITL workflow
- [ ] No regressions detected by regression test suite

## Description
<!-- What does this PR change/fix? Link to relevant tasks/sections. -->

## Verification Steps
- [ ] Deployed to staging and shared URL
- [ ] Lighthouse, Playwright, and Vitest reports attached
- [ ] Changelog and migration guide provided
- [ ] Awaited stakeholder UAT sign-off before merging to `main` 