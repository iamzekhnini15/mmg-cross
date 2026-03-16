import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const A4_WIDTH_PX = 794; // 210 mm at 96 dpi
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/**
 * Converts an HTML string to an A4 portrait PDF blob.
 * Uses html2canvas to rasterise the page and jsPDF to embed it.
 * Only call this on web — it requires browser DOM APIs.
 */
export async function htmlToPdfBlob(htmlString: string): Promise<Blob> {
  const container = document.createElement('div');
  container.style.cssText = [
    'position:fixed',
    'left:-99999px',
    'top:0',
    `width:${A4_WIDTH_PX}px`,
    'background:#ffffff',
    'overflow:visible',
    'pointer-events:none',
  ].join(';');
  container.innerHTML = htmlString;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: A4_WIDTH_PX,
      windowWidth: A4_WIDTH_PX,
      backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // canvas width at scale=2 is A4_WIDTH_PX * 2 = 1588 px
    const canvasPxPerMm = canvas.width / A4_WIDTH_MM;
    const pxPageHeight = Math.floor(A4_HEIGHT_MM * canvasPxPerMm);

    let yOffset = 0;
    let pageIndex = 0;

    while (yOffset < canvas.height) {
      const sliceH = Math.min(pxPageHeight, canvas.height - yOffset);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceH;

      const ctx = pageCanvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, -yOffset);

      const imgData = pageCanvas.toDataURL('image/jpeg', 0.97);
      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, sliceH / canvasPxPerMm);

      yOffset += pxPageHeight;
      pageIndex++;
    }

    return pdf.output('blob');
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
