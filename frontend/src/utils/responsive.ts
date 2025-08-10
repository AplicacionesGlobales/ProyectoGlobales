// ============================================
// src/utils/responsive.ts
// ============================================
import { Dimensions, Platform } from 'react-native';

export class ResponsiveUtils {
  private static screenWidth = Dimensions.get('window').width;
  private static screenHeight = Dimensions.get('window').height;

  // Device size detection
  static isSmallDevice(): boolean {
    return this.screenWidth < 380;
  }

  static isMediumDevice(): boolean {
    return this.screenWidth >= 380 && this.screenWidth < 428;
  }

  static isLargeDevice(): boolean {
    return this.screenWidth >= 428 && this.screenWidth < 768;
  }

  static isTablet(): boolean {
    return this.screenWidth >= 768;
  }

  // Platform detection
  static isIOS(): boolean {
    return Platform.OS === 'ios';
  }

  static isAndroid(): boolean {
    return Platform.OS === 'android';
  }

  // Get screen dimensions
  static getScreenWidth(): number {
    return this.screenWidth;
  }

  static getScreenHeight(): number {
    return this.screenHeight;
  }

  // Responsive value selector
  static getValue<T>(small: T, medium?: T, large?: T, tablet?: T): T {
    if (this.screenWidth < 380) return small;
    if (this.screenWidth < 428) return medium || small;
    if (this.screenWidth < 768) return large || medium || small;
    return tablet || large || medium || small;
  }

  // Responsive font size
  static getFontSize(base: number): number {
    if (this.screenWidth < 380) return Math.round(base * 0.9);
    if (this.screenWidth < 428) return base;
    if (this.screenWidth < 768) return Math.round(base * 1.1);
    return Math.round(base * 1.2);
  }

  // Responsive spacing
  static getSpacing(base: number): number {
    if (this.screenWidth < 380) return Math.round(base * 0.85);
    if (this.screenWidth < 428) return base;
    if (this.screenWidth < 768) return Math.round(base * 1.15);
    return Math.round(base * 1.3);
  }

  // Responsive padding
  static getPadding(base: number): number {
    if (this.screenWidth < 380) return Math.round(base * 0.8);
    if (this.screenWidth < 428) return base;
    if (this.screenWidth < 768) return Math.round(base * 1.2);
    return Math.round(base * 1.4);
  }

  // Responsive component size
  static getComponentSize(size: 'sm' | 'md' | 'lg'): 'sm' | 'md' | 'lg' {
    if (this.screenWidth < 380) {
      // Small phones: bump up sizes for better usability
      if (size === 'sm') return 'md';
      return size;
    }
    if (this.screenWidth >= 768) {
      // Tablets: can use larger sizes
      if (size === 'sm') return 'md';
      if (size === 'md') return 'lg';
      return size;
    }
    return size;
  }

  // Responsive button size
  static getButtonSize(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): 'xs' | 'sm' | 'md' | 'lg' | 'xl' {
    if (this.screenWidth < 380) {
      if (size === 'xs') return 'sm';
      if (size === 'sm') return 'md';
      return size;
    }
    if (this.screenWidth >= 768) {
      if (size === 'xs') return 'sm';
      return size;
    }
    return size;
  }

  // Responsive input size
  static getInputSize(size: 'sm' | 'md' | 'lg'): 'sm' | 'md' | 'lg' {
    if (this.screenWidth < 380) return 'sm';
    if (this.screenWidth < 428) return size;
    if (this.screenWidth < 768) return size === 'sm' ? 'md' : size;
    return size === 'sm' ? 'md' : size === 'md' ? 'lg' : size;
  }

  // Responsive number of columns for grids
  static getColumns(baseColumns: number): number {
    if (this.screenWidth < 380) return Math.max(1, baseColumns - 1);
    if (this.screenWidth < 428) return baseColumns;
    if (this.screenWidth < 768) return baseColumns + 1;
    return baseColumns + 2;
  }

  // Check if should show element based on screen size
  static shouldShow(minWidth?: number, maxWidth?: number): boolean {
    if (minWidth && this.screenWidth < minWidth) return false;
    if (maxWidth && this.screenWidth > maxWidth) return false;
    return true;
  }

  // Get responsive border radius
  static getBorderRadius(base: number): number {
    if (this.screenWidth < 380) return Math.round(base * 0.8);
    if (this.screenWidth < 428) return base;
    if (this.screenWidth < 768) return Math.round(base * 1.1);
    return Math.round(base * 1.2);
  }

  // Get responsive icon size
  static getIconSize(base: number): number {
    if (this.screenWidth < 380) return Math.round(base * 0.85);
    if (this.screenWidth < 428) return base;
    if (this.screenWidth < 768) return Math.round(base * 1.15);
    return Math.round(base * 1.25);
  }

  // Get responsive line height
  static getLineHeight(fontSize: number): number {
    const multiplier = this.screenWidth < 380 ? 1.3 : 
                      this.screenWidth < 428 ? 1.4 : 
                      this.screenWidth < 768 ? 1.5 : 1.6;
    return Math.round(fontSize * multiplier);
  }

  // Update dimensions on orientation change
  static updateDimensions(): void {
    const { width, height } = Dimensions.get('window');
    this.screenWidth = width;
    this.screenHeight = height;
  }

  // Listen to dimension changes
  static addDimensionListener(callback: () => void): void {
    Dimensions.addEventListener('change', () => {
      this.updateDimensions();
      callback();
    });
  }
}