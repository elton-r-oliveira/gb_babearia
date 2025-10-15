import {
  ScissorsIcon,
  SparklesIcon,
  PaintBrushIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

export default function Servicos() {
  const servicos = [
    {
      titulo: "Corte de Cabelo",
      descricao: "Cortes modernos e clássicos executados por profissionais experientes",
      preco: "A partir de R$ 40,00",
      icone: <ScissorsIcon className="w-8 h-8 text-yellow-500" />
    },
    {
      titulo: "Barba",
      descricao: "Design de barba completo com toalha quente e produtos premium",
      preco: "A partir de R$ 35,00",
      icone: <SparklesIcon className="w-8 h-8 text-yellow-500" />
    },
    {
      titulo: "Pintura de Cabelo",
      descricao: "Coloração profissional e luzes para renovar seu visual",
      preco: "A partir de R$ 80,00",
      icone: <PaintBrushIcon className="w-8 h-8 text-yellow-500" />
    },
    {
      titulo: "Tratamentos",
      descricao: "Hidratação, relaxamento e tratamentos capilares especializados para todos os tipos de cabelo",
      preco: "A partir de R$ 50,00",
      icone: <WrenchScrewdriverIcon className="w-8 h-8 text-yellow-500" />
    }
  ];

  return (
    <section id="servicos" className="bg-[#212121] py-24 px-6 md:px-16 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Nossos Serviços</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Oferecemos uma gama completa de serviços para você ficar impecável
          </p>
        </div>

        {/* Grid de Serviços */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicos.map((servico, index) => (
            <div
              key={index}
              className="bg-[#1a1a1a] border border-neutral-800 rounded-lg p-6 hover:border-yellow-500 transition-colors duration-300 group text-center flex flex-col h-full"
            >
              {/* Ícone Centralizado */}
              <div className="flex justify-center mb-4">
                {servico.icone}
              </div>

              {/* Conteúdo do Card */}
              <div className="flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-yellow-500 transition-colors duration-300">
                  {servico.titulo}
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed flex-grow">
                  {servico.descricao}
                </p>

                {/* Linha e Preço - Sempre na base */}
                <div className="mt-auto">
                  <div className="border-t border-neutral-700 pt-4">
                    <p className="text-yellow-500 font-semibold">{servico.preco}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}