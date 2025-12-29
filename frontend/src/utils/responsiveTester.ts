// Responsive Testing Utility
// Use Ctrl+/Ctrl- to test different screen sizes

interface DeviceSize {
  name: string;
  zoom: number;
  width: string;
}

const deviceSizes: DeviceSize[] = [
  { name: "Mobile (320px)", zoom: 0.5, width: "320px" },
  { name: "Mobile Large (480px)", zoom: 0.6, width: "480px" },
  { name: "Tablet (768px)", zoom: 0.8, width: "768px" },
  { name: "Desktop (1024px)", zoom: 1.0, width: "1024px" },
  { name: "Large Desktop (1280px)", zoom: 1.2, width: "1280px" },
  { name: "Ultra Wide (1536px)", zoom: 1.4, width: "1536px" },
];

class ResponsiveTester {
  private currentIndex: number = 3; // Start with desktop
  private indicator: HTMLElement | null = null;
  private timeoutId: number | null = null;

  constructor() {
    this.init();
  }

  private init() {
    this.createIndicator();
    this.setupKeyboardListeners();
    this.applySize(this.currentIndex);
  }

  private createIndicator() {
    this.indicator = document.createElement('div');
    this.indicator.className = 'responsive-indicator';
    document.body.appendChild(this.indicator);
  }

  private setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          this.zoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          this.zoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          this.resetZoom();
        }
      }
    });
  }

  private zoomIn() {
    if (this.currentIndex < deviceSizes.length - 1) {
      this.currentIndex++;
      this.applySize(this.currentIndex);
    }
  }

  private zoomOut() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.applySize(this.currentIndex);
    }
  }

  private resetZoom() {
    this.currentIndex = 3; // Desktop
    this.applySize(this.currentIndex);
  }

  private applySize(index: number) {
    const device = deviceSizes[index];
    const root = document.documentElement;
    
    // Apply zoom
    root.style.setProperty('--responsive-zoom', device.zoom.toString());
    
    // Show indicator
    if (this.indicator) {
      this.indicator.textContent = `${device.name} (${Math.round(device.zoom * 100)}%)`;
      this.indicator.classList.add('show');
      
      // Hide indicator after 2 seconds
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
      this.timeoutId = window.setTimeout(() => {
        this.indicator?.classList.remove('show');
      }, 2000);
    }

    // Log to console for debugging
    console.log(`📱 Responsive Test: ${device.name} at ${Math.round(device.zoom * 100)}% zoom`);
  }

  // Public methods fo