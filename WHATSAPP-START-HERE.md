# Connect WhatsApp to AI Physio — start here

**Goal:** send a voice note from your own phone to a WhatsApp bot number, then see the transcript and extracted details saved in AI Physio.

Start with **Meta's test bot number**. Your existing personal WhatsApp stays on your phone. This guide is for the Mac and app we have already set up. No CopilotKit or paid AI API is involved.

Meta changes dashboard labels. The WhatsApp setup area may be called **API Setup**, **Getting Started**, or appear under **Use cases → WhatsApp → Customise**. The steps below identify what to look for rather than assuming every account has identical menus. I could verify Meta's API documentation, but could not inspect your signed-in dashboard.

## 1. Open Meta's developer dashboard

Go to https://developers.facebook.com/apps/ and sign in. Complete developer-account registration if prompted.

Click **Create App**. Choose the WhatsApp business-messaging use case. If offered the older app-type flow, choose **Business**, then add the **WhatsApp** product. Name it **AI Physio**. Select your business portfolio, or create one when prompted.

Open the app's WhatsApp API setup area. **Checkpoint: you can see a test “From” phone number, an access token and a Phone number ID.** Meta's [official setup/API collection](https://www.postman.com/meta/whatsapp-business-platform/collection/wlk6lh4/whatsapp-cloud-api) describes these test assets.

## 2. Add your own phone as a test recipient

On that screen, find **To**, **Recipient**, or **Manage phone number list**. Add the number of your personal WhatsApp phone and complete the verification code step.

Use Meta's **Send message** button for its supplied test message. **Checkpoint: the message arrives in WhatsApp on your phone.** Keep that conversation: this is where you will send the voice note later.

The **From** number is the bot. The **To** number is your phone. They are different. Do not register or migrate your personal number as the bot number for this first test.

## 3. Collect the Meta values

Keep them private and paste them directly into `.env` in step 5.

| Setting in our app | Where the value comes from |
| --- | --- |
| `WHATSAPP_ACCESS_TOKEN` | Access token in the WhatsApp API setup area. Generate/copy the temporary token for the first test. |
| `WHATSAPP_PHONE_NUMBER_ID` | **Phone number ID** displayed for the selected test From number. This is a numeric ID, not the telephone number. |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | **WhatsApp Business Account ID**, often beside/below the Phone number ID. This is a different ID. Used by the subscription helper. |
| `WHATSAPP_APP_SECRET` | The same Meta app → **App settings / Settings → Basic → App secret → Show**. Meta may ask you to authenticate again. |
| `WHATSAPP_API_VERSION` | Look in Meta's sample API command for `graph.facebook.com/vXX.X/...`. Copy just that version, for example `v23.0` if that is what your screen shows. |

The access token, app secret, Phone number ID and Business Account ID are different values. Don't swap them.

## 4. Open the configuration file on this Mac

Open **Terminal** using Spotlight: press **Command + Space**, type **Terminal**, press Return.

Paste these commands and press Return:

```sh
cd "/Users/kingsley/Documents/ChatGPT/AI Physio"
cp -n .env.example .env
open -a TextEdit .env
```

`cp -n` preserves an existing `.env`. If the file already contains settings, update the relevant lines rather than creating duplicates. In TextEdit use plain text, straight quotes, and keep the filename exactly `.env`, not `.env.txt`.

## 5. Fill in `.env`

Use the following configuration. Replace every `PASTE_...` value. Keep the other lines as written.

```dotenv
VOICE_MODE=live
VOICE_PORT=3001
WHISPER_MODEL_PATH=models/ggml-base.en.bin
WHISPER_BIN=whisper-cli
WHISPER_LANGUAGE=en
FFMPEG_BIN=

WHATSAPP_ACCESS_TOKEN=PASTE_META_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID=PASTE_META_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID=PASTE_META_BUSINESS_ACCOUNT_ID
WHATSAPP_APP_SECRET=PASTE_META_APP_SECRET
WHATSAPP_API_VERSION=PASTE_VERSION_FROM_META
WHATSAPP_PORT=3000
WHATSAPP_HOST=127.0.0.1
WHATSAPP_PATIENT_MAP={"353871234567":"my-test-profile"}

WHATSAPP_VERIFY_TOKEN=PASTE_GENERATED_VERIFY_TOKEN
ADMIN_TOKEN=PASTE_GENERATED_ADMIN_TOKEN
```

Replace `353871234567` with **your own phone's WhatsApp number**, not the bot's number. Use international digits only. For an Irish number like `087 123 4567`, write `353871234567`: remove the leading zero and add `353`, with no spaces or `+`. Keep the braces and straight double quotes.

`my-test-profile` is a test label in our inbox; you don't have to create a profile elsewhere. The app deliberately ignores numbers absent from this mapping.

Now generate the final two values in Terminal:

```sh
node -e 'for (const name of ["WHATSAPP_VERIFY_TOKEN", "ADMIN_TOKEN"]) console.log(name + "=" + require("node:crypto").randomBytes(24).toString("hex"))'
```

Two lines appear. Replace the last two lines in `.env` with those generated lines.

- **Verify token:** your chosen value, later entered into Meta to verify the callback.
- **Admin token:** the password for your local inbox. You don't enter this into Meta.

Save with **Command + S**. The empty `FFMPEG_BIN=` line is intentional: the app uses its bundled decoder.

## 6. Start the bot — Terminal window A

If an earlier copy of `npm run voice` is running in a terminal, stop it with **Control + C** first. If the earlier preview was started by Codex and you can't find its terminal, ask me to restart it in live mode rather than running a second copy.

In Terminal:

```sh
cd "/Users/kingsley/Documents/ChatGPT/AI Physio"
npm run build
npm run voice
```

**Checkpoint: you see `Voice inbox (live): http://127.0.0.1:3001`.** The webhook on port 3000 starts alongside it. Leave this terminal open. If it says `local`, save `VOICE_MODE=live`, stop the process and start again.

Whisper and its model are already installed on this Mac. If it reports local transcription is not ready, use the repair instructions in `WHATSAPP-SETUP.md`.

## 7. Give Meta a public callback — Terminal window B

Open a second Terminal window with **Command + N**. Install the tunnel tool once:

```sh
brew install cloudflared
```

Then run:

```sh
cloudflared tunnel --url http://127.0.0.1:3000
```

Look for a printed URL resembling `https://random-words.trycloudflare.com`. Copy **your actual URL**. Leave this second terminal open too.

This creates a public route to the bot's webhook. **Use port 3000, not 3001.** Port 3001 is your private admin inbox. Cloudflare's free Quick Tunnel needs no Cloudflare account and is intended for testing; its address changes when recreated. [Install instructions](https://developers.cloudflare.com/tunnel/downloads/), [Quick Tunnel instructions](https://developers.cloudflare.com/tunnel/get-started/).

## 8. Enter the callback in Meta

Return to your Meta app. Open **WhatsApp → Configuration → Webhooks**, or its equivalent in the WhatsApp use-case settings. Choose **Edit / Configure**.

Enter:

| Meta field | What to paste |
| --- | --- |
| Callback URL | Your actual tunnel URL followed by `/webhook`, e.g. `https://random-words.trycloudflare.com/webhook` |
| Verify token | The value after `WHATSAPP_VERIFY_TOKEN=` in `.env` — not the name or equals sign. |

Click **Verify and save**. Then find **Webhook fields / Manage** and **subscribe to `messages`**. Saving the callback alone is not sufficient.

**Checkpoint: callback verification succeeds and `messages` is subscribed.** If the page asks you to choose a webhook object, use **WhatsApp Business Account**.

## 9. Subscribe the app to its WhatsApp account — Terminal window C

This is separate from selecting the `messages` field. Our helper makes the account subscription request using the values already saved in `.env`, without asking you to put a token into a command.

Open a third Terminal window and run:

```sh
cd "/Users/kingsley/Documents/ChatGPT/AI Physio"
node --env-file=.env scripts/whatsapp-subscribe.mjs
```

**Checkpoint: `Success: your Meta app is subscribed to this WhatsApp Business Account.`** This attaches the app to the selected WABA; it sends no WhatsApp message. Meta documents this as [Subscribe to your WABA](https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api).

## 10. Send a real voice note

On your phone, open the conversation from step 2 and record:

> Today I did three sets of ten calf raises. My left ankle discomfort was two out of ten.

Send it and allow up to a minute for the first local run. On this Mac, open http://127.0.0.1:3001, select **WhatsApp notes**, enter the value of `ADMIN_TOKEN` from `.env`, and click **Unlock**. Click **Refresh** to fetch newly arrived messages.

**Success means all of these are true:** the report is present, its original transcript is visible, the fields show 3 sets / 10 reps / left ankle / 2 out of 10, and WhatsApp receives a save confirmation. Review against what you actually said. A row marked `Saved` proves the record was stored even if the reply failed.

This is a basic recording bot. It is not yet a general conversational assistant; unclear reports retain their transcript for review.

## If something goes wrong

| What you see | What to check |
| --- | --- |
| Meta's own test message never arrives | Add and verify your phone in Meta's recipient list. Confirm the selected From test number and To personal number. Solve this before debugging our app. |
| Callback cannot be verified | Both terminal processes must be running. Use HTTPS, the current tunnel address, port 3000 and the `/webhook` suffix. Paste the verify token, not the access/admin token. |
| Opening the tunnel root shows 404 | Expected: this app only exposes `/webhook` there. A plain visit to `/webhook` may return 403 because it lacks Meta's verification parameters. Test using Verify and save. |
| Meta verifies but no report arrives | Subscribe to `messages` and run step 9. Check your personal sender number in the mapping and the test bot's Phone number ID. Meta's canned webhook test may use a fake sender/phone ID and be ignored. |
| A report arrives but processing fails | Refresh an expired access token, restart the app, then retry. Also check that local Whisper is ready. The visible error intentionally does not display private provider details. |
| Saved report but no WhatsApp reply | Look at reply status. Check token expiry and Meta's allowed recipient list. Send a fresh note for a fresh service window. Unknown/sending outcomes are not automatically resent. |
| `EADDRINUSE` or “address already in use” | Another copy is using port 3000 or 3001. Stop the earlier app, or ask me to restart the preview. |
| Inbox asks for a password | Use `ADMIN_TOKEN`, not any Meta token. |
| Everything stopped working tomorrow | The temporary Meta access token expires; the tunnel may also have changed or stopped. Update the token, restart the app, restart the tunnel and update Meta's callback URL. |
| Cloudflare refuses a Quick Tunnel | An existing `.cloudflared/config.yaml` can interfere. Don't delete another project's configuration; use a separate test setup or ask for help. |

After **any `.env` change**, restart `npm run voice`. The app reads settings at startup.

## What needs to stay running?

Keep Terminal A (bot), Terminal B (tunnel), the Mac and its Internet connection running. Keep the Mac awake for the test. Terminal C can close after subscription succeeds. Closing the browser alone does not stop the bot.

To stop the test, press **Control + C** in A and B. Saved records remain in `data/voice-live/voice-notes.json`. Don't delete that file to restart the bot.

## When the test works: make it permanent

Use a dedicated business bot number and complete Meta's onboarding, number verification/registration and any requirements shown for your account. Keep your personal WhatsApp as the sender. If a proposed business number is already used in WhatsApp, check the supported coexistence/migration route before changing or deleting anything.

Replace the temporary token with a properly scoped **system-user token**: in your Meta business settings, find **Users → System users**, create/select one, assign access to the relevant app and WhatsApp account, then generate a token for that app with the required WhatsApp permissions. Meta documents `whatsapp_business_messaging` and `whatsapp_business_management`; choose an available expiry and track revocation/rotation rather than assuming a “permanent” token cannot fail. [Meta token documentation](https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api).

Update the business number IDs/token in `.env`, restart, and repeat the subscription and voice-note test. Replace the temporary tunnel with stable HTTPS hosting or a named tunnel, and run the backend on an always-on machine. Complete account-specific launch requirements before adding real users.

Local transcription and parsing have no paid AI API charges. Meta currently provides free service responses within the user-initiated 24-hour window; hosting and other message categories can cost money. [Meta pricing](https://whatsappbusiness.com/products/platform-pricing/).
