const fs = require('fs');
let html = fs.readFileSync('adaptcode.html', 'utf8');

// HTML to JSX replacements
let jsx = html
  .replace(/class=/g, 'className=')
  .replace(/for=/g, 'htmlFor=')
  .replace(/onclick=\"[^\"]*\"/g, 'onClick={() => {}}')
  .replace(/onchange=\"[^\"]*\"/g, 'onChange={() => {}}')
  .replace(/onkeyup=\"[^\"]*\"/g, 'onKeyUp={() => {}}')
  .replace(/onload=\"[^\"]*\"/g, 'onLoad={() => {}}')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<br>/g, '<br/>')
  .replace(/<hr>/g, '<hr/>')
  .replace(/<img([^>]*[^/])>/g, '<img$1/>')
  .replace(/<input([^>]*[^/])>/g, '<input$1/>')
  .replace(/stroke-linejoin/g, "strokeLinejoin")
  .replace(/stroke-width/g, "strokeWidth")
  .replace(/stroke-linecap/g, "strokeLinecap")
  .replace(/fill-rule/g, "fillRule")
  .replace(/clip-rule/g, "clipRule");

// Inline style converter
jsx = jsx.replace(/style="([^"]*)"/g, (match, p1) => {
    if(!p1) return 'style={{}}';
    const props = p1.split(';').filter(p => p.trim()).map(p => {
        const [k, ...vParts] = p.split(':');
        const v = vParts.join(':');
        if(!k || !v) return '';
        const camelK = k.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
        return `${camelK}: '${v.trim().replace(/'/g, "\\'")}'`;
    }).filter(Boolean).join(', ');
    return `style={{${props}}}`;
});

// Extract styles
const styleMatch = jsx.match(/<style>([\s\S]*?)<\/style>/i);
const styles = styleMatch ? styleMatch[1] : '';

// Remove unwanted tags from the JSX body
let bodyContent = jsx
  .replace(/<style>[\s\S]*?<\/style>/i, '')
  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  .replace(/<title>[\s\S]*?<\/title>/i, '')
  .replace(/<link([^>]*[^/])>/gi, '')
  .replace(/<meta([^>]*[^/])>/gi, '')
  .replace(/<html>|<\/html>|<body>|<\/body>|<head>|<\/head>/gi, '')
  .trim();

fs.writeFileSync('src/app/workspace/page.tsx', 
`'use client';
import React from 'react';

export default function WorkspacePage() {
  return (
    <div style={{ backgroundColor: '#010102', minHeight: '100vh', width: '100vw' }}>
      <style dangerouslySetInnerHTML={{ __html: \`${styles}\` }} />
      ${bodyContent}
    </div>
  );
}
`);
