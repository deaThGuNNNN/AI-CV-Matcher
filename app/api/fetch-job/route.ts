import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !URL.canParse(url)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Use Jina Reader API to extract clean Markdown and bypass blocks (e.g., LinkedIn, Indeed)
    const fetchUrl = `https://r.jina.ai/${url}`;

    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5,fr;q=0.3',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Could not fetch URL: HTTP ${response.status}` },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Strip HTML tags and extract meaningful text
    const text = html
      // Remove script, style, nav, header, footer blocks
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      // Remove all remaining HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Decode common HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      // Collapse whitespace
      .replace(/\s{2,}/g, '\n')
      .trim();

    if (
      text.length < 100 ||
      text.includes('Target URL returned error 404') ||
      text.includes('لم يتم العثور على الصفحة') // Sometimes LinkedIn returns a 404 Arabic page for jina for some reason
    ) {
      return NextResponse.json(
        { error: 'Could not extract meaningful content from this URL. Try pasting the description directly.' },
        { status: 400 }
      );
    }

    // Limit to 15k chars to avoid token overflow
    return NextResponse.json({ text: text.slice(0, 15000) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch URL: ${message}. Try pasting the job description directly.` },
      { status: 500 }
    );
  }
}
