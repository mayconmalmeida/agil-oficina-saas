
export const parseXmlProducts = (xmlText: string): any[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  const products: any[] = [];
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
  
  return products;
};
