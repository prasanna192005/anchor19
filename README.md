# 🚀 Anchor19 — The Workspace for the Paranoid & Productive

> *"Designed for the developer who has 47 browser tabs open, a Notion workspace they haven't opened since March, and the audacity to call themselves 'organized'."*

**Anchor19** is a pro-grade, CLI-first, real-time workspace built on Next.js and Firebase. It's not a task manager. It's not a note app. It's not a link saver. It's all three, fused together with glassmorphism, fuzzy search, and NLP commands — wrapped in a Command Palette that makes you feel like a hacker even when you're just writing a shopping list.

---

## 💅 The "Cyber-Editorial" Aesthetic

We spent an **unreasonable** amount of time on background grids, inner glows, and glassmorphism. Like, embarrassingly long. The kind of time that makes you question your life choices at 2 AM while tweaking `backdrop-blur` values by 2px.

Why? Because if you're going to be overwhelmed by your workload, you should at least do it in a **Premium™** environment.

- **Glassmorphism everywhere** — Soft blurs, translucent cards, and subtle borders. Apple wishes.
- **Bento Dashboard** — A layout that makes sense. Tasks on top, links on the side, your soul in the corner crying.
- **Dark mode only** — Because light mode is for people who actually sleep.
- **Micro-animations** — Every hover, every transition, every open/close has motion. It's not bloat. It's *personality*.
- **Zero italics policy** — We used to have italics. They were removed. This is non-negotiable.

---

## ⚡ Features

### 1. The Command Palette (`Cmd/Ctrl + K`) — The Crown Jewel

The heart of Kern. A blazing-fast, fuzzy NLP command center that works like VS Code's file picker mated with a terminal and had an overachieving child.

**Press `Cmd + K` anywhere in the app. That's it. You're in.**

#### 🔍 Search & Navigate
Just type. Kern fuzzy-searches your entire workspace in real-time — projects, tasks, vault links, drive files, notes — all at once, all from one bar.

```
dashboard          → Jump to Dashboard
todos              → Jump to Todos
vault              → Jump to Vault
"meeting"          → Finds every task, note, and link mentioning "meeting"
```

#### ✍️ Create Commands
```
todo Fix the login bug          → Creates a Task instantly
task Send invoice to client     → Same thing, two spellings
note Remember to hydrate        → Creates a Note
https://example.com             → Saves the URL to your Vault
(Google Doc/Sheet/Slide URL)    → Links directly to your Drive archive
```

#### 🔧 Manage Commands (NLP)
```
del @Meeting notes              → Deletes (two-step confirm, we're not monsters)
rename @Old Name to @New Name   → Renames any resource in your workspace
move @Task Name to Archive      → Moves to a new category
link @Task A to @Project B      → Associates two resources together
```

#### 🧠 @Mention Autocomplete
Type `@` anywhere in the bar and Kern instantly shows fuzzy-matched suggestions from your entire data pool. Press `Tab` to commit the ghost-text completion. It works mid-sentence. It works with typos. It judges you silently but still helps.

---

### 2. The Smart Autocomplete Engine

This is where it gets interesting. The @mention and search system is not a simple `String.includes()`. That's for amateurs.

**What's powering it:**

| Feature | What it does |
|---|---|
| **Fuse.js fuzzy matching** | `@mtnotes` finds `Meeting Notes`. `@proj` finds `Project Alpha`. |
| **Levenshtein typo tolerance** | `@meating` → still finds `Meeting`. Forgives up to 2 character errors. |
| **Frequency scoring** | Items you use most often float to the top automatically. Tracked in `localStorage`. |
| **Contextual category bias** | Typing `del` → Tasks and Links bubble up. Typing `todo` → Tasks prioritized. |
| **Partial NLP hints** | Type `rename @foo` and a dimmed ghost hint appears: `rename @ItemName to @NewName`. Guides you without being annoying. |
| **Tab-to-complete** | The top @mention suggestion shows as ghost text. `Tab` commits it instantly without executing the action. |
| **Cursor-aware matching** | Mentions are detected relative to your cursor position, so you can type a mention in the middle of a sentence and it won't explode. |

