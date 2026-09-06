# Appendix B: Google Gemini API Specification

## 1. Overview
The quiz application integrates with Google Generative AI via a direct, client-side REST call to `gemini-2.0-flash`.

- **Endpoint URL:**
  `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}`
- **Authentication:** Query parameter `key` (Free tier personal developer key).
- **Protocol:** HTTPS (CORS enabled for browser `fetch` origins).

---

## 2. Request Schema

### Headers
```http
Content-Type: application/json
```

### Body
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "System Prompt & Formatted Question Payload"
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.3,
    "maxOutputTokens": 400
  }
}
```

---

## 3. System Prompt Specification

```text
You are a knowledgeable AI professor teaching MCS 306 — Introduction to Artificial Intelligence at a university level. A student just answered a quiz question. Your job:

1. Explain WHY the correct answer is correct (2-3 sentences, conceptual).
2. Briefly explain why each wrong option is wrong (1 sentence each).
3. If the student got it wrong, add an encouraging note and a memory tip.

Keep your total response under 200 words. Use clear, simple language. Reference textbook concepts (Russell & Norvig's "Artificial Intelligence: A Modern Approach") when relevant.
```

---

## 4. Expected Response Schema

### HTTP 200 OK
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "**Why (c) is correct:** Thinking humanly seeks to model cognitive mechanisms...\n\n**Why others are incorrect:**\n- (a) Acting rationally focuses on objective-maximizing actions...\n- (b) Acting humanly focuses on passing tests like the Turing Test...\n- (d) Thinking rationally focuses on logic and normative inference laws."
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP"
    }
  ]
}
```

---

## 5. HTTP Error Handling & Retry Policies

| HTTP Status | Error Type | Application Action |
|---|---|---|
| `200` | Success | Parse candidate text, cache in session, render HTML |
| `429` | Rate Limit | Wait 4,000ms and retry request once; display fallback if second attempt fails |
| `400` | Bad Request | Display message: "Malformed request payload. Check console." |
| `401 / 403` | Unauthorized | Display message: "Invalid API key. Please check key in settings." |
| `500+` | Upstream Server Error | Display fallback: "Gemini servers busy. Showing standard answer key." |
| Network Abort (30s) | Timeout | Cancel request via `AbortController.abort()` and display fallback |
| Offline | Disconnected | Detect `navigator.onLine === false` and immediately display offline message |
