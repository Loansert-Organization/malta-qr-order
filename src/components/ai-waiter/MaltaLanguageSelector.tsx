
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';

interface MaltaLanguageSelectorProps {
  selectedLanguage: 'en' | 'mt' | 'it';
  onLanguageChange: (language: 'en' | 'mt' | 'it') => void;
}

const MaltaLanguageSelector = ({ selectedLanguage, onLanguageChange }: MaltaLanguageSelectorProps) => {
  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇬🇧', native: 'English' },
    { code: 'mt' as const, name: 'Maltese', flag: '🇲🇹', native: 'Malti' },
    { code: 'it' as const, name: 'Italian', flag: '🇮🇹', native: 'Italiano' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-gray-500" />
      <span className="text-sm text-gray-600">Language:</span>
      <div className="flex space-x-1">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={selectedLanguage === lang.code ? "default" : "outline"}
            size="sm"
            onClick={() => onLanguageChange(lang.code)}
            className="h-8 px-2 text-xs"
          >
            <span className="mr-1">{lang.flag}</span>
            {lang.native}
          </Button>
        ))}
      </div>
      <Badge variant="secondary" className="text-xs">
        AI Multilingual
      </Badge>
    </div>
  );
};

export default MaltaLanguageSelector;
