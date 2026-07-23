import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

async function extractPdfText(buffer: Buffer): Promise<string> {
  // pdf2json is a pure Node.js PDF parser without web workers
  const PDFParser = (await import('pdf2json')).default;
  
  return new Promise((resolve, reject) => {
    // true = text content only
    const pdfParser = new PDFParser(null, true);
    
    pdfParser.on('pdfParser_dataError', (errData: any) => reject(errData.parserError));
    pdfParser.on('pdfParser_dataReady', () => {
      resolve(pdfParser.getRawTextContent());
    });
    
    pdfParser.parseBuffer(buffer);
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = '';

    if (fileName.endsWith('.pdf')) {
      text = await extractPdfText(buffer);
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (
      fileName.endsWith('.txt') ||
      fileName.endsWith('.md') ||
      fileName.endsWith('.rtf') ||
      fileName.endsWith('.tex') ||
      fileName.endsWith('.latex')
    ) {
      text = buffer.toString('utf-8');
    } else {
      return NextResponse.json(
        {
          error:
            'Unsupported file format. Please upload PDF, DOCX, TXT, MD, or TEX.',
        },
        { status: 400 }
      );
    }

    // Clean up extracted text
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (text.length < 50) {
      return NextResponse.json(
        {
          error:
            'Could not extract meaningful text from this file. It may be a scanned/image-based PDF. Try copy-pasting the content instead.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      text,
      fileName: file.name,
      charCount: text.length,
      lineCount: text.split('\n').length,
    });
  } catch (error) {
    console.error('File parse error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to parse file: ${message}` },
      { status: 500 }
    );
  }
}
