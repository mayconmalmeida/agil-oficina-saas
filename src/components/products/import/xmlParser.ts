
export interface ParsedSupplier {
  name: string;
  cnpj: string;
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
}

export interface XmlParseResult {
  supplier?: ParsedSupplier;
  products: ParsedProduct[];
  numeroNota: string;
}

export function parseXmlProducts(xmlText: string): XmlParseResult {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error('XML inválido: ' + parseError.textContent);
    }

    // Extract invoice number
    const numeroNota = doc.querySelector('ide nNF')?.textContent || 
                      doc.querySelector('nNF')?.textContent || 
                      `NFE-${Date.now()}`;

    // Extract supplier info
    let supplier: ParsedSupplier | undefined;
    const emit = doc.querySelector('emit');
    if (emit) {
      const cnpjElement = emit.querySelector('CNPJ');
      const nomeElement = emit.querySelector('xNome');
      
      if (cnpjElement && nomeElement) {
        supplier = {
          name: nomeElement.textContent || '',
          cnpj: cnpjElement.textContent || '',
          email: emit.querySelector('email')?.textContent,
          phone: emit.querySelector('fone')?.textContent,
          address: emit.querySelector('enderEmit xLgr')?.textContent,
          city: emit.querySelector('enderEmit xMun')?.textContent,
          state: emit.querySelector('enderEmit UF')?.textContent,
          cep: emit.querySelector('enderEmit CEP')?.textContent
        };
      }
    }

    // Extract products
    const products: ParsedProduct[] = [];
    const dets = doc.querySelectorAll('det');
    
    dets.forEach(det => {
      const prod = det.querySelector('prod');
      if (prod) {
        const codigo = prod.querySelector('cProd')?.textContent || '';
        const nome = prod.querySelector('xProd')?.textContent || '';
        const quantidade = parseFloat(prod.querySelector('qCom')?.textContent || '1');
        const preco = parseFloat(prod.querySelector('vUnCom')?.textContent || '0');

        if (codigo && nome) {
          products.push({
            codigo,
            nome,
            quantidade,
            preco_unitario: preco
          });
        }
      }
    });

    return {
      supplier,
      products,
      numeroNota
    };
  } catch (error) {
    console.error('Erro ao fazer parse do XML:', error);
    throw new Error('Falha ao processar XML: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
  }
}
