# Native WhatsApp voice notes

**First-time setup:** follow [Connect WhatsApp — start here](WHATSAPP-START-HERE.md) for the step-by-step Meta screens, copy/paste configuration, tunnel and first-message test.

This version connects directly to Meta's WhatsApp Cloud API. Transcription runs on this computer with whisper.cpp; structured extraction uses a conservative English rule parser. No CopilotKit account, credits, OpenAI API key, paid model call, or messaging middleman is required.

## Try real transcription locally

Whisper and the English `base.en` model have been installed on this Mac. FFmpeg comes with the npm dependencies. Start the app:

```sh
npm install
npm run build
npm run voice
```

Open http://127.0.0.1:3001 and select **WhatsApp notes**. The default mode is `local`. Upload an exported WhatsApp `.ogg`/`.opus` voice note, another supported audio file, or paste a text report. Uploads are local tests under profile `local-test`; they never send WhatsApp replies. The inbox refreshes while processing and retains transcripts, extracted details and review status on disk.

Audio limit: 8 MiB and ten minutes. Longer audio is rejected, not silently truncated. Local transcription jobs run one at a time. Temporary audio is removed when transcription ends; failed inputs remain in the private store for retry. Speech recognition can make mistakes, so compare extracted details with the transcript.

The **sample** button bypasses speech recognition with a fixed example transcript. In local mode the real rule parser processes it; `VOICE_MODE=demo` retains the old fully fixed fixture mode.

For another Mac, install the local speech engine and model first:

```sh
brew install whisper-cpp
mkdir -p models
curl -fL --retry 2 https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin -o models/ggml-base.en.bin
```

On Linux, build/install `whisper-cli` using the [whisper.cpp instructions](https://github.com/ggml-org/whisper.cpp), then download the same model. The model is about 142 MiB. Set `WHISPER_BIN`, `WHISPER_MODEL_PATH` or `FFMPEG_BIN` in `.env` if needed. Initial GPU setup may take a little longer. These are local compute costs, not a hosted API free tier.

## Connect WhatsApp

1. Copy `.env.example` to `.env`. The file is ignored by Git. Set `VOICE_MODE=live` when ready.
2. Configure your WhatsApp **Business Platform / Cloud API** phone number in Meta. Supply `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` and the `WHATSAPP_API_VERSION` enabled for your Meta app. Merely having the mobile WhatsApp Business app does not create this connection.
3. Set `WHATSAPP_PATIENT_MAP` to verified sender/profile mappings, e.g. `{"353871234567":"patient-demo"}` with fictional values. IDs are international digits without `+`. Unknown senders and events for a different business phone-number ID are ignored without storing their reports.
4. Set a random `ADMIN_TOKEN` of at least 24 characters. The live inbox requires it; it stays only in page memory. The inbox is an admin view, not a patient-facing multi-user portal.
5. Run `npm run voice`. The official webhook listens on `127.0.0.1:3000/webhook`. Route a public **HTTPS** webhook URL to that port using your deployment/reverse proxy. Keep admin port 3001 private. No tunnel or deployment is automatically created. For a container deployment, explicitly configure the webhook host as appropriate.
6. Configure Meta's callback URL and matching verification token, and subscribe to messages. Send a short voice note from an enrolled test number. Verify both the saved record and the reply. `webhook_listening` means the local server is running, not that Meta delivery has been verified.

## What is free?

The application code, local speech recognition and local field parsing require no subscription or per-call AI charges. Meta currently charges **nothing for service replies during the 24-hour customer-service window opened by a user message**. This version sends only ordinary text service replies, with a conservative 23.9-hour check against the originating message timestamp. It never sends paid templates or promotional messages. Hosting, electricity and an always-on machine are still your responsibility; other WhatsApp message categories have their own charges. [Meta pricing](https://whatsappbusiness.com/products/platform-pricing/), checked 12 September 2026.

## Reliability and data

- The app verifies the raw webhook HMAC, bounds webhook bodies, checks the business number and sender mapping, and **persists message/media IDs before returning HTTP 200**. Download and processing happen afterward. Failure to persist returns an error so Meta can retry.
- Message IDs deduplicate records. Work is serialized for live webhook deliveries; pending records resume at restart. Failed notes can be retried from the admin inbox. Downloaded audio is bounded and permitted only from expected Meta media hosts; access tokens are never sent to arbitrary URLs or redirects.
- A successful save precedes the WhatsApp reply. The app records `sending` before submitting a reply. An ambiguous network outcome becomes `unknown` and is not automatically resent, avoiding duplicate acknowledgements. A crash between marking `sending` and sending can omit a reply; the record remains saved. Expired-window replies are skipped. Admin retries save reports but do not send WhatsApp messages.
- Stores remain separate: `data/voice-local`, `data/voice-demo`, `data/voice-live`. Existing demo records are preserved. `VOICE_DATA_DIR` can override the location; use a private directory and one backend process per store. Back up the files if needed. The JSON snapshot is serialized and atomically replaced; this is a single-machine prototype, not a replicated database.
- Reports are unreviewed patient statements. They do not update the prescribed routine or the legacy browser-only session history/Markdown export. The inbox is the system integration in this version.

## Extraction limits

This is a basic parser, not a conversational LLM. It recognises common English patterns such as “three sets of ten calf raises”, a single left/right body region, explicit pain/discomfort out of ten and simple relative dates. It recognises calf raises, heel slides, glute bridges, knee extensions and squats. Negations, corrections, plans and multiple recognised exercises remain unstructured for review. Other wording may retain only the transcript; missing fields stay null. Every parsed report asks for review. Follow-ups do not automatically edit earlier entries. No diagnosis or exercise prescription is generated.

The base.en model handles English. Multilingual transcription would require a multilingual model and an appropriate extraction workflow. No accuracy claim is made for clinical terms, accents, background noise or arbitrary notes.

## Verification

Run `npm test` and `npm run build`. Tests cover native signed webhooks, sender/phone isolation, authenticated media download through a fake Meta endpoint, save-before-reply ordering, deduplication, restarts, retries, expired windows, ambiguous replies, local parsing, authentication and the existing prototype data rules. Paid services are not used by the tests.

A synthetic spoken exercise report is additionally converted to WhatsApp-style OGG and transcribed with the real local Whisper engine during development. Real Meta credentials, public webhook delivery and a physical WhatsApp sender still require your account setup.
