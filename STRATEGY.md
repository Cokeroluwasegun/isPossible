# Greenscape Pro — AI Agent Strategy

**Client:** Greenscape Pro (Phoenix, AZ)  
**Revenue:** $4.2M → targeting $5.5M  
**Avg Project:** $28K | **Projects/Year:** ~150  
**Prepared by:** isthispossible.ai Auditor  
**Date:** 2026

---

## Executive Summary

The discovery call revealed a clear bottleneck hierarchy. Marcus (Founder/CEO) is the single point of failure for proposal generation, and the 6–9 day quote cycle loses 35–40% of qualified leads to faster competitors. This document ranks 5 AI agents by ROI, with the P0 already built and deployed.

---

## 1. Quote Generation Agent (P0) — **BUILT & DEPLOYED**

**Purpose:** Convert site walk transcripts into accurate, priced proposals in minutes instead of days.

**What it does:**
- Ingests site walk transcript + photos + lead context
- Maps scope to 69-item pricing catalog with markup rules
- Outputs structured line items, totals, timeline, permit/HOA flags
- Human-in-the-loop: Draft → Marcus Review → Approve/Request Changes → Send (Stripe deposit + DocuSign)

**Replaces/Unblocks:**
- Marcus manually drafting every proposal (6–9 days → <30 min)
- Carlos waiting for brief to produce 3D renders
- Pricing spreadsheet lookups and calculation errors

**Estimated ROI:**
- **Revenue recovered:** 35–40% of 150 qualified leads × $28K = **$1.5M–$1.7M/yr**
- **Time saved:** Marcus ~15 hrs/week → redeployed to site walks (his 70% close channel)
- **Per-proposal cost:** ~$0.02 (Groq llama-3.1-70b)

**Why #1:** Directly attacks the single highest-leverage constraint. The auditor's math: compressing quote cycle from 6–9 days to 1–2 days is the highest-ROI intervention in the business.

---

## 2. Post-Sign Workflow Agent

**Purpose:** Automate the 2–6 week "post-sign limbo" (HOA submissions, permit tracking, deposit collection).

**What it does:**
- Triggers on proposal signed → kicks off parallel tracks
- **HOA Track:** Auto-generates HOA packet from proposal scope, emails customer with submission checklist, follows up weekly until approval
- **Permit Track:** Identifies required permits from line items, prepares packages, tracks city status, alerts on revisions
- **Deposit Track:** Sends Stripe deposit link, follows up daily until paid, notifies Jenna/Marcus when cleared
- Dashboard for Jenna showing all active projects with status badges and next actions

**Replaces/Unblocks:**
- Jenna manually chasing 8–12 projects in limbo (5–10 Slack pings/day)
- HOA delays (3–4 weeks → automated follow-up)
- Permit revision cycles (manual tracking → automated alerts)
- Deposit collection (manual chase → automated reminders)

**Estimated ROI:**
- **Revenue accelerated:** $224K–$336K in delayed revenue at any time
- **Cycle time reduction:** 2–6 weeks → 1–3 weeks (conservative)
- **Jenna time saved:** ~10 hrs/week

**Why #2:** Operationally significant but not Marcus's stated priority. 8–12 projects × $28K = $224K–$336K delayed revenue compounding. Automated follow-up sequences directly reduce Jenna's manual load and accelerate cash collection.

---

## 3. Customer Communication Agent

**Purpose:** Eliminate "radio silence" during build → reduce anxiety calls, drive referrals.

**What it does:**
- Subscribes to CompanyCam photo uploads + Jobber milestone completions
- Generates Marcus-voiced progress updates (text + optional AI voice) at key milestones: Demo complete, Base prep, Hardscape install, Planting, Final walk
- Sends via SMS/email through GHL; customer can reply with questions
- Flags sentiment: if customer replies with concern, alerts Marcus/Jenna immediately

**Replaces/Unblocks:**
- Inconsistent crew lead texts / CompanyCam-only updates
- Marcus's Loom updates (only 30% of jobs) → 100% coverage
- Customer anxiety calls to Jenna (daily occurrences)

**Estimated ROI:**
- **Referral lift:** Marcus gets referrals from Loom updates; 100% coverage → estimated 2–3 extra referrals/yr × $28K = **$56K–$84K/yr**
- **Jenna time saved:** ~5 hrs/week fewer inbound anxiety calls
- **Brand differentiation:** "Only contractor who kept us informed"

**Why #3:** High-signal, low-cost. The auditor noted: when Marcus sends Looms, customers love it and refer. Automating this with his voice/brand captures that value at scale.

