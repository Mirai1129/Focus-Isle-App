# Focus Isle App Design 🌴

A focus timer app that helps users stay productive by growing virtual plants. Complete focus sessions to grow and collect plants!

## ✨ Features

- 🌱 **Focus Timer** - Set custom focus durations (25-180 minutes)
- 🌸 **Plant Growing** - Grow virtual plants during focus sessions
- 📊 **Analytics** - Track your focus history and statistics
- 🏝️ **Plant Collection** - Unlock and collect rare plants
- 📱 **App Whitelist** - Allow specific apps during focus
- 🌍 **i18n Support** - English and Traditional Chinese

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth + Edge Functions)
- **State**: React Context API
- **i18n**: i18next

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## � Docker

### Build and Run

```bash
# Build the image
docker build -t focus-isle .

# Run the container
docker run -p 8080:80 focus-isle
```

The app will be available at `http://localhost:8080`

### With Environment Variables

```bash
# Build with Supabase credentials
docker build \
  --build-arg VITE_SUPABASE_PROJECT_ID=your-project-id \
  --build-arg VITE_SUPABASE_ANON_KEY=your-anon-key \
  -t focus-isle .

# Run
docker run -p 8080:80 focus-isle
```

### Docker Compose (optional)

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "8080:80"
    environment:
      - VITE_SUPABASE_PROJECT_ID=your-project-id
      - VITE_SUPABASE_ANON_KEY=your-anon-key
```

## �📁 Project Structure

```
src/
├── components/      # React components
│   ├── ui/          # shadcn/ui components
│   └── figma/       # Figma-related components
├── context/         # React Context (FocusContext)
├── i18n/            # Internationalization
│   └── locales/     # en.json, zh-TW.json
├── styles/          # Global styles
└── utils/           # Utility functions
    └── supabase/    # Supabase client

supabase/
└── functions/       # Edge Functions (Deno)
```

## 📖 Documentation

See [DOCUMENTATION.md](DOCUMENTATION.md) for:

- Architecture details
- JWT authentication design
- Database structure
- Troubleshooting guide

## 📄 License

This project uses components from:

- [shadcn/ui](https://ui.shadcn.com/) - MIT License
- [Unsplash](https://unsplash.com) - Unsplash License