**The Search Priority Stack (in order):**
1. Mention suggestions (`@` trigger)
2. NLP command results (rename, del, move, etc.)
3. Partial command hints (dimmed guide tips)
4. Navigation items (filtered)
5. Fuzzy local data results (scored by frequency + relevance)
6. Google Drive deep search results (async)

---

### 3. Google Drive Deep Search

Stop opening the Google Drive UI. It's slow. It takes three clicks. Sometimes it forgets you were logged in. It's 2026 and we refuse to accept this.

Type any keyword in Anchor19's Command Palette and — if you've connected your Google account — we reach into your Drive and pull the matching files in real-time via the Drive API.

Found something? Hover over the result to see inline **+Vault** and **+Drive** buttons. One click saves it to your local Anchor19 archive. Zero page navigation. Zero friction.

> **Note:** You have to connect Google Drive once via the "Connect Drive for Deep Search" prompt that appears automatically. After that, Kern remembers and never asks again.

---

### 4. The Vault

A permanent, searchable archive for links. It's for the links you bookmark thinking "I'll read this properly later" and never do. We know. We've accepted it.

- Categorized (Inbox, Imported, Tagged)
- Importable from Command Palette via URL paste
- Deep-searchable alongside everything else
- Importable directly from Google Drive search results

---

### 5. Tasks (Todos)

Simple, fast task management. No Kanban boards with 47 columns. No "due date pickers" that take 3 clicks. Just tasks. With statuses. And priorities. And NLP commands so you never have to click "New Task" again.

```
todo Write the quarterly report    → Done. Task created. Move on.
del @Write the quarterly report    → Gone. Confirmed. Good riddance.
```

---

### 6. Drive (Central File Archive)

Your Google Docs, Sheets, Slides, and any other links — all archived in one searchable, organized place. Not a replacement for Drive. A command center *for* Drive.

---

### 7. Real-Time Everything

Every single piece of data in Anchor19 is streamed via Firestore `onSnapshot` listeners. This means:
- The Command Palette is always up-to-date when you open it
- Results appear in `<10ms` because everything is local and pre-cached
- No stale data. No refresh required. No "Loading..." skeletons for data you already have.

---

### 8. History Log

Every action you perform in Anchor19 is logged to a history trail. Create a task? Logged. Delete a link? Logged. Rename a project at 3 AM? Logged, timestamped, and silently judged.

---

### 9. Voice Input

Click the microphone icon in the Command Palette and dictate your command. Say "todo buy coffee beans" and it'll parse it. Works with NLP commands too. We haven't tried yelling "DEL @all my problems" at it yet, but in theory it would try.

---

## 🛠 The Chronicles of Development (Challenges & Solutions)

### 💀 Chapter 1: The Semantic Search Saga

**The Dream:** We implemented AI-powered semantic search using Gemini embeddings. The vision: type "important meeting" and Kern understands *intent*, not just keywords.

**The Reality:** It was slow (300-800ms per query), burned Firebase quota, broke incrementally over time, and at one point suggested a recipe for blueberry muffins when we searched for "notes."

**The Solution:** We deleted it. Every line. Zero survivors. We replaced it with a **deterministic local matching engine** powered by Fuse.js + Levenshtein distance. It responds in `<10ms`, tolerates typos, scores by frequency, and has never once suggested a recipe. It's 2026. We don't have time for hallucinations.

> *Lesson: Sometimes the most intelligent solution is to not use AI.*

---

### 🌀 Chapter 2: The Great Variable Scope Mystery

**The Problem:** NLP commands like `del @Project Alpha` would show no results, even when the project clearly existed. The Command Palette was effectively blind.

**Root Cause:** We were searching against the *UI-filtered results* instead of the full data pool. The palette had already hidden 90% of the data before the NLP parser looked at it.

**The Solution:** We completely divorced the "Resource Pool" from the "UI Renderer." Now Anchor19 builds a `localPool` via `onSnapshot` listeners on every collection independently. The NLP engine always has access to 100% of your data. The UI can show whatever it wants. The engine doesn't care.

---

### 📜 Chapter 3: The Firestore Limit-Break

