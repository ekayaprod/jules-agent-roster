# Jules Master Agent Roster - Architecture

## 1. System Context

High-level view of the application and its interactions with the user and external data sources.

```mermaid
graph TD;
    User((User)) -->|Interacts with| Browser[Browser Application];

    subgraph Browser Application
        App[Jules Roster App];
        Store[Local Storage / Memory];
    end

    subgraph Data Source
        FileSystem[Static File System];
        AgentsJSON[agents.json];
        CustomAgentsJSON[custom_agents.json];
        Prompts[Prompt Files .md];
    end

    App -->|Fetches Data| FileSystem;
    FileSystem -->|Provides Configuration| AgentsJSON;
    FileSystem -->|Provides Fusions| CustomAgentsJSON;
    FileSystem -->|Provides Content| Prompts;
```

## 2. Component Architecture

Detailed view of the JavaScript modules and their relationships.

```mermaid
graph TD;
    subgraph Core Logic
        RosterApp[RosterApp.js] -->|Initializes| AgentRepo[AgentRepository.js];
        RosterApp -->|Initializes| FusionLab[FusionLab.js];
        FusionLab -->|Uses| FusionCompiler[FusionCompiler.js];
        FusionCompiler -->|Uses| PromptParser[PromptParser.js];
    end

    subgraph UI Components
        RosterApp -->|Renders| AgentCard[AgentCard.js];
        RosterApp -->|Uses| Toast[ToastNotification.js];
        RosterApp -->|Uses| Clipboard[ClipboardUtils.js];
        FusionLab -->|Uses| Clipboard;
        FusionLab -->|Uses| FusionIndex[FusionIndex.js];
    end

    subgraph Data Flow
        AgentRepo -->|Fetches| JSON[JSON Configs];
        AgentRepo -->|Fetches| MD[Markdown Prompts];
        AgentRepo -->|Validates| Schema[Data Schema];
    end

    classDef core fill:#f9f,stroke:#333,stroke-width:2px;
    classDef ui fill:#ccf,stroke:#333,stroke-width:2px;
    classDef data fill:#ffc,stroke:#333,stroke-width:2px;

    class RosterApp,FusionLab,FusionCompiler,PromptParser,AgentRepo core;
    class AgentCard,Toast,Clipboard,FusionIndex ui;
    class JSON,MD,Schema data;
```

## 3. Fusion Logic Flow

The core logic for synthesizing two agents into a single fusion protocol.

```mermaid
sequenceDiagram
    participant User
    participant FusionLab
    participant FusionCompiler
    participant PromptParser

    User->>FusionLab: Select Agent A & Agent B
    User->>FusionLab: Click "Ignite Fusion Protocol"
    FusionLab->>FusionCompiler: fuse(AgentA, AgentB)

    rect rgb(240, 248, 255)
        note right of FusionCompiler: Fusion Process
        FusionCompiler->>FusionCompiler: Check for Custom Fusion (Named)
        alt Custom Fusion Exists
            FusionCompiler-->>FusionLab: Return Pre-defined Custom Agent
        else Dynamic Fusion
            FusionCompiler->>FusionCompiler: Sort Agents by DAG Pipeline Index
            FusionCompiler->>PromptParser: extractSection(AgentA.prompt)
            FusionCompiler->>PromptParser: extractSection(AgentB.prompt)
            FusionCompiler->>FusionCompiler: Stitch Prompts (Phase 1 -> Phase 2)
            FusionCompiler->>FusionCompiler: Wrap in XML/JSON Schema
            FusionCompiler-->>FusionLab: Return Dynamically Fused Agent
        end
    end

    FusionLab->>User: Display Result & Animation
```

## 4. Trust Boundaries

- **Browser**: The entire application runs client-side in the user's browser. No data is sent to a backend server.
- **File System**: The application treats the static file system as a trusted source of configuration and content.
- **External APIs**: The application fetches images from the Emoji Kitchen API (Google) for fusion icons. No user data is sent.

## 5. Key Design Decisions

- **Client-Side Only**: To ensure privacy and ease of deployment (GitHub Pages compatible).
- **Static JSON Configuration**: `agents.json` and `custom_agents.json` drive the UI, allowing for easy updates without code changes.
- **DAG Pipeline**: Agents are executed in a strict Directed Acyclic Graph order (e.g., Architect -> Builder) regardless of selection order, ensuring logical consistency.
- **XML Prompt Structure**: Moving towards structured XML prompts for better parsing and reliability.
