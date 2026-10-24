import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ language, code, ...props }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.warn('Gagal menyalin teks ke clipboard:', err);
    }
  };

  const displayLanguage = (language || 'text').toLowerCase();
  const labelMap = {
    js: 'JAVASCRIPT',
    javascript: 'JAVASCRIPT',
    ts: 'TYPESCRIPT',
    typescript: 'TYPESCRIPT',
    jsx: 'REACT JSX',
    tsx: 'REACT TSX',
    bash: 'BASH / TERMINAL',
    sh: 'SHELL',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
    markdown: 'MARKDOWN',
    md: 'MARKDOWN',
    rules: 'FIRESTORE RULES',
    sql: 'SQL',
    python: 'PYTHON',
    php: 'PHP',
  };

  const label = labelMap[displayLanguage] || displayLanguage.toUpperCase();

  return (
    <div className="my-6 border border-zinc-800 bg-[#18181b] rounded-none overflow-hidden shadow-none">
      {/* Top Bar Indikator Bahasa & Tombol Salin */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 select-none">
        <span className="font-semibold text-zinc-300 tracking-wider">
          {label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors py-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-none border border-zinc-700 text-[11px] font-mono cursor-pointer"
          title="Salin kode ke papan klip"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Salin Kode</span>
            </>
          )}
        </button>
      </div>

      {/* Wadah Syntax Highlighter Prism */}
      <div className="overflow-x-auto max-w-full">
        <SyntaxHighlighter
          language={displayLanguage === 'rules' ? 'javascript' : displayLanguage}
          style={vscDarkPlus}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: '1.25rem 1rem',
            background: '#18181b',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            borderRadius: '0px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            },
          }}
          {...props}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
