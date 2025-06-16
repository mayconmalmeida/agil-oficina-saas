
export interface ParsedSupplier {
  cnpj: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  cep?: string;
}

export interface ParsedProduct {
  codigo: string;
  nome: string;
  quantidade: number;
  preco_unitario: number;
  [key: string]: string | number; // Index signature para compatibilidade com Json
}

export interface XmlParseResult {
  supplier: ParsedSupplier | null;
  products: ParsedProduct[];
}

export const parseXmlProducts = (xmlText: string): XmlParseResult => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  // Extrair informações do fornecedor
  let supplier: ParsedSupplier | null = null;
  const emit = xmlDoc.getElementsByTagName('emit')[0];
  
  if (emit) {
    const cnpj = emit.getElementsByTagName('CNPJ')[0]?.textContent || '';
    const xNome = emit.getElementsByTagName('xNome')[0]?.textContent || '';
    
    if (cnpj && xNome) {
      const enderEmit = emit.getElementsByTagName('enderEmit')[0];
      
      supplier = {
        cnpj: cnpj,
        name: xNome,
        email: emit.getElementsByTagName('email')[0]?.textContent || undefined,
        phone: emit.getElementsByTagName('fone')[0]?.textContent || undefined,
        address: enderEmit?.getElementsByTagName('xLgr')[0]?.textContent || undefined,
        city: enderEmit?.getElementsByTagName('xMun')[0]?.textContent || undefined,
        state: enderEmit?.getElementsByTagName('UF')[0]?.textContent || undefined,
        cep: enderEmit?.getElementsByTagName('CEP')[0]?.textContent || undefined
      };
    }
  }
  
  // Extrair produtos (código existente)
  const products: ParsedProduct[] = [];
  const detElements = xmlDoc.getElementsByTagName('det');
  
  for (let i = 0; i < detElements.length; i++) {
    const det = detElements[i];
    const prod = det.getElementsByTagName('prod')[0];
    
    if (prod) {
      const cProd = prod.getElementsByTagName('cProd')[0]?.textContent || '';
      const xProd = prod.getElementsByTagName('xProd')[0]?.textContent || '';
      const qCom = prod.getElementsByTagName('qCom')[0]?.textContent || '0';
      const vUnCom = prod.getElementsByTagName('vUnCom')[0]?.textContent || '0';
      
      if (cProd && xProd) {
        products.push({
          codigo: cProd,
          nome: xProd,
          quantidade: parseInt(qCom) || 0,
          preco_unitario: parseFloat(vUnCom) || 0
        });
      }
    }
  }
  
  return { supplier, products };
};
