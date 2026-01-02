# Wedding Stories Storybook Horizontal Scroll Animation

## 📋 Overview

This is a **scroll-driven storytelling animation** where vertical scrolling drives horizontal movement of wedding story cards. It creates an immersive album-like experience that feels like flipping through wedding memories.

---

## 🎯 Animation Characteristics

### What Happens
- **User scrolls down** (Y-axis) ⬇️
- **Stories move left** (X-axis) ⬅️
- **Section stays pinned** while scrolling
- **Stories reveal one by one** sequentially
- **After last card**, normal scroll resumes

### UX Feel
- "I'm flipping through wedding memories"
- Smooth, controlled, intentional movement
- No jarring transitions

---

## 🧬 Technical Implementation

### Technologies Used
- **GSAP** (GreenSock Animation Platform) - Industry standard for scroll animations
- **ScrollTrigger** - GSAP plugin for scroll-driven animations
- **React** - Component framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### Why GSAP?
1. ✅ Highly performant for complex animations
2. ✅ Smooth cross-browser compatibility
3. ✅ Built-in ScrollTrigger plugin
4. ✅ Better control than Framer Motion for scroll animations
5. ✅ Mobile-optimized

---

## 📦 Component Structure

```tsx
WeddingStoriesSection
├── useRef(sectionRef) - Main section reference
├── useRef(horizontalTrackRef) - Horizontal scrollable track
├── useState(stories) - Fetched wedding stories
├── useState(isMobile) - Mobile detection
│
├── useEffect - Mobile detection hook
├── useEffect - Fetch stories from API
└── useEffect - GSAP ScrollTrigger animation
    ├── Detect screen size
    ├── Calculate horizontal distance
    ├── Create ScrollTrigger animation
    └── Apply X translation as user scrolls
```

---

## 🎞️ How the Animation Works

### Step-by-Step Flow

1. **Page Loads**
   - Stories fetched from API
   - Component mounts
   - ScrollTrigger initialized

2. **User Starts Scrolling Down**
   - Section becomes PINNED (sticky)
   - Vertical scroll captured

3. **Scroll Distance Converts to Horizontal Movement**
   - Every px scrolled down = movement left
   - Horizontal track translates on X-axis
   - Stories move into view sequentially

4. **After Last Card Shown**
   - Pin released
   - Normal scrolling resumes
   - Next section visible

---

## 🔧 Animation Configuration

```javascript
// Key animation settings
gsap.to(horizontalTrackRef.current, {
  x: -horizontalDistance,        // Final horizontal position
  ease: "linear",                // Constant speed (no acceleration)
  scrollTrigger: {
    trigger: sectionRef,         // What triggers animation
    start: "top top",            // When animation starts
    end: `+=${horizontalDistance * 2}`, // When animation ends
    scrub: 1,                    // Smooth scrubbing (1s delay)
    pin: true,                   // Pin section while scrolling
    markers: false,              // Debug mode (set true to see)
  },
});
```

### Animation Properties Explained

| Property | Value | Purpose |
|----------|-------|---------|
| `x` | `-horizontalDistance` | Move left by calculated distance |
| `ease` | `"linear"` | Consistent speed (no slow/fast) |
| `scrub` | `1` | Connect animation to scrollbar with 1s smoothing |
| `pin` | `true` | Lock section while scrolling |
| `start` | `"top top"` | Start when section top hits viewport top |
| `end` | `+=${distance * 2}` | Double the distance for smooth scroll |

---

## 📱 Mobile Optimization

### Mobile Behavior
- ✅ Full-screen width cards (90vw)
- ✅ Natural thumb scrolling
- ✅ No swipe gesture confusion
- ✅ Reduced animation duration on small devices
- ✅ Disabled on very small screens (<640px)

### Responsive Breakpoints

```css
/* Mobile (< 640px) */
width: 90vw;
padding: 1.5rem;
font-size: smaller;

/* Tablet (640px - 1024px) */
width: 80vw;
padding: 2rem;
font-size: medium;

/* Desktop (> 1024px) */
width: 70vw;
padding: 3rem;
font-size: large;
```

---

## 🎨 Visual Design

### Story Card Layout
```
┌─────────────────────┐
│   Cover Image       │
│   (Full Height)     │
│                     │
│                     │
│   Gradient Overlay  │
│                     │
│  ┌─────────────────┐│
│  │ Story Details   ││
│  │ (Bottom)        ││
│  │ - Couple Name   ││
│  │ - Location      ││
│  │ - Event Type    ││
│  └─────────────────┘│
└─────────────────────┘
```

