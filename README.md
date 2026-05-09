# pIXEL GHOST 🛡️

**pixelghost** is an advanced, cinematic, and military-grade Image Steganography + Cryptography platform. It allows users to encrypt sensitive data (text or binary files) using AES-256-GCM and then invisibly embed that data into ordinary-looking PNG images using Least-Significant-Bit (LSB) steganography.

---

## 🚀 Vision
Built for the privacy-conscious, PixelGhost operates 100% locally in your browser. No data ever leaves your computer. Its design is inspired by high-end cybersecurity dashboards with a sleek, cyberpunk aesthetic.

---

## 🔒 Security Specs
### Encryption Engine
- **Algorithm**: AES-256-GCM (Authenticated Encryption)
- **Key Derivation**: PBKDF2 with SHA-256
- **Iterations**: 250,000 (standard), up to 1,000,000 (paranoid)
- **Nonce/IV**: 96-bit cryptographically secure random generation
- **Integrity**: GCM Auth Tag verification to prevent tampering

### Steganography Engine
- **Method**: LSB (Least Significant Bit) logic
- **Channels**: RGB (Red, Green, Blue) channels
- **Depth**: 1 bit per channel (high stealth, minimal visual impact)
- **Capacity**: Interactive calculation based on host image resolution
- **Format**: PNG output required to prevent lossy compression from destroying hidden data

---

## ✨ Features
1. **Dashboard**: High-level overview of system status and recent operations.
2. **Hide Data**: Encrypt text or files and embed them into a PNG container.
3. **Extract Data**: Retrieve, verify integrity, and decrypt hidden secrets.
4. **Scanner**: Statistical anomaly detection with LSB entropy heatmaps.
5. **Deniable Mode**: Plausible deniability system (Fake password vs Real password logic).
6. **Secure Chat**: Local simulator for end-to-end encrypted stego conversations.
7. **Settings**: Security-level presets and auto-wipe memory configurations.

---

## 🛠️ Technical Stack
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui
- **State**: Zustand
- **Icons**: Lucide
- **Charts**: Recharts
- **Cryptography**: Native Web Crypto API

---

## ⚠️ Security Notes
- **Compression Warning**: LSB steganography is fragile. Sharing images on platforms like Discord, WhatsApp, or Facebook will likely corrupt the hidden data due to their image compression algorithms. Transfer raw PNG files directly.
- **Local Strength**: This application uses no servers. Your security depends entirely on the strength of your password. Use 16+ characters for maximum protection.
- **Volatile Memory**: StegVault is designed to wipe its internal memory buffers upon session completion or clear.

---

## 📦 Getting Started
1. **Host Image**: Choose a high-quality PNG or JPG for the best concealment.
2. **Password**: Choose a strong password. You'll need this exact password to extract the data later.
3. **Payload**: Enter your text or upload a small file.
4. **Deploy**: Generate the vault image and download it.

---

*Stay Shadow. Stay Secure.*
