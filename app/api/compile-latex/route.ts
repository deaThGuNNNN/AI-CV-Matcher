import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latex } = body;

    if (!latex) {
      return NextResponse.json({ error: 'LaTeX content is required' }, { status: 400 });
    }

    const formData = new FormData();
    formData.append('filecontents[]', latex);
    formData.append('filename[]', 'document.tex');
    formData.append('engine', 'pdflatex');
    formData.append('return', 'pdf');

    const response = await fetch('https://texlive.net/cgi-bin/latexcgi', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LaTeX compile error:', errorText);
      return NextResponse.json({ error: 'Failed to compile LaTeX to PDF' }, { status: 500 });
    }

    const arrayBuffer = await response.arrayBuffer();
    
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="document.pdf"',
      },
    });
  } catch (error) {
    console.error('Compile LaTeX error:', error);
    return NextResponse.json({ error: 'Failed to compile LaTeX' }, { status: 500 });
  }
}
