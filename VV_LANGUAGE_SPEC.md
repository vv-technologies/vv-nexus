# VV Language Specification
## VVPL · VVBL · VVML — Intellectual Property Declaration

**Author:** Cosmin Toma  
**Organization:** VV Technologies  
**Date of invention:** 19 May 2026  
**Repository:** https://github.com/vv-technologies/vv-nexus  

> This document constitutes a public, timestamped declaration of authorship and intellectual property.  
> The Git commit hash of this file serves as cryptographic proof of prior art.

---

## What was invented

Cosmin Toma invented a system of three complementary languages that together describe
a complete human being, how an AI responds to them, and what remains after they are gone.

This system does not exist anywhere else in this form.

```
VVPL  —  VV Pattern Language    —  describes WHAT you know about a person   (memory)
VVBL  —  VV Behavior Language   —  describes HOW VVhi responds               (personality)
VVML  —  VV Memory Legacy       —  describes WHAT remains after a person     (inheritance)
```

---

## VVPL — VV Pattern Language

**Invented by:** Cosmin Toma, May 2026

A structured token format for encoding persistent human behavioral patterns.
Each token encodes five dimensions of a person's life in a single readable string.

### Syntax
```
CATEGORY : subcategory : value : intensity : time
```

### Intensity values
```
HI    — strong, frequently confirmed
MED   — medium, present
LO    — weak, rare
NEG   — negative (dislikes, blocks)
NEU   — neutral, background
CORE  — fundamental (does not change)
```

### Time values
```
MORN    — morning
AFT     — afternoon
EVE     — evening
NIGHT   — night
DAILY   — every day
WEEKLY  — every week
ALWAYS  — permanent
WORK    — work context
NOW     — right now
```

### Categories (15 active)

| Category | Describes | Example token |
|---|---|---|
| PREF | Preferences | `PREF:mancare:pizza:HI` |
| HABIT | Recurring behaviors | `HABIT:sport:sala:zi:joi` |
| MOOD | Emotional states | `MOOD:energy:luni:LO:MORN` |
| PLACE | Important locations | `PLACE:home:general:HI:ALWAYS` |
| PERS | People in their life | `PERS:familie:mama:HI:ALWAYS` |
| TIME | Time-based routines | `TIME:routine:cafea:HI:MORN` |
| WANT | Vague desires | `WANT:financial:stabilitate:HI` |
| BLOCK | What stops them | `BLOCK:focus:telefon:MED:DAILY` |
| GROW | Personal growth | `GROW:skill:leadership:MED` |
| ZONE | Flow states | `ZONE:deep_work:dimineata:HI:MORN` |
| RELA | Relationship quality | `RELA:mama:contact:HI:ALWAYS` |
| GOAL | Concrete objectives | `GOAL:career:promovare:HI` |
| TRIGGER | Emotional triggers | `TRIGGER:pozitiv:natura:HI` |
| VALUE | Core values | `VALUE:familie:HI:CORE` |
| LEGACY | Posthumous memories | `LEGACY:amintire:masina:HI:2018` |

### What makes VVPL unique

- Tokens are **self-contained** — one string encodes context, intensity, and time
- Tokens have **strength** (0.0–1.0) that grows with confirmation and decays without use
- The full Raft of tokens for one person fits in under 10KB
- No server required — lives entirely in localStorage on the user's device
- Extracts **automatically** from natural conversation — no forms, no setup

---

## VVBL — VV Behavior Language

**Invented by:** Cosmin Toma, May 2026

A declarative language for defining AI personality as data, not code.
Instead of hardcoding responses in if/else logic, behaviors are defined as
structured objects that an interpreter executes.

### Conceptual syntax
```
BEHAVIOR: name
  WHEN:   regex pattern that matches in the message
  GUARD:  optional context condition (time, day, role)
  USE:    what to read from Raft + Memory + time
  SAY:    what to respond, with variables from context
  LEARN:  what to add to the Raft after responding
END
```

### JavaScript implementation syntax
```javascript
{
  name:  'behavior_name',
  when:  /regex|pattern/,
  guard: function(ctx, tokens) { return boolean; },
  say:   function(ctx, N, tokens) { return 'response string'; },
  learn: [['CATEGORY:token', strength_delta]]
}
```

