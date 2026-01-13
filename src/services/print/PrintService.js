import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { configuracionApi } from '../api';

// Cache de configuración de empresa
let cachedConfig = null;

/**
 * Obtiene la configuración de empresa (con cache)
 */
export const getCompanyConfig = async () => {
  if (cachedConfig) return cachedConfig;

  try {
    cachedConfig = await configuracionApi.getEmpresa();
    return cachedConfig;
  } catch (err) {
    console.warn('No se pudo cargar config de empresa, usando valores por defecto');
    return {
      nombreEmpresa: 'MI EMPRESA',
      ruc: '00000000000',
      direccion: 'Dirección no configurada',
      telefono: '',
      email: ''
    };
  }
};

/**
 * Limpia el cache de configuración
 */
export const clearConfigCache = () => {
  cachedConfig = null;
};

/**
 * Genera PDF de boleta/factura en formato A4
 */
export const generateInvoicePDF = async (invoice, sale) => {
  const company = await getCompanyConfig();
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(company.nombreEmpresa || 'MI EMPRESA', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`RUC: ${company.ruc || ''}`, pageWidth / 2, 27, { align: 'center' });
  doc.text(company.direccion || '', pageWidth / 2, 32, { align: 'center' });
  if (company.telefono) {
    doc.text(`Tel: ${company.telefono}`, pageWidth / 2, 37, { align: 'center' });
  }

  // Tipo de comprobante
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const tipoDoc = invoice.type === 'boleta' ? 'BOLETA DE VENTA ELECTRÓNICA' : 'FACTURA ELECTRÓNICA';
  doc.text(tipoDoc, pageWidth / 2, 50, { align: 'center' });

  doc.setFontSize(12);
  doc.text(invoice.fullNumber, pageWidth / 2, 57, { align: 'center' });

  // Línea separadora
  doc.setLineWidth(0.5);
  doc.line(15, 62, pageWidth - 15, 62);

  // Datos del comprobante
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let y = 70;

  doc.text(`Fecha: ${formatDateTime(sale.createdAt || new Date())}`, 15, y);
  doc.text(`Venta N°: ${sale.number}`, pageWidth - 60, y);
  y += 7;

  // Datos del cliente (si es factura)
  if (invoice.type === 'factura' && invoice.clientData) {
    doc.text(`Cliente: ${invoice.clientData.name}`, 15, y);
    y += 5;
    doc.text(`${invoice.clientData.documentType}: ${invoice.clientData.documentNumber}`, 15, y);
    y += 5;
    if (invoice.clientData.address) {
      doc.text(`Dirección: ${invoice.clientData.address}`, 15, y);
      y += 5;
    }
  }

  y += 5;

  // Tabla de productos
  const tableData = (sale.items || []).map((item, idx) => [
    idx + 1,
    item.productName || item.descripcion || 'Producto',
    item.quantity || item.cantidad || 1,
    formatCurrency(item.unitPrice || item.precioUnitario || 0),
    formatCurrency(item.subtotal || 0)
  ]);

  doc.autoTable({
    startY: y,
    head: [['#', 'Descripción', 'Cant.', 'P. Unit.', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    }
  });

  // Totales
  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', pageWidth - 70, finalY);
  doc.text(formatCurrency(sale.subtotal || 0), pageWidth - 20, finalY, { align: 'right' });

  doc.text('IGV (18%):', pageWidth - 70, finalY + 7);
  doc.text(formatCurrency(sale.tax || sale.igv || 0), pageWidth - 20, finalY + 7, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', pageWidth - 70, finalY + 16);
  doc.text(formatCurrency(sale.total || 0), pageWidth - 20, finalY + 16, { align: 'right' });

  // Pie de página
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Gracias por su compra', pageWidth / 2, finalY + 35, { align: 'center' });
  doc.text('Este documento es una representación impresa', pageWidth / 2, finalY + 40, { align: 'center' });

  return doc;
};

/**
 * Genera contenido HTML para impresión térmica (58mm o 80mm)
 */
export const generateThermalHTML = async (invoice, sale, width = '80mm') => {
  const company = await getCompanyConfig();
  const isFactura = invoice.type === 'factura' || invoice.type === 'FACTURA';

  // Datos de SUNAT
  const estadoSunat = invoice.estadoSunat;
  const hashCpe = invoice.hashCpe;
  const qrCode = invoice.qrCode;
  const esAceptadoSunat = estadoSunat === 'ACEPTADO';
  const esPendienteSunat = estadoSunat === 'PENDIENTE';

  const items = (sale.items || [])
    .map(
      (item) => `
    <tr>
      <td style="text-align:left">${item.productName || item.descripcion || 'Producto'}${item.talla ? ` (${item.talla})` : ''}</td>
      <td style="text-align:center">${item.quantity || item.cantidad || 1}</td>
      <td style="text-align:right">${formatCurrency(item.subtotal || 0)}</td>
    </tr>
  `
    )
    .join('');

  // Sección de cliente - diferente para Boleta y Factura
  const clienteSection = isFactura
    ? `
    <div class="divider"></div>
    <div class="section-title">DATOS DEL CLIENTE</div>
    <div><strong>RUC/DNI:</strong> ${invoice.clientData?.documentNumber || invoice.clienteNumeroDoc || '-'}</div>
    <div><strong>Razón Social:</strong> ${invoice.clientData?.name || invoice.clienteNombre || '-'}</div>
    <div><strong>Dirección:</strong> ${invoice.clientData?.address || invoice.clienteDireccion || '-'}</div>
  `
    : '';

  // Sección de totales - diferente para Boleta y Factura
  // Mostrar desglose de IGV para ambos tipos de comprobante
  const totalesSection = `
    <table>
      <tr><td>${isFactura ? 'Op. Gravada:' : 'Subtotal:'}</td><td style="text-align:right">${formatCurrency(sale.subtotal || 0)}</td></tr>
      <tr><td>IGV (18%):</td><td style="text-align:right">${formatCurrency(sale.tax || sale.igv || 0)}</td></tr>
      <tr class="total"><td>${isFactura ? 'IMPORTE TOTAL:' : 'TOTAL:'}</td><td style="text-align:right">${formatCurrency(sale.total || 0)}</td></tr>
    </table>
  `;

  // Sección SUNAT - QR y Hash
  let sunatSection = '';
  if (esAceptadoSunat) {
    sunatSection = `
      <div class="divider"></div>
      <div class="sunat-section">
        ${
          qrCode
            ? `
          <div class="center">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrCode)}" 
                 alt="QR" style="width:80px;height:80px;margin:5px 0;" />
          </div>
        `
            : ''
        }
        <div class="center" style="font-size:9px;">
          <strong>Hash:</strong> ${hashCpe ? hashCpe.substring(0, 20) + '...' : '-'}
        </div>
        <div class="center sunat-ok">
          ✓ Autorizado por SUNAT
        </div>
        <div class="center" style="font-size:8px;">
          Consulte en: sunat.gob.pe/ol-ti-itconsvalcpe
        </div>
      </div>
    `;
  } else if (esPendienteSunat) {
    sunatSection = `
      <div class="divider"></div>
      <div class="sunat-section">
        <div class="center sunat-pending">
          ⚠ PENDIENTE DE ENVÍO A SUNAT
        </div>
        <div class="center" style="font-size:9px;">
          Este comprobante será enviado posteriormente
        </div>
      </div>
    `;
  } else if (estadoSunat === 'RECHAZADO') {
    sunatSection = `
      <div class="divider"></div>
      <div class="sunat-section">
        <div class="center sunat-error">
          ✗ RECHAZADO POR SUNAT
        </div>
        <div class="center" style="font-size:9px;">
          ${invoice.mensajeSunat || 'Contacte al administrador'}
        </div>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: ${width} auto; margin: 0; }
        body { 
          font-family: 'Courier New', monospace; 
          font-size: 12px; 
          width: ${width}; 
          margin: 0 auto;
          padding: 5mm;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .divider { border-top: 1px dashed #000; margin: 5px 0; }
        .divider-double { border-top: 2px solid #000; margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; }
        .total { font-size: 14px; font-weight: bold; }
        .section-title { font-weight: bold; margin: 3px 0; font-size: 11px; }
        .tipo-comprobante { 
          font-size: 14px; 
          font-weight: bold; 
          padding: 3px; 
          ${isFactura ? 'border: 2px solid #000;' : ''}
        }
        .sunat-section { margin: 5px 0; }
        .sunat-ok { color: #28a745; font-weight: bold; font-size: 11px; }
        .sunat-pending { color: #ffc107; font-weight: bold; font-size: 11px; }
        .sunat-error { color: #dc3545; font-weight: bold; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="center bold">${company.nombreEmpresa || 'MI EMPRESA'}</div>
      <div class="center">RUC: ${company.ruc || ''}</div>
      <div class="center">${company.direccion || ''}</div>
      ${company.telefono ? `<div class="center">Tel: ${company.telefono}</div>` : ''}
      <div class="divider-double"></div>
      
      <div class="center tipo-comprobante">
        ${isFactura ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA'}
      </div>
      <div class="center bold">${invoice.fullNumber}</div>
      <div class="center">${formatDateTime(sale.createdAt || new Date())}</div>
      
      ${clienteSection}
      
      <div class="divider"></div>
      <table>
        <tr>
          <td><strong>Descripción</strong></td>
          <td style="text-align:center"><strong>Cant</strong></td>
          <td style="text-align:right"><strong>Importe</strong></td>
        </tr>
        ${items}
      </table>
      <div class="divider"></div>
      
      ${totalesSection}
      
      ${sunatSection}
      
      <div class="divider"></div>
      <div class="center">¡Gracias por su compra!</div>
      ${esAceptadoSunat ? '<div class="center" style="font-size:9px">Representación impresa del CPE</div>' : ''}
      <div class="center" style="font-size:10px">Venta: ${sale.number}</div>
    </body>
    </html>
  `;
};

/**
 * Abre ventana de impresión térmica
 */
export const printThermal = async (invoice, sale, width = '80mm') => {
  const html = await generateThermalHTML(invoice, sale, width);
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

/**
 * Descarga PDF
 */
export const downloadPDF = async (invoice, sale) => {
  const doc = await generateInvoicePDF(invoice, sale);
  doc.save(`${invoice.fullNumber}.pdf`);
};

/**
 * Abre PDF en nueva ventana para imprimir
 */
export const printPDF = async (invoice, sale) => {
  const doc = await generateInvoicePDF(invoice, sale);
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
};
