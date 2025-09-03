# 🌐 Netlify Deployment Guide - Debatcoach AI

> **Specifieke Netlify configuratie voor de Debatcoach AI applicatie**

## ⚡ Quick Deploy via Bolt.new

### 1-Click Deploy
```bash
# Direct deployment vanuit Bolt.new:
1. Klik "Deploy to Netlify" in Bolt interface
2. Authorize Netlify GitHub access
3. Site wordt automatisch geconfigureerd
4. Add environment variables (zie hieronder)
5. Ready to go! 🚀
```

## 🔧 Netlify Configuration

### Build Settings
```toml
# netlify.toml - Automatisch geconfigureerd
[build]
  command = "npm run build"
  publish = ""                    # LEEG LATEN voor Next.js
  
[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "8"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables Setup
**Site Settings → Environment Variables:**

| Variable | Value | Required | Purpose |
|----------|-------|----------|---------|
| `GEMINI_API_KEY` | `gai_xxxxxxx` | ✅ Yes | AI debatcoach functionaliteit |
| `NODE_ENV` | `production` | ✅ Auto-set | Production optimizations |

🔑 **API Key Source:**
- **Gemini**: [Google AI Studio](https://makersuite.google.com/app/apikey) - Gratis voor educatief gebruik

## 🚀 Function Configuration

### Serverless Functions
```javascript
// Automatisch gecreëerde Netlify Function:
src/app/api/chat/route.ts → /.netlify/functions/chat
```

### Function Limits
| Feature | Free Tier | Pro Tier | Notes |
|---------|-----------|----------|-------|
| **Function Timeout** | 10 seconds | 26 seconds | Voldoende voor debat responses |
| **Memory** | 1024MB | 3008MB | Ruim voldoende |
| **Monthly Executions** | 125K | 2M | Geschikt voor klasgebruik |

## 🛡️ Security Configuration

### Headers & CORS
```toml
# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

# API CORS  
[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"
```

## 📊 Monitoring & Performance

### Key Metrics
```bash
# Monitor deze metrics:
- Function execution duration (debat responses)
- API quota usage (Gemini)
- User engagement (sessie lengtes)
- Error rates per endpoint
```

## 🚨 Troubleshooting

### Build Failures
```bash
# Common errors:
❌ "GEMINI_API_KEY not found"     → Check environment variables
❌ "Command failed: npm run build" → Check package.json scripts  
❌ "Function build timeout"       → Check dependencies
```

### Function Errors
```bash
# Debat Issues:
❌ "API key not found"           → Check env vars exactly  
❌ "No response generated"       → Check Gemini API quota
❌ "Stelling generation failed"  → Check internet model access
```

## 🎯 Post-Deploy Checklist

### ✅ Core Functionality Tests
1. **Homepage laadt** → Basis deployment werkt
2. **Debat starten** → Gemini API & key werkt
3. **Stelling generatie** → Internet model werkt
4. **Tegenargumenten** → AI logica werkt
5. **Feedback systeem** → Constructieve responses
6. **Sessie voltooien** → Volledige workflow werkt
7. **Mobile responsive** → Touch interfaces werken

### ✅ Educational Workflow Test
```
Complete test scenario:
1. Klik "Start Debat"
2. Wacht op actuele stelling
3. Reageer op eerste tegenargument
4. Ontvang feedback + nieuw tegenargument
5. Voltooi 4 rondes
6. Ontvang samenvatting + reflectievraag
Verwacht: Volledig werkende debattraining
```

## 💰 Cost Optimization

### Free Tier Usage
```bash
Gemini API (Free Tier):
✅ 15 requests per minuut
✅ 1500 requests per dag
✅ Gratis voor educatief gebruik

Netlify (Free Tier):
✅ 125K function executions/month
✅ 100GB bandwidth
✅ Perfect voor klasgebruik
```

## 🎓 Educational Implementation

### Voor Scholen
```bash
# Multi-class setup:
1. Deploy één instantie per school
2. Deel URL met docenten
3. Leerlingen gebruiken direct (geen accounts)
4. Monitor usage via Netlify dashboard
```

### Lesplan Integratie
```bash
# Suggestie voor 50-minuten les:
10 min: Uitleg debatregels
30 min: Individuele AI debattraining
10 min: Klassikale bespreking van argumenten
```

## 🔗 Resources

### Official Documentation
- [Gemini API Docs](https://ai.google.dev/docs)
- [Next.js on Netlify](https://docs.netlify.com/frameworks/next-js/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)

### Educational Resources
- [Nederlands Debat Instituut](https://www.debatinstituut.nl/)
- [Argumentatie Technieken](https://www.rug.nl/research/portal/en/publications/argumentation-theory)

---

## 🚀 Ready for Educational Use!

Deze Netlify deployment guide helpt je de Debatcoach AI succesvol te implementeren in je onderwijsomgeving. Van setup tot monitoring - alles wat je nodig hebt voor effectieve debattraining!

**🎯 Geoptimaliseerd voor onderwijs**  
**💙 Eenvoudige deployment via Bolt.new**

---

*Netlify Guide voor Debatcoach AI v1.0*