### Color Scheme
- **Background**: Deep black (#080808)
- **Accent**: Gold (#D4AF37)
- **Text**: White + Semi-transparent white
- **Overlays**: Dark gradients (black with transparency)

### Typography
- **Couple Names**: Serif font (Playfair Display), italic
- **Labels**: Sans-serif (DM Sans), all-caps, light weight
- **Location**: Small, uppercase, semi-transparent

---

## 📊 Performance Optimization

### Techniques Used
1. **Image Lazy Loading**
   - First 2 cards eager load
   - Rest lazy load for better performance

2. **CSS Transforms**
   - Use `transform: translateX()` (GPU-accelerated)
   - Apply `will-change: transform`
   - Use `backface-visibility: hidden`

3. **Reduced Motion Support**
   ```css
   @media (prefers-reduced-motion: reduce) {
     animation: none !important;
     transition: none !important;
   }
   ```

4. **ScrollTrigger Cleanup**
   - Kills all triggers on unmount
   - Prevents memory leaks
   - Removes duplicate listeners

---

## 🔌 API Integration

### Data Structure Required
```json
{
  "_id": "story-1",
  "couple": "Rohan & Aditi",
  "event": "Wedding",
  "location": "Junagadh",
  "image": "https://..."
}
```

### Fetching Stories
```typescript
useEffect(() => {
  const fetchStories = async () => {
    const data = await apiService.getWeddingStories();
    setStories(data);
  };
  fetchStories();
}, []);
```

---

## 🎮 User Interactions

### Desktop
- Scroll down with mouse/trackpad
- Horizontal movement smooth and responsive
- No horizontal scrollbar (hidden)
- Hover effects on cards (slight zoom)

### Mobile
- Natural thumb scroll
- Touch-friendly
- Bounce animation guide
- Shows scroll indicator initially

---

## 🧪 Debug Mode

To enable animation markers (for debugging):

```typescript
scrollTrigger: {
  // ... other properties
  markers: true,  // Shows start, end, trigger points
}
```

This displays visual indicators of:
- Animation start point (green)
- Animation end point (red)
- Trigger area (blue)

---

## ⚙️ Customization

### Adjust Animation Speed
```typescript
// Slower animation
end: `+=${horizontalDistance * 3}` // 3x distance = slower

// Faster animation
end: `+=${horizontalDistance * 1.5}` // 1.5x distance = faster
```

### Change Easing
```typescript
ease: "power1.inOut"   // Accelerates then decelerates
ease: "linear"         // Constant speed (current)
ease: "sine.inOut"     // Smooth easing
```

### Adjust Scrubbing
```typescript
scrub: 0.5  // Faster response (0.5s delay)
scrub: 2    // More smoothing (2s delay)
scrub: true // Direct scroll connection (no delay)
```

---

## 🐛 Common Issues & Solutions

### Issue: Animation doesn't start
**Solution**: Check if `horizontalTrackRef.current` is assigned correctly

### Issue: Stories cut off on mobile
**Solution**: Verify Tailwind CSS is loaded and `gap-6 md:gap-12` responsive spacing

### Issue: ScrollTrigger not working
**Solution**: Ensure `gsap.registerPlugin(ScrollTrigger)` is called before animations

### Issue: Poor performance on low-end devices
**Solution**: Consider disabling animation on devices < 640px width

---

## 📈 Browser Support

- ✅ Chrome/Edge 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

---

## 🔮 Future Enhancements

1. **Keyboard Navigation**
   - Arrow keys to move through stories
   - Space to pause/resume animation

2. **Story Detail View**
   - Click card to see full story details
   - Gallery overlay modal

3. **Progress Persistence**
   - Remember user's scroll position
   - Resume from where they left

4. **Analytics**
   - Track which stories users view
   - Time spent on each story

5. **Touch Gestures**
   - Swipe left to next story
   - Swipe right to previous story

---

## 📚 Resources

- [GSAP Documentation](https://gsap.com/docs/)
- [ScrollTrigger Docs](https://gsap.com/docs/Plugins/ScrollTrigger/)
- [React Performance](https://react.dev/reference/react/useCallback)
- [Web Performance](https://web.dev/performance/)

---

## ✅ Checklist for Implementation

- [x] Install GSAP dependency
- [x] Create WeddingStoriesSection component
- [x] Implement GSAP ScrollTrigger animation
- [x] Add responsive design
- [x] Mobile optimization
- [x] Lazy loading images
- [x] CSS styling
- [x] Type safety with TypeScript
- [x] Error handling
- [x] Cleanup & memory management

---

**Last Updated**: January 3, 2026
**Component Version**: 2.0 (GSAP ScrollTrigger)
**Status**: ✅ Production Ready