---

## 4. Closed-Lost Lead Reactivation Agent

**Purpose:** Systematically re-engage 1,400+ closed-lost leads in Marcus's voice.

**What it does:**
- Quarterly campaigns pulling from GHL: leads lost >90 days ago
- Context-aware messages: references original project type, budget, notes
- Channel: SMS (GHL) + email; feels personal, not blast
- Tracks replies → routes hot leads to Marcus for call booking
- A/B tests messaging variants (seasonal, "still thinking?", "new portfolio")

**Replaces/Unblocks:**
- Brittany's sporadic, non-systematic re-engagement blasts
- Manual personalization (doesn't scale)

**Estimated ROI:**
- **Latent revenue:** 1,400 leads × 2% re-close × $28K = **$784K/yr** (conservative)
- **Cost per reactivated deal:** <$5 in API costs
- **Brittany time saved:** ~2 hrs/week

**Why #4:** High latent value, low risk. Auditor math: even 2% re-close = 28 deals. Personal-feeling AI messages in Marcus's voice outperform blasts (validated by his occasional manual successes).

---

## 5. Lead Pre-Qualification Agent

**Purpose:** Filter tire-kickers before they hit Marcus's calendar.

**What it does:**
- Triggers on new GHL lead (Meta form / Google LSA call)
- SMS/voice conversation: 4–5 qualifying questions (budget, timeline, ownership, scope, HOA)
- Scores lead; only books site walk for qualified leads
- Disqualified leads: polite decline + "we're not the right fit" + optional referral to smaller contractors
- Syncs qualified lead + context to Marcus's calendar

**Replaces/Unblocks:**
- Marcus calling 15–20 leads/week, 4–6 clearly unqualified (10–15 min wasted each)
- Protects Marcus's most valuable resource: site walk time (70% close rate)

**Estimated ROI:**
- **Time saved:** ~1.5 hrs/week Marcus → 1–2 extra site walks/week
- **Revenue impact:** 1 extra site walk/week × 70% close × $28K = **~$1M/yr** (indirect)
- **Direct cost savings:** Minimal (API costs ~$0.01/lead)

**Why #5:** Protects the P0's input funnel. Smaller absolute ROI than #2–4, but compounds by ensuring Marcus only spends time on winnable deals. Deprioritized by auditor because quote cycle (P0) is the bottleneck, not lead volume.

---

## Agents Considered But Excluded

| Agent | Reason Excluded |
|-------|-----------------|
| **Crew Coaching / Upsell Assistant** | Marcus's stated #3 priority. Math: 4 crews × 1 upsell/week × $500 = $104K/yr. Real but **order of magnitude smaller** than quote-cycle revenue at risk. Candidate trap — Marcus cares personally but data doesn't support priority. |
| **Marketing / Content Agent** | Marcus's stated #4 priority. He admitted: "ROAS on Meta is 4.5x, lead volume is not the problem, quote volume is." Building content solves a non-problem. Strong candidate flag. |
| **Small Approvals Delegation** | Jenna pings Marcus 5–10×/day on change orders, refunds, add-on pricing. Could be a rules engine. But: these are symptoms of missing systems (P0, P2). Fix the upstream, downstream noise drops. |

---

## Interdependencies

```
P0 (Quote Gen) ──► P5 (Pre-Qual) ensures only winnable leads enter P0
P0 (Quote Gen) ──► P2 (Post-Sign) triggers on signed output
P2 (Post-Sign) ──► P3 (Comm) kicks off at crew start
P4 (Reactivation) ──► P5 (Pre-Qual) → P0 (Quote Gen) for re-closed deals
```

**Critical path:** P0 → P2 → P3. P5 feeds P0. P4 feeds P5.

---

## What Would Break First at Scale

1. **Groq rate limits** — llama-3.1-70b on Groq has RPM limits; would need fallback to OpenAI or self-hosted vLLM
2. **Supabase connection pooling** — concurrent proposal generations at peak season; needs PgBouncer
3. **GHL webhook reliability** — no retry/ack now; needs dead-letter queue + replay
4. **Marcus review bottleneck** — if P0 generates 20 proposals/day, Marcus can't review all; needs "auto-approve under $X" rules

---

## With Another Week, I'd Build

1. **P2 (Post-Sign Workflow Agent)** — highest unbuilt ROI, clear spec from discovery
2. **GHL webhook hardening** — retry logic, idempotency, observability
3. **PDF generation for proposals** — replace DocuSign mock with real branded PDF
4. **Marcus approval rules** — auto-approve proposals under $15K with standard scope