# 🎨 VoiceAid - Visual Guide

## 📱 App Screens

### Home Screen
```
┌─────────────────────────────┐
│                             │
│      Tap to speak           │
│                             │
│          ⭕ BUTTON          │
│        (Gray/Blue/          │
│       Green/Orange)         │
│                             │
│   Tap to start speaking     │
│                             │
├─────────────────────────────┤
│  🎤 Home  │  ⚙️ Settings   │
└─────────────────────────────┘
```

### Settings Screen
```
┌─────────────────────────────┐
│                             │
│      Settings               │
│                             │
│  Audio Settings             │
│  Language                   │
│  Accessibility              │
│  About                      │
│                             │
├─────────────────────────────┤
│  🎤 Home  │  ⚙️ Settings   │
└─────────────────────────────┘
```

### Caretaker Setup Modal
```
┌─────────────────────────────┐
│  Caretaker Setup            │
│                             │
│  Caretaker Phone Number     │
│  Enter phone number         │
│  ┌─────────────────────┐    │
│  │ [Phone Number]      │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │      Save           │    │
│  └─────────────────────┘    │
│                             │
│  Currently saved:           │
│  +1 (555) 123-4567          │
│                             │
└─────────────────────────────┘
```

---

## 🎨 Button States

### State 1: Idle (Gray)
```
        ⭕
      Ready
```
**Color**: Gray (#9E9E9E)
**Action**: Tap to start recording

### State 2: Listening (Blue)
```
        🔵
      Listening...
      (Pulsing)
```
**Color**: Blue (#2196F3)
**Action**: Tap to stop recording

### State 3: Processing (Green)
```
        🟢
      Processing...
      (Pulsing)
```
**Color**: Green (#4CAF50)
**Action**: Sending to backend

### State 4: Speaking (Orange)
```
        🟠
      Speaking...
      (Pulsing)
```
**Color**: Orange (#FF9800)
**Action**: Playing AI response

---

## 🔄 User Flow Diagram

```
START
  │
  ├─→ User sees Home Screen
  │   - Gray button
  │   - "Tap to speak" text
  │
  ├─→ User taps button
  │   - Button turns BLUE
  │   - "Listening..." text
  │   - Recording starts
  │
  ├─→ User speaks message
  │   - Microphone recording
  │   - Button pulsing
  │
  ├─→ User taps button again
  │   - Recording stops
  │   - Button turns GREEN
  │   - "Processing..." text
  │
  ├─→ App sends to backend
  │   - FormData with audio
  │   - Waiting for response
  │
  ├─→ Backend processes
  │   - Speech to Text
  │   - AI processing
  │   - Text to Speech
  │
  ├─→ Backend returns audio
  │   - Button turns ORANGE
  │   - "Speaking..." text
  │
  ├─→ App plays response
  │   - Audio playback
  │   - Button pulsing
  │
  ├─→ Playback finishes
  │   - Button turns GRAY
  │   - "Tap to speak" text
  │
  └─→ Ready for next message
```

---

## 📊 Component Hierarchy

```
App
│
├── RootLayout
│   │
│   ├── TabLayout
│   │   │
│   │   ├── HomeScreen
│   │   │   └── VoiceButton
│   │   │       ├── Animated.View
│   │   │       └── TouchableOpacity
│   │   │
│   │   └── SettingsScreen
│   │       ├── ScrollView
│   │       ├── View (sections)
│   │       └── Text
│   │
│   └── CaretakerScreen (Modal)
│       ├── View
│       ├── TextInput
│       ├── TouchableOpacity
│       └── Text
│
└── Navigation
    ├── Tabs
    ├── Stack
    └── Modal
```

---

## 🎯 Color Palette

| State | Color | Hex | RGB |
|-------|-------|-----|-----|
| Idle | Gray | #9E9E9E | 158, 158, 158 |
| Listening | Blue | #2196F3 | 33, 150, 243 |
| Processing | Green | #4CAF50 | 76, 175, 80 |
| Speaking | Orange | #FF9800 | 255, 152, 0 |
| Background | Light Gray | #F5F5F5 | 245, 245, 245 |
| Text | Dark Gray | #333333 | 51, 51, 51 |

---

## 📐 Layout Dimensions

### Button
```
Width: 200px
Height: 200px
Border Radius: 100px (circle)
Shadow: 8px elevation
```

### Screen
```
Padding: 20px
Background: #F5F5F5
Safe Area: Handled by React Native
```

### Text
```
Status Text: 32px, Bold
Instruction Text: 20px, Regular
Label Text: 18px, Semi-bold
```

---

## 🎬 Animation States

### Button Pulse Animation
```
Timeline:
0ms    ─────────────────────────────── 2000ms
│                                      │
Scale: 1.0 ──→ 1.1 ──→ 1.0 ──→ 1.1 ──→ 1.0
       (idle)  (pulse)  (pulse)  (pulse)
```

### State Transitions
```
Idle ──tap──→ Listening ──tap──→ Processing ──response──→ Speaking ──finish──→ Idle
(Gray)        (Blue)            (Green)                   (Orange)            (Gray)
```

---

## 📱 Responsive Design

### Portrait Mode (Primary)
```
┌─────────────────────────────┐
│                             │
│      Status Text            │
│                             │
│          ⭕ BUTTON          │
│                             │
│   Instruction Text          │
│                             │
├─────────────────────────────┤
│  Tab 1  │  Tab 2            │
└─────────────────────────────┘
```

### Landscape Mode (Supported)
```
┌──────────────────────────────────────────┐
│  Status Text                             │
│                                          │
│     ⭕ BUTTON    Instruction Text        │
│                                          │
├──────────────────────────────────────────┤
│  Tab 1  │  Tab 2                         │
└──────────────────────────────────────────┘
```

---

## 🔊 Audio Flow Diagram

```
User's Voice
    │
    ↓
Microphone
    │
    ↓
expo-av Recording
    │
    ↓
Audio File (M4A)
    │
    ↓
FormData
    │
    ↓
HTTP POST to Backend
    │
    ↓
Backend Processing
    │
    ├─→ Speech to Text
    ├─→ AI Processing
    └─→ Text to Speech
    │
    ↓
Audio Response (M4A)
    │
    ↓
HTTP Response
    │
    ↓
expo-av Playback
    │
    ↓
Speaker/Headphones
    │
    ↓
User Hears Response
```

---

## 🎯 Touch Targets

### Button
```
Size: 200x200px
Minimum Touch Target: 48x48px ✓
Actual Touch Target: 200x200px ✓
Padding: 20px around button
```

### Tab Bar
```
Height: ~60px
Touch Target: Full width
Minimum Height: 48px ✓
```

### Text Input
```
Height: 50px
Padding: 15px
Touch Target: Full width
Minimum Height: 48px ✓
```

---

## 🎨 Typography

### Headings
```
Font Size: 32px
Font Weight: Bold
Color: #333333
Line Height: 1.2
```

### Body Text
```
Font Size: 18px
Font Weight: Regular
Color: #666666
Line Height: 1.5
```

### Small Text
```
Font Size: 14px
Font Weight: Regular
Color: #999999
Line Height: 1.4
```

---

## 🔐 Permission Dialogs

### iOS Microphone Permission
```
┌─────────────────────────────┐
│  "VoiceAid" Would Like      │
│  Access to Your Microphone  │
│                             │
│  VoiceAid needs access to   │
│  your microphone to record  │
│  your voice messages for    │
│  the AI assistant.          │
│                             │
│  [Don't Allow] [Allow]      │
└─────────────────────────────┘
```

### Android Microphone Permission
```
┌─────────────────────────────┐
│  Allow VoiceAid to record   │
│  audio?                     │
│                             │
│  VoiceAid needs access to   │
│  your microphone.           │
│                             │
│  [Deny] [Allow]             │
└─────────────────────────────┘
```

---

## 🎯 Error States

### Microphone Error
```
┌─────────────────────────────┐
│  ⚠️ Error                   │
│                             │
│  Failed to start recording. │
│  Please check microphone    │
│  permissions.              │
│                             │
│  [OK]                       │
└─────────────────────────────┘
```

### Backend Error
```
┌─────────────────────────────┐
│  ⚠️ Error                   │
│                             │
│  Failed to process voice    │
│  message. Please try again. │
│                             │
│  [OK]                       │
└─────────────────────────────┘
```

---

## 📊 State Machine

```
        ┌─────────────┐
        │    IDLE     │
        │   (Gray)    │
        └──────┬──────┘
               │ tap
               ↓
        ┌─────────────┐
        │  LISTENING  │
        │   (Blue)    │
        └──────┬──────┘
               │ tap
               ↓
        ┌─────────────┐
        │ PROCESSING  │
        │  (Green)    │
        └──────┬──────┘
               │ response
               ↓
        ┌─────────────┐
        │  SPEAKING   │
        │  (Orange)   │
        └──────┬──────┘
               │ finish
               ↓
        ┌─────────────┐
        │    IDLE     │
        │   (Gray)    │
        └─────────────┘
```

---

## 🎓 User Journey Map

```
AWARENESS
    │
    ├─→ See app icon
    ├─→ Open app
    └─→ See home screen

ONBOARDING
    │
    ├─→ See large button
    ├─→ Read "Tap to speak"
    └─→ Understand purpose

INTERACTION
    │
    ├─→ Tap button (Blue)
    ├─→ Speak message
    ├─→ Tap again (Green)
    ├─→ Wait for response
    └─→ Hear response (Orange)

ENGAGEMENT
    │
    ├─→ Repeat interaction
    ├─→ Explore settings
    ├─→ Set caretaker info
    └─→ Continue using

RETENTION
    │
    ├─→ Regular usage
    ├─→ Familiar with flow
    ├─→ Comfortable with app
    └─→ Recommend to others
```

---

**Visual design optimized for elderly users with large buttons, clear colors, and simple interactions.**
