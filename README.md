# 🎯 Debatcoach AI - Kritische Tegenargumenten

> **Een intelligente debatcoach die leerlingen uitdaagt met tegenargumenten en constructieve feedback geeft**

Een Next.js applicatie die gebruik maakt van Gemini AI om leerlingen te helpen hun debatvaardigheden te ontwikkelen door middel van interactieve oefensessies met actuele stellingen.

## ✨ Features

### 🎯 **Debattraining**
- 🤖 **AI-gegenereerde stellingen**: Actuele, maatschappelijk relevante onderwerpen
- 🔄 **Kritische tegenargumenten**: Vanuit verschillende perspectieven (economisch, ethisch, praktisch, etc.)
- 📝 **Constructieve feedback**: Wat gaat goed, wat kan beter
- 🎓 **Reflectievragen**: Dieper nadenken over debattechnieken

### 🧠 **AI-functionaliteiten**
- 🌐 **Internet toegang**: Gemini 2.0 Flash met actuele informatie
- ⚡ **Snelle responses**: Gemini 2.5 Flash voor optimale balans
- 🏆 **Hoogste kwaliteit**: Gemini 2.5 Pro voor complexe analyses
- 📱 **Responsive design**: Werkt perfect op alle apparaten

### 🎨 **User Experience**
- 💙 **Moderne interface**: Strakke blauwe interface met Tailwind CSS
- 📱 **Mobile first**: Perfect responsive op alle apparaten
- ⚡ **Real-time feedback**: Directe reacties en voortgangsindicatie
- 🎮 **Keyboard shortcuts**: Enter om te verzenden

## 🚀 Quick Start

