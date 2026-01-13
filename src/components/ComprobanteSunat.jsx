import React from 'react';
import { Badge } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency, formatDateTime } from '../utils/formatters';

/**
 * Componente visual del comprobante electrónico SUNAT
 */
const ComprobanteSunat = ({ comprobante, venta }) => {
  if (!comprobante) return null;

  const tipoComprobante = comprobante.tipo === 'FACTURA' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA';
  
  const getEstadoBadge = () => {
    switch (comprobante.estadoSunat) {
      case 'ACEPTADO':
        return <Badge bg="success" className="fs-6">✓ ACEPTADO POR SUNAT</Badge>;
      case 'PENDIENTE':
        return <Badge bg="warning" text="dark" className="fs-6">⏳ PENDIENTE</Badge>;
      case 'RECHAZADO':
        return <Badge bg="danger" className="fs-6">✗ RECHAZADO</Badge>;
      default:
        return <Badge bg="secondary" className="fs-6">NO ENVIADO</Badge>;
    }
  };

  return (
    <div className="comprobante-sunat bg-white p-3 rounded border" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
      {/* Tipo y número de comprobante */}
      <div className="text-center mb-3 py-2 bg-light rounded">
        <h6 className="mb-1 fw-bold">{tipoComprobante}</h6>
        <h4 className="mb-0 text-primary fw-bold">{comprobante.numeroCompleto || comprobante.fullNumber}</h4>
      </div>

      {/* Estado SUNAT */}
      <div className="text-center mb-3">
        {getEstadoBadge()}
      </div>

      {/* Datos del cliente */}
      <div className="mb-3 pb-2 border-bottom">
        <p className="mb-1"><strong>ADQUIRIENTE</strong></p>
        <p className="mb-0">{comprobante.clienteTipoDoc || 'ND'}: {comprobante.clienteNumeroDoc || '00000000'}</p>
        <p className="mb-0">{comprobante.clienteNombre || 'CLIENTE GENERAL'}</p>
      </div>

      {/* Fecha */}
      <div className="mb-3">
        <p className="mb-0"><strong>FECHA EMISIÓN:</strong> {formatDateTime(comprobante.createdAt || new Date()).split(' ')[0]}</p>
        <p className="mb-0"><strong>MONEDA:</strong> SOLES</p>
      </div>

      {/* Items */}
      {venta?.items && venta.items.length > 0 && (
        <div className="mb-3 pb-2 border-bottom">
          <table className="table table-sm table-borderless mb-0" style={{ fontSize: '11px' }}>
            <thead>
              <tr className="border-bottom">
                <th className="ps-0">CANT.</th>
                <th>DESCRIPCIÓN</th>
                <th className="text-end">P/U</th>
                <th className="text-end pe-0">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {venta.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="ps-0">{item.quantity || item.cantidad}</td>
                  <td>{item.productName || item.productoNombre}{item.talla && ` - ${item.talla}`}</td>
                  <td className="text-end">{formatCurrency(item.unitPrice || item.precioUnitario)}</td>
                  <td className="text-end pe-0">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totales */}
      <div className="mb-3">
        <div className="d-flex justify-content-between"><span>OP. GRAVADA S/</span><span>{formatCurrency(comprobante.subtotal || venta?.subtotal)}</span></div>
        <div className="d-flex justify-content-between"><span>IGV 18% S/</span><span>{formatCurrency(comprobante.igv || venta?.tax)}</span></div>
        <div className="d-flex justify-content-between fw-bold fs-5 mt-1"><span>TOTAL S/</span><span>{formatCurrency(comprobante.total || venta?.total)}</span></div>
      </div>

      {/* QR y Hash - Solo si está aceptado */}
      {comprobante.estadoSunat === 'ACEPTADO' && (
        <div className="text-center pt-3 border-top">
          {comprobante.qrCode && (
            <div className="mb-2">
              <QRCodeSVG value={comprobante.qrCode} size={100} level="M" includeMargin={true} />
            </div>
          )}
          {comprobante.hashCpe && (
            <div className="mb-2">
              <p className="mb-0 small"><strong>Resumen:</strong></p>
              <code className="small" style={{ fontSize: '9px', wordBreak: 'break-all' }}>{comprobante.hashCpe}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComprobanteSunat;
