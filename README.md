# UDL STEM Lab

A mobile-first learning app that delivers STEM lab experiences with UDL supports, AI scaffolding, light gamification, accessibility-first UX, and teacher-facing analytics.

## MVP Features

- **One Complete Lab Module**: Intro to Electric Circuits (Series vs Parallel)
- **UDL Supports**: Representation (audio, simplified language, glossary), Engagement (difficulty levels, points/badges), Action/Expression (response modes)
- **Accessibility**: High contrast, reduce motion, font size, keyboard navigation, screen reader support, text mode alternative
- **AI Support**: Hints, explanations, and step breakdowns (deterministic, from content pack)
- **Interactive Simulation**: Circuit builder with drag-and-drop (or text mode)
- **Knowledge Checks**: Adaptive difficulty with remediation
- **Analytics**: Event logging and teacher dashboard
- **Teacher Dashboard**: View student progress, time on task, hint usage, mastery, and session timelines

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **LocalStorage** for data persistence (no backend required)
- **Local JSON** content pack for lab content

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Deployment

**Live URL**: https://disruptiveexperience.com/udl-stem-lab

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Quick Redeploy** (on server):
```bash
cd /var/www/udl-stem-lab
git pull origin main
npm install
npm run build
pm2 restart udl-stem-lab
```

## Project Structure

```
/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── onboarding/        # Student onboarding
│   ├── modules/           # Module selection
│   ├── lab/[moduleId]/   # Lab flow with stepper
│   ├── results/[moduleId]/ # Results page
│   └── teacher/           # Teacher dashboard
├── components/            # React components
│   ├── SimulationPanel.tsx
│   ├── AISupportPanel.tsx
│   └── KnowledgeCheck.tsx
├── lib/                   # Core libraries
│   ├── store.ts          # Zustand state management
│   ├── analytics.ts      # Event logging
│   ├── circuitSim.ts     # Circuit simulation engine
│   └── contentLoader.ts  # Content pack loader
└── data/
    └── contentPack.json  # Lab content (steps, questions, etc.)
```

## Content Pack

The content pack (`/data/contentPack.json`) contains:

- **Module metadata**: Title, description, objectives, estimated time
- **Steps**: Instructions, expected sim state, hints, explainers, vocabulary
- **Knowledge Checks**: Questions with options, correct answers, remediation
- **Rubric**: Performance assessment criteria
- **Misconception Library**: Common mistakes with detection and correction

### Adding a New Module

1. Add a new module object to `contentPack.json` in the `modules` array
2. Follow the existing structure for steps, knowledge checks, etc.
3. The app will automatically pick up the new module

## Features in Detail

### Student Flow

1. **Landing**: Choose Student or Teacher role
2. **Onboarding**: Select UDL supports and accessibility settings
3. **Module Select**: View available modules and start
4. **Lab Flow**: 
   - Stepper UI showing progress
   - Step instructions with supports (audio, simplified language, glossary)
   - Interactive circuit simulation (visual or text mode)
   - AI support panel (hints, explanations, smaller steps)
   - Knowledge checks after certain steps
5. **Results**: Mastery snapshot, supports used, badges/points, export summary

### Teacher Dashboard

- View all student sessions
- Metrics: time on task, hint requests, mastery per objective
- Drill down into individual session timelines
- See common error types

### Accessibility

- Full keyboard navigation
- Screen reader support (ARIA labels, semantic HTML)
- High contrast mode
- Reduce motion mode
- Font size adjustment
- Text mode alternative for simulation

### Circuit Simulation

The simulation engine can:
- Detect circuit topology (series, parallel, simple)
- Determine if circuit is closed/open
- Calculate current flow (simplified)
- Support drag-and-drop or text-based interaction

## Development

### Building for Production

```bash
npm run build
npm start
```

### Testing

The project is set up for Playwright testing (optional). To add tests:

1. Install Playwright: `npm install -D @playwright/test`
2. Create tests in `/tests` directory
3. Run: `npx playwright test`

## Future Enhancements (Not in MVP)

- AR Mode (placeholder exists)
- Backend API for AI hints (currently deterministic from content pack)
- User authentication
- Multiple modules
- Voice input for responses
- More sophisticated circuit physics

## License

MIT
