import Script from 'next/script';

export function GoogleVerificationScript({ snippet }: { snippet: string }) {
  if (!snippet) return null;
  
  if (snippet.includes('<meta')) {
    const nameMatch = snippet.match(/name=["']([^"']+)["']/);
    const contentMatch = snippet.match(/content=["']([^"']+)["']/);
    if (nameMatch && contentMatch) {
      return <meta name={nameMatch[1]} content={contentMatch[1]} />;
    }
  }

  return null;
}