**The Problem:** The Command Palette was only fetching 5-10 items per collection, meaning any NLP command targeting a slightly-older item would fail silently.

**The Solution:** Cranked the per-collection listener limit to **150 items**, switched from `getDocs` (one-shot fetch) to `onSnapshot` (live stream), and added a "records synced" counter in the palette footer so you always know it's working. Now Anchor19 has the memory of an elephant and the speed of a cheetah. A very small, very organized cheetah.

---

### 🔁 Chapter 4: The Auto-Close Wars

**The Problem:** The Command Palette wouldn't close after executing an action. You'd click "Create Task," the task would be created, and the palette would just... stay there, staring at you.

**The Root Cause:** All the `setIsOpen(false)` calls were happening *inside* async Firestore callbacks, which meant the UI waited for the DB write before closing. That's the wrong order. Always.

**The Solution:** We moved all `setIsOpen(false)` + `setQueryText("")` calls to the **very beginning** of every action handler — before the async work starts. The UI closes immediately. The database write happens in the background. The user feels the speed. 

---

### 👻 Chapter 5: The Mention That Wouldn't Autocomplete

**The Problem:** The `@mention` autocomplete kept breaking. Sometimes it showed suggestions for old text. Sometimes it showed suggestions from the wrong word in the sentence. Sometimes it showed nothing.

**Root Cause 1:** We were searching the full query text instead of just the word after `@`.

**Root Cause 2:** We weren't tracking cursor position, so typing after a completed mention would re-trigger the autocomplete on the previous `@`.

**The Solution:** Full cursor-aware mention detection. We calculate `selectionStart`, find the last `@` before the cursor, extract only the word at the cursor position, and search that word. If the word already has a space after it, the mention is "committed" and autocomplete stops. Simple in hindsight. Debugging it was not.

---

### 🎨 Chapter 6: The Italic Incident

**The Problem:** The Drive page had italic text. The user noticed. The user was displeased.

**The Solution:** We removed all italic text from the Drive page. Every `font-italic` class, every `<em>` tag, every `italic` Tailwind utility — gone. The codebase is now an italic-free zone. We wrote no tests for this. It has not regressed. Knock on wood.

---

### 🔥 Chapter 7: The Feature That Kept Disappearing

**The Problem:** After multiple refactors, the "Deep Search findings" inline action buttons ("+Vault" and "+Drive") kept getting removed with each rewrite, forcing us to re-add them repeatedly.

**The Solution:** We standardized the rendering logic — every item with `category === "Deep Search findings"` shows the inline buttons. No exceptions. It's baked into the component template, not scattered across conditional logic.

---

## 🏗 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js (App Router) | Because we enjoy breaking changes and living on the edge |
| Database | Firebase / Firestore | Real-time streams, offline caching, and free tier abuse |
| Auth | Firebase Auth + Google OAuth | One-click login, Drive scopes, done |
| Search | Fuse.js + Levenshtein | Feels like magic, costs nothing, never hallucinates |
| Animations | Framer Motion | If it doesn't slide, it shouldn't ship |
| Icons | Lucide React | The only icons worth using |
| Styling | Tailwind CSS | Utility-first CSS, glassmorphism tokens, and a font that slaps |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Add your Firebase config to .env.local
# NEXT_PUBLIC_FIREBASE_API_KEY=...
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# etc.

# Run locally
npm run dev
```

> Open `http://localhost:3000`, sign in with Google, and hit `Cmd + K` to begin. It's 2026 — you shouldn't need more instructions than this.

---

## 🗺 Roadmap (Things We'll Probably Do)

- [ ] Global Undo for renames and deletions
- [ ] Project-level Kanban view
- [ ] Keyboard shortcut audit (`Cmd+R`, `Cmd+D`, etc.)
- [ ] Bulk actions from the Command Palette
- [ ] Command history (last 10 commands, re-executable)
- [ ] Export Vault as Markdown or CSV

---

*Built with excessive attention to detail, questionable late-night decisions, and a firm belief that your tools should feel as fast as your thoughts.*

**Anchor19** — Because your workspace should be as fast as your brain thinks it is. (And your brain thinks it's very fast. We're not here to correct that.)