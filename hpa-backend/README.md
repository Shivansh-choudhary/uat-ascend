# Survey Backend (Node.js + MongoDB)

Simple backend API to save survey answers from a frontend app.

## Setup

1. Install dependencies:
   `npm install`
2. Create `.env` file from `.env.example`.
3. Run in development:
   `npm run dev`

## API

- `GET /health` -> server health
- `POST /api/surveys/responses` -> save survey response
- `GET /api/surveys/responses` -> list saved responses

### POST body example

```json
{
  "surveyId": "survey-123",
  "userId": "user-1",
  "answers": [
    { "questionId": "q1", "answer": "Yes" },
    { "questionId": "q2", "answer": 5 }
  ]
}
```
