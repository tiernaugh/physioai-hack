# Sponsor Capabilities

Status: Draft
Source: hackathon opening presentations

This is a behaviour-first reference. Choose the product behaviour before choosing sponsor technology.

## Capability map

| Behaviour needed | Potential technology | Useful when |
|---|---|---|
| Reason, interpret, use tools, or process multimodal input | OpenAI | The workflow needs model-driven judgment or action |
| Connect an agent to an application and share UI state | CopilotKit / AG-UI | The agent's relationship with a web, mobile, Slack, or Teams interface is central |
| Search or investigate the external world | Exa | Environmental context reveals an information gap that needs outside evidence |
| Run background, event-driven, scheduled, or retryable work | Trigger.dev | The agent must wake up without a direct prompt or continue over time |
| Give the agent an identity in a shared workspace | Ambiguous AI | The concept depends on the agent acting as a coworker, participant, delegate, or auditable account |
| Authenticate people or grant scoped delegated access | Auth0 | Identity, consent, permissions, external API tokens, or approval are part of the experience |
| Route among models or compare model performance | OpenRouter / Ori | The behaviour benefits materially from model choice, routing, harness portability, or project-specific evaluation |
| Host an application or worker | Google Cloud Run | The implementation needs a deployed service, backend, or worker |
| Use open-source AI infrastructure | Mozilla / Mozilla.ai | A relevant tool becomes clear during implementation |

## Sponsor notes

### OpenAI

Broadly represents the reasoning, agent behaviour, tool-use, multimodality, computer-use, and action layer.

### CopilotKit / AG-UI

Infrastructure for connecting agents to user-facing applications. Relevant capabilities include shared state, human-in-the-loop interaction, learning from user and application behaviour, and generative UI across web, mobile, Slack, and Teams.

Conceptual distinction:

- MCP connects agents to tools and data.
- A2A connects agents to other agents.
- AG-UI connects agents to user-facing applications.

### OpenRouter / Ori

- OpenRouter provides model access and routing across many models and modalities.
- Ori Harness supports switching between coding-agent harnesses while using OpenRouter.
- Ori Code is OpenRouter's coding agent.
- Ori Eval inspects model use in a codebase and evaluates models against project-specific data and tasks.

Model evaluation is relevant only if model selection is materially part of the product or build strategy.

### Exa

Web search and research infrastructure for agents. A strong pattern is:

```text
Environmental context
→ agent identifies a missing piece of information
→ agent investigates externally
→ evidence or action returns to the original environment
```

### Ambiguous AI

A shared human-and-agent workspace containing productivity applications such as chat, mail, tasks, calendar, documents, sheets, slides, drive, wiki, and CRM. An agent can have its own identity, receive messages and tasks, manipulate shared artifacts, and leave an auditable action history.

### Auth0

Authentication and identity infrastructure, including OAuth, agent skills, an MCP server, Token Vault for short-lived scoped access, and CIBA-style asynchronous human approval. Particularly relevant when authority and consent are central to the interaction.

### Trigger.dev

Background jobs, long-running workflows, event-driven processes, retries, queues, schedules, and monitoring. Relevant when the agent observes or acts beyond a single request-response interaction.

### Google Cloud Run

Potential hosting for backend services, workers, and persistent agent services.

### Mozilla / Mozilla.ai

Part of the sponsor ecosystem. Select a specific tool only if it supports the chosen behaviour.

## Selection rule

Start from a required behaviour:

- reason or act;
- become part of an interface;
- investigate externally;
- observe events over time;
- act asynchronously;
- have an identity;
- request permission;
- act with scoped authority;
- delegate;
- generate UI;
- change application state;
- remember, notify, see, or hear.

Then use the smallest set of technologies that makes the golden path reliable.
