# 🚀 Debatcoach AI Deployment Guide

## ⚡ Snelle Netlify Deploy via Bolt.new

### Stap 1: Deploy via Bolt
1. **In Bolt.new:** Klik op "Deploy to Netlify"
2. **Volg de prompts** om je Netlify account te koppelen
3. **Wacht tot de eerste build compleet is** (kan 2-3 minuten duren)

### Stap 2: Configureer Build Settings
Ga direct naar je Netlify dashboard en controleer:

**Site Settings → Build & Deploy → Build Settings:**
- ✅ **Build command:** `npm run build` 
- ✅ **Publish directory:** (moet LEEG zijn!)
- ✅ **Base directory:** (moet LEEG zijn!)
- ✅ **Node version:** 18.x of hoger

### Stap 3: Environment Variables (KRITISCH!)
**Site Settings → Environment Variables:**

**VEREIST:**
- **Key:** `GEMINI_API_KEY`
- **Value:** jouw_echte_gemini_api_key
- **Scope:** Alle scopes

🔑 **API Key verkrijgen:**
- [Gemini API Key](https://makersuite.google.com/app/apikey) - Google AI Studio (gratis voor educatief gebruik)

### Stap 4: Redeploy & Test
Na het instellen van de API key:
- **Deploys tab → Trigger deploy** 
- **Test debatfunctionaliteit** (zie checklist hieronder)

## 🛠️ Advanced Configuration

### Dependencies Verificatie
Het project gebruikt deze dependencies:
```json
{
  "@google/generative-ai": "^0.21.0",    // Gemini API
  "next": "15.3.3",                      // Next.js framework
  "react": "^18.3.1",                    // React
  "tailwindcss": "^3.4.17"              // Styling
}
```

### Function Performance
```bash
# Response times:
Stelling generatie:        3-8 seconden (internet model)
Tegenargument generatie:   2-5 seconden (smart model)
Feedback generatie:        2-4 seconden (smart model)
Samenvatting:             3-6 seconden (smart model)
```

## 🔧 Troubleshooting Guide

### 🚨 Critical Issues

#### Probleem: Blanco/Witte Pagina
**Oplossing:** 
1. Ga naar Build Settings
2. Zet Publish directory op **leeg**
3. Check build log voor errors
4. Redeploy

#### Probleem: "API Key niet ingesteld" Error
**Oplossing:**
1. Check `GEMINI_API_KEY` exact geschreven (hoofdlettergevoelig)
2. Geen extra spaties in value
3. Redeploy na wijzigen
4. Test API key in [Google AI Studio](https://makersuite.google.com/app/apikey)

#### Probleem: Geen Stellingen Gegenereerd
**Symptomen:** "Kon geen stelling genereren" error
**Oplossing:**
1. Check internet connectiviteit
2. Verify Gemini API quota
3. Test met 'smart' model als fallback
4. Check Netlify function logs

#### Probleem: Tegenargumenten Te Algemeen
**Symptomen:** Zwakke of generieke tegenargumenten
**Oplossing:**
1. Switch naar 'pro' model voor betere kwaliteit
2. Check prompt engineering in `DebateCoach.tsx`
3. Verify API key heeft toegang tot nieuwste modellen

### 📱 Mobile & Browser Issues

#### Debat Interface Werkt Niet op Mobile
**Oplossing:**
1. Test responsive design op verschillende schermformaten
2. Check touch events voor buttons
3. Verify textarea werkt correct op mobile keyboards

#### Lange Laadtijden
**Oplossing:**
1. Check Netlify function cold starts
2. Monitor API response times
3. Consider function warming strategies

## 📊 Performance Benchmarks

### Deployment Success Indicators:
- **Homepage load:** < 2 seconden
- **Debat start:** < 5 seconden (stelling generatie)
- **Tegenargument:** < 4 seconden
- **Feedback:** < 3 seconden
- **Mobile experience:** Smooth touch interactions

### Educational Metrics:
- **Sessie voltooiing:** > 80% van gestarte debatten
- **Gemiddelde sessie:** 8-12 minuten
- **Argumenten per ronde:** 2-4 zinnen gemiddeld
- **Feedback kwaliteit:** Constructief en specifiek

## 🎓 Educational Deployment

### Voor Scholen
```bash
# Aanbevolen setup:
1. Eén deployment per school/afdeling
2. Deel URL met docenten
3. Geen user accounts nodig
4. Monitor usage via Netlify analytics
```

### Klasgebruik
```bash
# Capaciteit planning:
Free Tier: 125K function calls/maand
= ~4000 debatsessies/maand
= ~130 sessies/dag
= Perfect voor 1-3 klassen dagelijks gebruik
```

### Privacy & GDPR
```bash
# Data handling:
✅ Geen persoonlijke data opgeslagen
✅ Geen user tracking
✅ Sessies zijn anoniem
✅ Geen cookies gebruikt
✅ GDPR compliant by design
```

## 🔄 Update Workflow

### Voor Docenten
1. **Feedback verzamelen** van leerlingen over stellingen/argumenten
2. **Aanpassingen voorstellen** via GitHub issues
3. **Testen** van nieuwe features in staging environment
4. **Deployment** van updates via Bolt.new

### Content Updates
```bash
# Stellingen updaten:
1. Pas prompts aan in DebateCoach.tsx
2. Test lokaal met npm run dev
3. Deploy via Bolt.new
4. Test met echte leerlingen

# Feedback verbeteren:
1. Analyseer leerling reacties
2. Verfijn feedback prompts
3. Test verschillende AI modellen
4. Monitor engagement metrics
```

## 🆘 Emergency Procedures

### Site Completely Down
1. **Check Netlify status** - [netlifystatus.com](https://netlifystatus.com)
2. **Rollback** - Deploys → Previous deploy → Publish
3. **Backup plan** - Gebruik traditionele debatmethoden

### API Quota Exceeded
```bash
# Gemini API limits bereikt:
1. Check usage in Google AI Studio
2. Upgrade naar paid tier indien nodig
3. Implement rate limiting
4. Temporary fallback naar offline debat
```

## 🎯 Success Metrics

### Technical Success:
✅ **Debat start** werkt binnen 5 seconden  
✅ **Alle AI modellen** reageren correct  
✅ **Tegenargumenten** zijn relevant en uitdagend  
✅ **Feedback** is constructief en specifiek  
✅ **Mobile experience** is gebruiksvriendelijk  
✅ **Error handling** toont duidelijke berichten  

### Educational Success:
✅ **Leerling engagement** hoog (lange sessies)  
✅ **Argumentatie kwaliteit** verbetert per ronde  
✅ **Docent feedback** positief  
✅ **Technische problemen** minimaal  
✅ **Toegankelijkheid** voor alle leerlingen  

---

## 🚀 Ready for Educational Impact!

Deze deployment guide zorgt ervoor dat je Debatcoach AI succesvol kunt implementeren in je onderwijsomgeving. Van technische setup tot educatieve best practices - alles voor effectieve debattraining!

**🎓 Geoptimaliseerd voor het onderwijs**  
**🌐 Betrouwbare Netlify hosting**

---

*Deployment Guide voor Debatcoach AI v1.0*  
*Last updated: December 2024*