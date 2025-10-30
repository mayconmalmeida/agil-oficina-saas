
import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img src="/oficinago-logo-backup.png" alt="OficinaGO" className="h-10 w-auto" />
            </div>
            <p className="text-gray-300 mb-4">
              Sistema completo de gestão para oficinas mecânicas.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(46) 99932-4779</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contatooficinago@gmail.com</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Localização</h4>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Pato Branco - PR<br />Brasil</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Oficina Go. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
