import Image from "next/image";
import { UserGroupIcon, ClockIcon, StarIcon, BookmarkIcon } from "@heroicons/react/24/outline";

export default function Sobre() {
    return (
        <section id="sobre" className="bg-[#0f0f0f] py-24 px-6 md:px-16 text-white">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                
                {/* Texto */}
                <div>
                    <h2 className="text-4xl font-bold mb-6">Sobre a GB Barbershop</h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        Informações sobre a loja
                    </p>
                    <p className="text-gray-300 leading-relaxed mb-10">
                        Mais informações caso deseje acrescentar
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#1a1a1a] p-6 rounded-lg text-center border border-neutral-800">
                            <BookmarkIcon className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-yellow-500">5+</p>
                            <p className="text-gray-400 text-sm">Anos de Experiência</p>
                        </div>

                        <div className="bg-[#1a1a1a] p-6 rounded-lg text-center border border-neutral-800">
                            <UserGroupIcon className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-yellow-500">500+</p>
                            <p className="text-gray-400 text-sm">Clientes Satisfeitos</p>
                        </div>

                        <div className="bg-[#1a1a1a] p-6 rounded-lg text-center border border-neutral-800">
                            <ClockIcon className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-yellow-500">6 dias</p>
                            <p className="text-gray-400 text-sm">Aberto na Semana</p>
                        </div>

                        <div className="bg-[#1a1a1a] p-6 rounded-lg text-center border border-neutral-800">
                            <StarIcon className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-yellow-500">4.9</p>
                            <p className="text-gray-400 text-sm">Avaliação Média</p>
                        </div>
                    </div>
                </div>

                {/* Imagens - Layout corrigido */}
                <div className="grid grid-cols-2 grid-rows-3 gap-4 h-[600px]">
                    {/* Imagem 1 - Ocupa 3 linhas na primeira coluna */}
                    <div className="row-span-3">
                        <Image
                            src="/images/barbeiro.png"
                            alt="Barbeiro"
                            width={400}
                            height={600}
                            className="rounded-lg object-cover w-full h-full"
                        />
                    </div>

                    {/* Imagem 2 - Primeira linha, segunda coluna */}
                    <div>
                        <Image
                            src="/images/pole.png"
                            alt="Símbolo da barbearia"
                            width={400}
                            height={200}
                            className="rounded-lg object-cover w-full h-full"
                        />
                    </div>

                    {/* Imagem 3 - Segunda linha, segunda coluna */}
                    <div>
                        <Image
                            src="/images/barbearia.png"
                            alt="Barbearia"
                            width={400}
                            height={200}
                            className="rounded-lg object-cover w-full h-full"
                        />
                    </div>

                    {/* Card Ambiente Premium - Terceira linha, segunda coluna */}
                    <div className="bg-yellow-600 text-black p-6 rounded-lg flex flex-col justify-center">
                        <h3 className="text-lg font-semibold mb-2">Ambiente Premium</h3>
                        <p className="text-sm">Conforto e sofisticação para sua experiência</p>
                    </div>
                </div>
            </div>
        </section>
    );
}