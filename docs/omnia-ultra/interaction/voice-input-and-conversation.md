---
id: OMNIA-ULTRA-INT-VOICE
title: Voice input and speech conversation
status: normative-target
---

# Voice

Support click-to-record, hold-to-talk, push-to-talk, continuous dictation,
voice activity detection, optional wake word, voice commands and two-way voice
conversation.

Live transcript must appear in the composer with partial/stable distinction,
confidence, alternatives, review-before-send, auto-send countdown and undo.

Support Vietnamese, English, code-switching, domain vocabulary, math speech,
LaTeX speech, code dictation, Markdown commands and voice references such as
ask about this, add to queue, branch from here and finalize prompt.

Audio pipeline:

~~~text
capture -> denoise/VAD -> language detection -> STT candidates
-> vocabulary correction -> punctuation/formatting -> confidence
-> optional cleanup -> composer
~~~

Choose local/cloud/custom STT according to privacy, language, latency, cost,
hardware and health. Keep original audio and transcript lineage according to
retention policy. Never record outside explicit permission, sensitive fields or
the selected source.

Voice output may use local/cloud TTS, barge-in, pause, resume, speed, language
switching and transcript synchronization.

