import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !URL.canParse(url)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Use Jina Reader API to extract clean Markdown and bypass blocks (e.g., Indeed)
    let fetchUrl = `https://r.jina.ai/${url}`;

    // Special handling for LinkedIn jobs to avoid Jina 403 blocks
    if (url.includes('linkedin.com')) {
      const match = url.match(/(?:currentJobId=|view\/|jobs\/)([0-9]+)/);
      if (match && match[1]) {
        fetchUrl = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${match[1]}`;
      }
    }

    // Special handling using our dedicated AWS Scraping Microservice (for Glassdoor, etc.)
    if (process.env.SCRAPER_SERVICE_URL && !url.includes('linkedin.com') && !url.includes('indeed.com')) {
      console.log('Using dedicated AWS scraping service...');
      const response = await fetch(`${process.env.SCRAPER_SERVICE_URL}/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ jobDescription: data.html });
      }
    }

    // Special handling for Indeed - bypass Cloudflare by using their mobile embedded view endpoint
    if (url.includes('indeed.com')) {
      const match = url.match(/(?:vjk=|jk=)([a-f0-9]+)/i);
      if (match && match[1]) {
        // Extract the domain (e.g. fr.indeed.com or www.indeed.com)
        const domainMatch = url.match(/https?:\/\/([a-z0-9.-]+\.indeed\.com)/i);
        const domain = domainMatch ? domainMatch[1] : 'www.indeed.com';
        fetchUrl = `https://${domain}/m/basecamp/viewjob?viewtype=embedded&jk=${match[1]}`;
      }
    }

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
      if (response.status === 403 || response.status === 401) {
        return NextResponse.json(
          { error: 'This job board actively blocks automated fetching (Cloudflare/bot protection).' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Could not fetch URL: HTTP ${response.status}` },
        { status: 400 }
      );
    }

    let html = await response.text();

    // Indeed hydration data extraction
    const initialDataMatch = html.match(/_initialData=(\{.*?\});/);
    if (initialDataMatch) {
      try {
        const data = JSON.parse(initialDataMatch[1]);
        if (data?.jobInfoWrapperModel?.jobInfoModel?.sanitizedJobDescription) {
          html = data.jobInfoWrapperModel.jobInfoModel.sanitizedJobDescription;
        } else if (data?.jobInfoWrapperModel?.jobInfoModel?.jobDescriptionText) {
          html = data.jobInfoWrapperModel.jobInfoModel.jobDescriptionText;
        }
      } catch (e) {
        // Ignore JSON parse errors and fall back to raw html
      }
    }

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
