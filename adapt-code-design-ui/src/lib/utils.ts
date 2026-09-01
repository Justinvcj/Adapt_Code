export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function highlight(code: string, lang: string): string {
  let h = esc(code);
  // Multi-line strings
  h = h.replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|&quot;&quot;&quot;[\s\S]*?&quot;&quot;&quot;)/g, '<span class="hl-str">$1</span>');
  // Single-line strings
  h = h.replace(/(&quot;.*?&quot;|'(?:[^'\\]|\\.)*')/g, '<span class="hl-str">$1</span>');
  // Comments
  if (lang === 'python3') {
    h = h.replace(/(#[^\n]*)/g, '<span class="hl-cm">$1</span>');
  } else {
    h = h.replace(/(\/\/[^\n]*)/g, '<span class="hl-cm">$1</span>');
    h = h.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="hl-cm">$1</span>');
  }
  // Keywords
  let kws: string;
  if (lang === 'python3')
    kws = 'class|def|return|if|else|elif|for|in|while|and|or|not|True|False|None|self|pass|import|from|as|with|try|except|raise|lambda';
  else if (lang === 'javascript')
    kws = 'var|let|const|function|return|if|else|for|while|do|new|this|typeof|true|false|null|undefined|class|of|in';
  else if (lang === 'java')
    kws = 'class|public|private|protected|static|final|void|int|long|double|float|boolean|char|return|if|else|for|while|new|this|null|true|false';
  else
    kws = 'class|public|private|void|int|long|double|float|bool|char|return|if|else|for|while|new|this|namespace|using|include|const|auto|nullptr';

  h = h.replace(new RegExp('\\b(' + kws + ')\\b', 'g'), '<span class="hl-kw">$1</span>');
  h = h.replace(/\b(self|this)\b/g, '<span class="hl-self">$1</span>');

  // Built-ins
  let bis: string;
  if (lang === 'python3')
    bis = 'print|len|range|int|str|list|dict|set|enumerate|zip|map|filter|sorted|min|max|sum|List';
  else if (lang === 'javascript')
    bis = 'console|log|Map|Set|Array|Object|String|Number|Promise|Math|JSON';
  else if (lang === 'java')
    bis = 'System|String|Integer|Map|HashMap|List|ArrayList|Arrays|Math';
  else
    bis = 'vector|string|unordered_map|map|set|pair|queue|stack|sort|cout|cin|size|count';

  h = h.replace(new RegExp('\\b(' + bis + ')\\b', 'g'), '<span class="hl-bi">$1</span>');
  h = h.replace(/\b(\d+\.?\d*)\b/g, '<span class="hl-num">$1</span>');
  h = h.replace(/(def |function |\.)(\w+)(\s*\()/g, '$1<span class="hl-fn">$2</span>$3');
  return h;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function genSeededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}
