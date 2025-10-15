import { PhoneIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
import { FaInstagram, FaFacebook } from "react-icons/fa";

export default function Footer() {
    return (
        <footer id="contato" className="bg-[#0a0a0a] border-t border-neutral-800 py-16 px-6 md:px-16 text-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Coluna 1 - Sobre */}
                    <div>
                        <h3 className="text-2xl font-bold mb-4 text-yellow-500">GB Barbershop</h3>
                        <p className="text-gray-300 leading-relaxed mb-6">
                            Tradição, estilo e excelência desde 2009. Seu visual em boas mãos.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="bg-[#1a1a1a] p-3 rounded-lg border border-neutral-800 hover:border-yellow-500 transition-colors"
                            >
                                <FaInstagram className="w-5 h-5 text-gray-300 hover:text-yellow-500 transition-colors" />
                            </a>
                            <a
                                href="#"
                                className="bg-[#1a1a1a] p-3 rounded-lg border border-neutral-800 hover:border-yellow-500 transition-colors"
                            >
                                <FaFacebook className="w-5 h-5 text-gray-300 hover:text-yellow-500 transition-colors" />
                            </a>
                        </div>
                    </div>

                    {/* Coluna 2 - Horário */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">
                            Horário de Funcionamento
                        </h4>
                        <ul className="text-gray-300 space-y-2">
                            <li className="flex flex-col">
                                <span className="font-medium flex items-center gap-2">
                                    <ClockIcon className="w-5 h-5 text-yellow-500" />
                                    Segunda a Sexta: 9h - 20h
                                </span>
                                <span className="text-sm text-gray-400">Sábado: 9h - 18h</span>
                                <span className="text-sm text-gray-400">Domingo: fechado</span>
                            </li>
                        </ul>
                    </div>

                    {/* Coluna 3 - Contato */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Contato</h4>
                        <ul className="text-gray-300 space-y-2">
                            <li className="flex items-center gap-2">
                                <PhoneIcon className="w-5 h-5 text-yellow-500" />
                                <span>(21) 4002-8922</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <MapPinIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
                                <div>
                                    <span>Av. Principal, 1234</span>
                                    <br />
                                    <span className="text-gray-400">Rio de Janeiro - RJ</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Linha divisória */}
                <div className="border-t border-neutral-800 mt-12 pt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        © 2025 GB Barbershop. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}