### Stap 1: 🔑 API Key verkrijgen
Verkrijg een gratis Gemini API key: [Google AI Studio](https://makersuite.google.com/app/apikey)

### Stap 2: 🛠️ Project Setup
```bash
# Clone het project
git clone [your-repo-url]
cd debate-coach-ai

# Dependencies installeren
npm install

# Environment variables
cp .env.example .env.local
# Edit .env.local en voeg je API key toe
```

### Stap 3: 🔧 Environment Configuration
Maak `.env.local` aan met je API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Stap 4: 🎉 Start & Test
```bash
npm run dev
# Open http://localhost:3000
# Start je eerste debattraining!
```

## 🎓 Hoe werkt het?

### 📋 **Debatflow**
1. **Start**: AI genereert een actuele, relevante stelling
2. **Tegenargument**: Coach geeft een kritisch tegenargument
3. **Reactie**: Leerling reageert met argumenten
4. **Feedback**: Coach geeft constructieve feedback
5. **Herhaal**: 3-4 rondes vanuit verschillende perspectieven
6. **Afsluiting**: Samenvatting en reflectievraag

### 🎯 **Verschillende Perspectieven**
- 💰 **Economisch**: Kosten, banen, economische groei
- ⚖️ **Ethisch**: Goed/fout, rechtvaardigheid, moraal
- 🔧 **Praktisch**: Uitvoerbaarheid, logistiek, haalbaarheid
- ❤️ **Emotioneel**: Gevoelens, angsten, persoonlijke impact
- 📜 **Juridisch**: Wetten, rechten, regelgeving
- 🔬 **Wetenschappelijk**: Onderzoek, feiten, data
- 👥 **Sociaal**: Gemeenschap, samenleving, cultuur
- 💻 **Technologisch**: Innovatie, digitalisering, toekomst

## 🛠️ Technical Architecture

### 📂 **Project Structure**
```
├── 🔑 .env.local                 # API Keys
├── 📦 package.json               # Dependencies
├── ⚙️ next.config.js             # Next.js configuration
└── src/
    ├── 🎨 app/
    │   ├── 🌍 globals.css         # Tailwind CSS styling
    │   ├── 📱 layout.tsx          # App layout & metadata
    │   ├── 🏠 page.tsx            # Main interface
    │   └── 🔌 api/
    │       └── 💬 chat/route.ts   # Gemini AI endpoint
    └── 🧩 components/
        ├── 🎯 DebateCoach.tsx     # Main debate interface
        └── 📝 MarkdownRenderer.tsx # Response formatting
```

### 🔌 **API Endpoints**

| Endpoint | Functie | Input | Output |
|----------|---------|-------|--------|
| `/api/chat` | Gemini AI Conversatie | `message`, `aiModel` | AI Response |

## 🌐 Deployment

### 🎯 **Netlify (Aanbevolen)**
1. ✅ "Deploy to Netlify" button in Bolt.new
2. ✅ Build settings: `npm run build`
3. ✅ Environment variables toevoegen: `GEMINI_API_KEY`
4. ✅ Automatische HTTPS & CDN

### ⚡ **Vercel Alternative**
```bash
npm install -g vercel
vercel --prod
# Vergeet niet environment variables in te stellen!
```

## 🎓 Educational Use Cases

### 👨‍🏫 **Voor Docenten**
- 🎯 **Debatles voorbereiden**: Laat leerlingen oefenen met verschillende stellingen
- 📊 **Argumentatie beoordelen**: Zie hoe leerlingen reageren op tegenargumenten
- 🔄 **Verschillende perspectieven**: Train leerlingen om vanuit meerdere hoeken te denken
- 📝 **Feedback geven**: Leer van de AI hoe je constructieve feedback geeft

### 👩‍🎓 **Voor Leerlingen**
- 💪 **Debatvaardigheden**: Train argumenteren en tegenargumenten weerleggen
- 🧠 **Kritisch denken**: Leer verschillende perspectieven te overwegen
- 📚 **Actuele kennis**: Oefen met relevante, hedendaagse onderwerpen
- 🎯 **Zelfvertrouwen**: Bouw vertrouwen op in discussies en presentaties

## 🔧 Customization

### 🎨 **Styling aanpassen**
```css
/* globals.css - Pas het kleurenschema aan */
:root {
  --primary-color: #2563eb;     /* Blauw accent */
  --secondary-color: #f1f5f9;   /* Light background */
  --success-color: #10b981;     /* Groen voor feedback */
  --warning-color: #f59e0b;     /* Oranje voor stellingen */
}
```

### 🤖 **AI Model configuratie**
```typescript
// In DebateCoach.tsx - pas de standaard AI modellen aan
const defaultModel = 'smart' // 'pro', 'smart', of 'internet'
```

### 📝 **Debat instellingen**
```typescript
// Aantal rondes aanpassen
const maxRondes = 4 // Standaard 4 rondes

// Perspectieven uitbreiden
const perspectieven = [
  'economisch', 'ethisch', 'praktisch', 'emotioneel',
  'juridisch', 'wetenschappelijk', 'sociaal', 'technologisch',
  'historisch', 'cultureel' // Voeg nieuwe toe
]
```

## 🚨 Troubleshooting

### ❌ **Veelvoorkomende problemen**
| Probleem | Oplossing |
|----------|-----------|
| "API key niet gevonden" | Check `.env.local` bestand en herstart dev server |
| "Geen stelling gegenereerd" | Controleer internet verbinding en API quota |
| "Tegenargument te algemeen" | AI model switchen naar 'pro' voor betere kwaliteit |
| "Feedback niet constructief" | Prompt aanpassen in `DebateCoach.tsx` |

### 🔧 **Development**
```bash
# Development mode
npm run dev

# Production build test
npm run build && npm start

# Type checking
npm run lint
```

## 📚 Resources

### 🔗 **API Documentation**
- [Gemini API Docs](https://ai.google.dev/docs) - Google AI ontwikkelaar resources
- [Next.js 15](https://nextjs.org/docs) - Framework documentatie

### 🎥 **Debat Resources**
- [Debatteren voor Beginners](https://www.debatinstituut.nl/) - Nederlandse debat technieken
- [Argumentatie Theorie](https://www.rug.nl/research/portal/en/publications/argumentation-theory) - Academische bronnen

---

## 🎉 **Klaar om te debatteren?**

Deze debatcoach helpt leerlingen hun argumentatievaardigheden te ontwikkelen door middel van interactieve AI-sessies. Van actuele stellingen tot kritische tegenargumenten - alles wat je nodig hebt voor effectieve debattraining!

**🎯 Gemaakt voor het onderwijs**  
**🚀 Deploy nu en start met trainen!**

---

*Debatcoach AI v1.0*  
*Powered by Gemini AI & Next.js*