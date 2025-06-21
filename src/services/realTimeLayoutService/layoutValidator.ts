
import { DynamicLayout } from '@/types/layout';

export class LayoutValidator {
  isValidDynamicLayout(obj: any): obj is DynamicLayout {
    return obj && 
           typeof obj === 'object' && 
           'hero_section' in obj && 
           'menu_sections' in obj && 
           'promotional_zones' in obj && 
           'ui_enhancements' in obj;
  }

  parseLayoutConfig(layoutConfig: any): DynamicLayout | null {
    try {
      if (typeof layoutConfig === 'string') {
        const parsed = JSON.parse(layoutConfig);
        return this.isValidDynamicLayout(parsed) ? parsed : null;
      } else if (layoutConfig && typeof layoutConfig === 'object') {
        return this.isValidDynamicLayout(layoutConfig) ? layoutConfig : null;
      }
      return null;
    } catch (error) {
      console.error('Failed to parse layout config:', error);
      return null;
    }
  }
}

export const layoutValidator = new LayoutValidator();
