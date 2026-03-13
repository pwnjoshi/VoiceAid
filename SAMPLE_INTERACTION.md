# Voice AI Service - Sample Input/Output

## Example Interaction 1: Simple Greeting

### Input (You type):
```
Hello, how are you today?
```

### Output (AI responds):
```
==================================================
You: Hello, how are you today?
Sending to AI...

AI Response: I'm doing great, thank you for asking! How can I help you today?

Speaking response...
[🔊 Computer speaks: "I'm doing great, thank you for asking! How can I help you today?"]
--------------------------------------------------
```

---

## Example Interaction 2: Asking a Question

### Input (You type):
```
What is the capital of France?
```

### Output (AI responds):
```
==================================================
You: What is the capital of France?
Sending to AI...

AI Response: The capital of France is Paris. It's a beautiful city known for the Eiffel Tower, art museums, and rich history.

Speaking response...
[🔊 Computer speaks: "The capital of France is Paris. It's a beautiful city known for the Eiffel Tower, art museums, and rich history."]
--------------------------------------------------
```

---

## Example Interaction 3: Personal Introduction

### Input (You type):
```
My name is Mehak and I'm learning to code
```

### Output (AI responds):
```
==================================================
You: My name is Mehak and I'm learning to code
Sending to AI...

AI Response: Nice to meet you, Mehak! That's wonderful that you're learning to code. What programming language are you focusing on?

Speaking response...
[🔊 Computer speaks: "Nice to meet you, Mehak! That's wonderful that you're learning to code. What programming language are you focusing on?"]
--------------------------------------------------
```

---

## Example Interaction 4: Exiting the Program

### Input (You type):
```
exit
```

### Output (AI responds):
```
==================================================
You: exit

Goodbye!
Speaking response...
[🔊 Computer speaks: "Goodbye! Have a great day!"]
```

---

## Full Session Example

```
==================================================
Voice AI Service (FREE Version with Hugging Face)
==================================================
Type your message and press Enter.
Type 'exit' or 'quit' to stop the program.
==================================================

==================================================
You: Hi there!
Sending to AI...

AI Response: Hello! How can I assist you today?

Speaking response...
[🔊 Speaks the response]
--------------------------------------------------

==================================================
You: Tell me a fun fact
Sending to AI...

AI Response: Did you know that honey never spoils? Archaeologists have found 3000-year-old honey in Egyptian tombs that was still perfectly edible!

Speaking response...
[🔊 Speaks the response]
--------------------------------------------------

==================================================
You: That's amazing!
Sending to AI...

AI Response: I'm glad you found it interesting! Would you like to hear another fun fact?

Speaking response...
[🔊 Speaks the response]
--------------------------------------------------

==================================================
You: quit

Goodbye!
Speaking response...
[🔊 Speaks: "Goodbye! Have a great day!"]
```

---

## Key Features:

1. **Text Input**: You type your message
2. **AI Processing**: Sends to Hugging Face API
3. **Text Output**: Shows AI response on screen
4. **Voice Output**: Computer speaks the response out loud
5. **Continuous Loop**: Automatically waits for next input
6. **Exit Commands**: Type 'exit', 'quit', 'stop', or 'goodbye' to end

---

## What You'll Hear:

The computer will use text-to-speech (pyttsx3) to speak the AI's responses through your speakers. The voice will be:
- Clear and understandable
- Moderate speed (150 words per minute)
- 90% volume
- Uses your system's default voice (usually Microsoft David on Windows)

---

## To Run:

```bash
python voice_ai_free.py
```

Then start typing and pressing Enter!
