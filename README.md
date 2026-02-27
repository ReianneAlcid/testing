# ExamGuard AI (Demo)

A lightweight anti-cheat exam system demo with two roles:

- **Teacher**: logs in, creates exam questions, publishes an exam code/link, and monitors anti-cheat alerts.
- **Student**: joins using the teacher's exam code and takes the exam.

## Features

- Teacher login (demo credentials).
- Exam builder supports:
  - Multiple Choice
  - Identification
  - Enumeration
  - True/False
- Teacher can publish a unique exam code.
- Anti-cheat events logged when a student:
  - switches tab/apps (`visibilitychange`)
  - loses browser focus (`blur`)
  - returns focus (`focus`)
  - leaves page/app (`pagehide`, useful signal for mobile/iOS home swipe/button behavior)
- Basic monitor feed for teacher.

## Run locally

Because this app uses browser APIs and localStorage, run with any static server:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Demo Teacher Credentials

- `teacher@example.com`
- `examguard123`
