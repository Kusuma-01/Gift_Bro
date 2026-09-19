import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Copy, Download, Check, FileText } from 'lucide-react';

export default function ExportButton({ recipientName, gifts = [] }) {
  const { addToast } = useApp();
  const [isCopied, setIsCopied] = useState(false);

  if (!gifts || gifts.length === 0) return null;

  const targetName = recipientName || 'Special Person';

  // Format text according to project specification:
  // Gift Ideas for: [Recipient]
  // 1. [Name]
  // Price: [Price]
  // Why: [Why]
  const generateExportText = () => {
    let text = `Gift Ideas for: ${targetName}\n\n`;
    gifts.forEach((g, idx) => {
      text += `${idx + 1}. ${g.name}\n`;
      text += `Price: ${g.price_range}\n`;
      text += `Why: ${g.reasoning}\n\n`;
    });
    return text.trim();
  };

  const handleCopy = async () => {
    try {
      const text = generateExportText();
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      addToast('Gift list copied to clipboard!', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
      addToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleDownload = () => {
    try {
      const text = generateExportText();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gift-ideas-${targetName.toLowerCase().replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast('Gift list downloaded!', 'success');
    } catch (err) {
      console.error('Download error:', err);
      addToast('Failed to download gift list', 'error');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-brand-600 hover:border-brand-300 shadow-xs hover:shadow-sm transition-all"
        title="Copy formatted text to clipboard"
      >
        {isCopied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy Gift List</span>
          </>
        )}
      </button>

      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-brand-600 hover:border-brand-300 shadow-xs hover:shadow-sm transition-all"
        title="Download text file"
      >
        <Download className="w-3.5 h-3.5 text-slate-500" />
        <span>Download List</span>
      </button>
    </div>
  );
}
