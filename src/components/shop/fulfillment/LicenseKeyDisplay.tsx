// LicenseKeyDisplay - shows masked license key with copy button
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Key, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LicenseKeyDisplayProps {
  licenseKey: string;
  productName?: string;
  className?: string;
}

function maskKey(key: string): string {
  if (key.length <= 8) return '••••••••';
  return key.slice(0, 4) + '•'.repeat(Math.min(key.length - 8, 16)) + key.slice(-4);
}

export function LicenseKeyDisplay({ licenseKey, productName, className }: LicenseKeyDisplayProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(licenseKey);
    } catch {
      const input = document.createElement('input');
      input.value = licenseKey;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('p-4 rounded-xl bg-muted/30 space-y-2', className)}>
      {productName && (
        <div className="flex items-center gap-2 text-sm">
          <Key className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{productName}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <code className="flex-1 text-sm font-mono bg-background px-3 py-2 rounded-lg border select-all" dir="ltr">
          {visible ? licenseKey : maskKey(licenseKey)}
        </code>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => setVisible(!visible)}
          title={visible ? 'مخفی کردن' : 'نمایش'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={handleCopy}
          title={copied ? 'کپی شد' : 'کپی'}
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

export default LicenseKeyDisplay;
