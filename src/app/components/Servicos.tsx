"use client";

import { ScissorsIcon, SparklesIcon, PaintBrushIcon, WrenchScrewdriverIcon, ClockIcon, } from "@heroicons/react/24/outline";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function Servicos() {
  const servicos = [
    {
      titulo: "Corte de Cabelo",
      descricao:
        "Cortes modernos e clássicos executados por profissionais experientes",
      preco: "A partir de R$ 40,00",
      icone: <ScissorsIcon className="w-8 h-8 text-yellow-500" />,
    },
    {
      titulo: "Barba",
      descricao:
        "Design de barba completo com toalha quente e produtos premium",
      preco: "A partir de R$ 35,00",
      icone: <SparklesIcon className="w-8 h-8 text-yellow-500" />,
    },
    {
      titulo: "Corte + Barba",
      descricao: "Combinação completa de corte de cabelo e design de barba",
      preco: "A partir de R$ 65,00",
      icone: <ScissorsIcon className="w-8 h-8 text-yellow-500" />,
    },
    {
      titulo: "Pintura de Cabelo",
      descricao: "Coloração profissional e luzes para renovar seu visual",
      preco: "A partir de R$ 80,00",
      icone: <PaintBrushIcon className="w-8 h-8 text-yellow-500" />,
    },
    {
      titulo: "Tratamentos Capilares",
      descricao: "Hidratação, relaxamento e tratamentos capilares especializados",
      preco: "A partir de R$ 50,00",
      icone: <WrenchScrewdriverIcon className="w-8 h-8 text-yellow-500" />,
    },
    {
      titulo: "Design de Sobrancelha",
      descricao:
        "Design profissional de sobrancelhas para realçar sua expressão",
      preco: "A partir de R$ 25,00",
      icone: <SparklesIcon className="w-8 h-8 text-yellow-500" />,
    },
    {
      titulo: "Limpeza de Pele",
      descricao: "Limpeza facial profunda para pele saudável e revitalizada",
      preco: "A partir de R$ 45,00",
      icone: <SparklesIcon className="w-8 h-8 text-yellow-500" />,
    },
    {
      titulo: "Massagem Relaxante",
      descricao: "Massagem terapêutica para aliviar tensões e estresse",
      preco: "A partir de R$ 60,00",
      icone: <ClockIcon className="w-8 h-8 text-yellow-500" />,
    },
  ];

  return (
    <section
      id="servicos"
      className="bg-[#212121] py-24 px-6 md:px-16 text-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Nossos Serviços</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Oferecemos uma gama completa de serviços para você ficar impecável
          </p>
        </div>

        {/* Carrossel com Swiper */}
        <Swiper
          modules={[Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false
          }}
          loop={true}
          breakpoints={{

            640: {
              slidesPerView: 1,
              spaceBetween: 25
            },

            768: {
              slidesPerView: 2,
              spaceBetween: 30
            },

            1024: {
              slidesPerView: 3,
              spaceBetween: 35
            },

            1280: {
              slidesPerView: 4,
              spaceBetween: 40
            }
          }}
          className="relative px-4 md:px-8"
        >
          {servicos.map((servico, index) => (
            <SwiperSlide key={index}>
              {/* Card */}
              <div className="bg-[#1a1a1a] border border-neutral-800 rounded-lg p-6 hover:border-yellow-500 transition-all duration-300 group text-center flex flex-col h-[320px] my-8 mx-2 transform hover:scale-105">
                <div className="flex justify-center mb-4">
                  {servico.icone}
                </div>
                <div className="flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-yellow-500 transition-colors duration-300">
                    {servico.titulo}
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed flex-grow line-clamp-4">
                    {servico.descricao}
                  </p>
                  <div className="mt-auto border-t border-neutral-700 pt-4">
                    <p className="text-yellow-500 font-semibold">
                      {servico.preco}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}