# AllergyGuard

AllergyGuard allows you to scan food barcodes and instantly check them against your personal allergy profile. If a product is unsafe, it uses Google Gemini AI to automatically find and suggest safer, allergen-free alternatives.

## Features
*   **Real-time Barcode Scanning**: Instantly identify products using OpenFoodFacts.
*   **Personalized Safety Check**: Checks ingredients against your custom allergy profile.
*   **AI Recommendations**: Automatically finds safe alternatives for unsafe products using Google Gemini AI.
*   **Scan History**: Keeps track of all your previous scans.

## 🚀 How to Run the App

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/SudoMike1/allergy-guard.git
cd allergy-guard
npm install
```

### 3. API Key Configuration
This app requires a Google Gemini API key to fetch AI recommendations.

1.  Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Open the file `src/services/RecommendationService.ts`.
3.  Paste your API key into the `GEMINI_API_KEY` variable:

```typescript
// src/services/RecommendationService.ts
export const GEMINI_API_KEY: string = "YOUR_PASTED_API_KEY_HERE";
```

### 4. Running the App
Start the development server:

```bash
npx expo start
```

*   **To run on your phone**: Download the **Expo Go** app (iOS/Android) and scan the QR code shown in the terminal.
*   **To run on simulator**: Press `i` for iOS Simulator or `a` for Android Emulator.
