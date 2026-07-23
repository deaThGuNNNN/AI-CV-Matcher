const fs = require('fs');

async function test() {
  const latexCode = `\\documentclass{article}\\begin{document}Hello world\\end{document}`;
  
  const formData = new FormData();
  formData.append('filecontents[]', latexCode);
  formData.append('filename[]', 'document.tex');
  formData.append('engine', 'pdflatex');
  formData.append('return', 'pdf');
  
  try {
    const res = await fetch('https://texlive.net/cgi-bin/latexcgi', {
      method: 'POST',
      body: formData
    });
    
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    
    const buffer = await res.arrayBuffer();
    fs.writeFileSync('/tmp/out.pdf', Buffer.from(buffer));
    console.log('Saved to /tmp/out.pdf, size:', buffer.byteLength);
  } catch(e) {
    console.error(e);
  }
}

test();
