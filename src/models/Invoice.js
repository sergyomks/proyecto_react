import * as Yup from 'yup';
import { v4 as uuidv4 } from 'uuid';

// Tipos de comprobante
export const INVOICE_TYPES = {
  BOLETA: 'boleta',
  FACTURA: 'factura'
};

// Series por tipo
export const INVOICE_SERIES = {
  [INVOICE_TYPES.BOLETA]: 'B001',
  [INVOICE_TYPES.FACTURA]: 'F001'
};

// Schema para datos del emisor
export const IssuerDataSchema = Yup.object().shape({
  ruc: Yup.string().required('El RUC es requerido'),
  businessName: Yup.string().required('La razón social es requerida'),
  tradeName: Yup.string().nullable(),
  address: Yup.string().required('La dirección es requerida'),
  phone: Yup.string().nullable(),
  email: Yup.string().email().nullable()
});

// Schema para datos del cliente (factura)
export const ClientDataSchema = Yup.object().shape({
  documentType: Yup.string().oneOf(['DNI', 'RUC', 'CE', 'PASAPORTE']).required('El tipo de documento es requerido'),
  documentNumber: Yup.string().required('El número de documento es requerido'),
  name: Yup.string().required('El nombre es requerido'),
  address: Yup.string().nullable(),
  email: Yup.string().email().nullable()
});

// Schema para item de comprobante
export const InvoiceItemSchema = Yup.object().shape({
  description: Yup.string().required(),
  quantity: Yup.number().min(1).required(),
  unitPrice: Yup.number().min(0).required(),
  subtotal: Yup.number().min(0).required()
});

// Schema para crear comprobante
export const InvoiceCreateSchema = Yup.object().shape({
  saleId: Yup.string().required('El ID de venta es requerido'),
  type: Yup.string().oneOf(Object.values(INVOICE_TYPES), 'Tipo de comprobante inválido').required('El tipo es requerido'),
  issuerData: IssuerDataSchema.required('Los datos del emisor son requeridos'),
  clientData: Yup.object().when('type', {
    is: INVOICE_TYPES.FACTURA,
    then: () => ClientDataSchema.required('Los datos del cliente son requeridos para factura'),
    otherwise: () => Yup.object().nullable()
  }),
  items: Yup.array().of(InvoiceItemSchema).min(1, 'Debe haber al menos un item').required(),
  subtotal: Yup.number().min(0).required(),
  tax: Yup.number().min(0).required(),
  total: Yup.number().min(0).required()
});

/**
 * Genera número correlativo de comprobante
 * @param {string} type - Tipo de comprobante
 * @param {number} lastNumber - Último número usado
 * @returns {Object} { series, number, fullNumber }
 */
export const generateInvoiceNumber = (type, lastNumber = 0) => {
  const series = INVOICE_SERIES[type];
  const nextNumber = lastNumber + 1;
  const numberStr = String(nextNumber).padStart(8, '0');

  return {
    series,
    number: numberStr,
    fullNumber: `${series}-${numberStr}`
  };
};

/**
 * Crea un nuevo comprobante
 * @param {Object} invoiceData - Datos del comprobante
 * @param {number} lastNumber - Último número de comprobante del tipo
 * @returns {Object} Comprobante creado
 */
export const createInvoice = async (invoiceData, lastNumber = 0) => {
  const validated = await InvoiceCreateSchema.validate(invoiceData);
  const { series, number, fullNumber } = generateInvoiceNumber(validated.type, lastNumber);

  return {
    id: uuidv4(),
    saleId: validated.saleId,
    type: validated.type,
    series,
    number,
    fullNumber,
    issuerData: validated.issuerData,
    clientData: validated.clientData || null,
    items: validated.items,
    subtotal: validated.subtotal,
    tax: validated.tax,
    total: validated.total,
    createdAt: new Date().toISOString()
  };
};

/**
 * Convierte items de venta a items de comprobante
 * @param {Array} saleItems - Items de la venta
 * @returns {Array} Items del comprobante
 */
export const saleItemsToInvoiceItems = (saleItems) => {
  return saleItems.map((item) => ({
    description: `${item.productCode} - ${item.productName}`,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: item.subtotal
  }));
};

/**
 * Serializa un comprobante para almacenamiento
 * @param {Object} invoice - Comprobante
 * @returns {string} JSON string
 */
export const serializeInvoice = (invoice) => {
  return JSON.stringify(invoice);
};

/**
 * Deserializa un comprobante desde almacenamiento
 * @param {string} json - JSON string
 * @returns {Object} Comprobante
 */
export const deserializeInvoice = (json) => {
  return JSON.parse(json);
};

/**
 * Verifica igualdad de comprobantes (para round-trip testing)
 * @param {Object} i1 - Comprobante 1
 * @param {Object} i2 - Comprobante 2
 * @returns {boolean}
 */
export const areInvoicesEqual = (i1, i2) => {
  return JSON.stringify(i1) === JSON.stringify(i2);
};
