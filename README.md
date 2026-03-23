# PRD: Personal Workspace Hub

---

## Overview

A personal productivity web app to manage links, todos, Drive/Sheets/Forms, and work notes — all in one place, with a powerful natural language command palette.

---

## Tech Stack

- **Frontend:** Next.js (App Router)
- **Database & Auth:** Firebase (Firestore + Firebase Auth)
- **Styling:** Tailwind CSS

---

## Core Features

### 1. Command Palette (Ctrl+K)
The heart of the app. Opens a modal with a search input that understands natural language.

- Search across all content (links, todos, notes, drive files) in real time
- Natural language actions: *"add todo review report by friday"*, *"open attendance sheet"*, *"find links tagged design"*
- Keyboard navigable (arrow keys + Enter)
- Parse intent on the fly using simple pattern matching (no AI needed for v1)

### 2. Links & URLs
- Add a link with: Title, URL, Category/Tag, optional description
- Click to open in new tab
- Filter by tag, search by title
- Pin frequently used links to top

### 3. Tasks & TODOs
- Add task with: Title, Priority (low/medium/high), optional due date, optional project tag
- Mark complete, archive, delete
- Filter by: status, priority, project
- Sort by due date or priority

### 4. Google Drive / Sheets / Forms
- Save any Google link with: Label, Type (Drive / Sheet / Form / Doc / Slide), Project tag
- Visual icons per type
- Quick copy link button
- Group by project

### 5. Work Notes
- Lightweight notes tied to a project/tag
- Plain text, no rich editor in v1
- Searchable, taggable

---

## Data Models (Firestore)

```
users/{uid}/
  links/{id}        → { title, url, tag, description, pinned, createdAt }
  todos/{id}        → { title, priority, dueDate, projectTag, done, createdAt }
  driveItems/{id}   → { label, url, type, projectTag, createdAt }
  notes/{id}        → { content, projectTag, createdAt, updatedAt }
```

---

## Pages & Routes

```
/                   → Dashboard (overview + recent items)
/links              → Links manager
/todos              → Todo list
/drive              → Drive & Sheets manager
/notes              → Notes
```

Command palette accessible on every page via Ctrl+K.

---

## Auth

- Firebase Auth with Google Sign-In
- All data scoped to `users/{uid}` — private per user
- Redirect to `/login` if unauthenticated

---

## Command Palette — Intent Parsing (v1)

Simple regex/keyword matching, no external API needed:

| User types | Action |
|---|---|
| `add todo ...` | Opens add todo form pre-filled |
| `open [keyword]` | Searches links + drive, opens top match |
| `find [keyword]` | Filters all sections live |
| `note [text]` | Quick-saves a note |
| Anything else | Full-text search across all items |

---

## Non-Goals (v1)

- No reminders or notifications
- No mobile app
- No collaboration / sharing
- No rich text editor
- No AI integration (Ctrl+K is pattern-based)

---

## Future (v2+)

- AI-powered Ctrl+K using Claude API
- Due date reminders via email
- Browser extension for one-click link saving
- Mobile PWA