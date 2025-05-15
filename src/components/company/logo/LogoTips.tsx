
import React from 'react';

const LogoTips: React.FC = () => {
  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium mb-2">Dicas para um bom logo:</h4>
      <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
        <li>Use um fundo transparente para melhor visualização</li>
        <li>Tamanhos recomendados: 800x450px ou proporção similar</li>
        <li>Evite textos muito pequenos que ficam ilegíveis em impressões</li>
        <li>Prefira imagens com alta resolução para evitar pixelização</li>
      </ul>
    </div>
  );
};

export default LogoTips;