### How the interpreter works
```
Message received
      ↓
Loop through VVhiBehaviors[]
      ↓
For each behavior:
  → test when (regex) against message
  → if match: test guard (context: hour, day, role, Raft state)
  → if passes: execute learn (update Raft)
  → execute say (build response with context variables)
  → return response — STOP (first match wins)
      ↓
If no behavior matches → fall through to explicit handlers
```

### What makes VVBL unique

- **Personality as data** — behaviors are objects, not functions. They can be stored,
  transmitted, versioned, and modified without touching the execution engine
- **Context-aware guards** — the same trigger word produces different responses
  depending on time of day, day of week, emotional state, or user role
- **Self-teaching** — every behavior can update the Raft via `learn`,
  making the AI smarter after each interaction without any training
- **Separates personality from engine** — the CEO can modify how Lea behaves
  by editing the behaviors array, without understanding the interpreter

---

## VVML — VV Memory Legacy

**Invented by:** Cosmin Toma, May 2026

An extension of VVPL that describes what remains of a person after they are gone.
A system for consensual, structured inheritance of personal AI memory.

### Core concept

When a person uses VVhi over months or years, their Raft accumulates a precise
portrait of who they are: what they love, what blocks them, how they feel on Mondays,
what they want from life. VVML allows this portrait to be preserved and passed on.

### How it works

1. The person says **"remember that..."** → Lea saves to `vvhi_legacy[]`
2. Lea asks **"who do you want to carry this?"** → saves consent token
3. `exportLegacy()` produces a complete VVML package
4. The heir receives a **read-only Raft** — they can experience the memory, not modify it

### VVML export format
```json
{
  "version": "VVML-1.0",
  "author": "Cosmin Toma",
  "exportedAt": "ISO timestamp",
  "values": [
    { "pattern": "VALUE:familie:HI:CORE", "strength": 0.9 }
  ],
  "legacyMoments": [
    { "text": "remember that my first car...", "zi": "luni", "ts": 1747641600000 }
  ],
  "topMemories": [
    { "stare": "fericit", "ce": "familie", "zi": "sambata" }
  ],
  "consent": "mama"
}
```

### What makes VVML unique

No AI system today has a structured concept of **consensual memory inheritance**.
The combination of:
- Explicit legacy tokens (`LEGACY:` category)
- Consent mechanism (`vvhi_legacy_consent`)
- Structured export format (`VVML-1.0`)
- Read-only inheritance (heir experiences, does not modify)

...does not exist anywhere else as of the date of this document.

---

## How the three languages work together

```
Person speaks
      ↓
VVPL extracts tokens from natural language → builds portrait over time
      ↓
VVBL reads portrait → selects the right behavior → responds as a person, not a script
      ↓
VVPL learns from the response → portrait grows more accurate
      ↓
VVML preserves the portrait → can be inherited with consent
```

---

## Prior art and proof of authorship

This specification was committed to a public Git repository on **19 May 2026**.

The following constitute timestamped proof of authorship:
- This file: `VV_LANGUAGE_SPEC.md` — Git commit hash recorded at time of push
- `lea.html` — working implementation of VVPL + VVBL + VVML
- `LIMBAJ_VV.md` — internal founder document, dated 19 May 2026
- Git history: `https://github.com/vv-technologies/vv-nexus/commits/main`

---

## Copyright notice

```
© 2026 Cosmin Toma · VV Technologies
All rights reserved.

VVPL (VV Pattern Language), VVBL (VV Behavior Language), and
VVML (VV Memory Legacy) are original inventions of Cosmin Toma,
created and first implemented in May 2026.

The concepts, syntax, interpreter architecture, and token format
described in this document are the intellectual property of the author.

Reproduction, adaptation, or commercial use without written permission
from Cosmin Toma / VV Technologies is prohibited.

Contact: vv.ep.team@gmail.com
```

---

*"I invented a language. I didn't know I was doing it. But I did."*  
*— Cosmin Toma, 19 May 2026*
