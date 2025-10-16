// components/ModalAgendamento.tsx
"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import {
    ScissorsIcon,
    SparklesIcon,
    PaintBrushIcon,
    WrenchScrewdriverIcon,
    CalendarIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import Notification from "./Notification";

interface ModalAgendamentoProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'servico' | 'data';

interface NotificationState {
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
}

interface HorarioDisponivel {
    hora: string;
    disponivel: boolean;
}

export default function ModalAgendamento({ isOpen, onClose }: ModalAgendamentoProps) {
    const [servico, setServico] = useState("");
    const [servicoSelecionado, setServicoSelecionado] = useState<any>(null);
    const [dataSelecionada, setDataSelecionada] = useState("");
    const [horaSelecionada, setHoraSelecionada] = useState("");
    const [loading, setLoading] = useState(false);
    const [carregandoHorarios, setCarregandoHorarios] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [currentStep, setCurrentStep] = useState<Step>('servico');
    const [horariosDisponiveis, setHorariosDisponiveis] = useState<HorarioDisponivel[]>([]);
    const [notification, setNotification] = useState<NotificationState>({
        show: false,
        message: "",
        type: "success"
    });

    // Horários fixos da barbearia (08:00 às 20:00)
    const horariosFixos = [
        "08:00", "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00", "17:00",
        "18:00", "19:00"
    ];

    const servicos = [
        {
            id: "corte-cabelo",
            titulo: "Corte de Cabelo",
            descricao: "Cortes modernos e clássicos executados por profissionais experientes",
            preco: "R$ 40,00",
            icone: <ScissorsIcon className="w-8 h-8" />,
            duracao: "30 min"
        },
        {
            id: "barba",
            titulo: "Barba",
            descricao: "Design de barba completo com toalha quente e produtos premium",
            preco: "R$ 35,00",
            icone: <SparklesIcon className="w-8 h-8" />,
            duracao: "25 min"
        },
        {
            id: "corte-barba",
            titulo: "Corte + Barba",
            descricao: "Combinação completa de corte de cabelo e design de barba",
            preco: "R$ 65,00",
            icone: <ScissorsIcon className="w-8 h-8" />,
            duracao: "50 min"
        },
        {
            id: "pintura-cabelo",
            titulo: "Pintura de Cabelo",
            descricao: "Coloração profissional e luzes para renovar seu visual",
            preco: "R$ 80,00",
            icone: <PaintBrushIcon className="w-8 h-8" />,
            duracao: "90 min"
        },
        {
            id: "tratamento-capilar",
            titulo: "Tratamentos Capilares",
            descricao: "Hidratação, relaxamento e tratamentos capilares especializados",
            preco: "R$ 50,00",
            icone: <WrenchScrewdriverIcon className="w-8 h-8" />,
            duracao: "45 min"
        },
        {
            id: "sobrancelha",
            titulo: "Design de Sobrancelha",
            descricao: "Design profissional de sobrancelhas para realçar sua expressão",
            preco: "R$ 25,00",
            icone: <SparklesIcon className="w-8 h-8" />,
            duracao: "20 min"
        }
    ];

    // Verifica se usuário está logado
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    // Carrega horários disponíveis quando a data é selecionada
    useEffect(() => {
        if (dataSelecionada) {
            carregarHorariosDisponiveis();
        }
    }, [dataSelecionada]);

    // Função para buscar o telefone do usuário
    const buscarTelefoneUsuario = async (userId: string): Promise<string> => {
        try {
            const userDocRef = doc(db, "usuarios", userId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                // Tenta buscar o telefone formatado primeiro, depois o telefone apenas números
                return userData.telefoneFormatado || userData.telefone || "";
            }
            return "";
        } catch (error) {
            console.error("Erro ao buscar telefone do usuário:", error);
            return "";
        }
    };

    const carregarHorariosDisponiveis = async () => {
        if (!dataSelecionada) return;

        setCarregandoHorarios(true);
        try {
            const dataObj = new Date(dataSelecionada + 'T00:00:00');
            const inicioDia = new Date(dataObj);
            const fimDia = new Date(dataObj);
            fimDia.setHours(23, 59, 59, 999);

            // Busca agendamentos já marcados
            const agendamentosRef = collection(db, "agendamentos");
            const q = query(
                agendamentosRef,
                where("dataHora", ">=", inicioDia),
                where("dataHora", "<=", fimDia)
            );

            const querySnapshot = await getDocs(q);
            const horariosOcupados = new Set();

            querySnapshot.forEach((doc) => {
                const agendamento = doc.data();
                const dataHora = agendamento.dataHora.toDate();
                const hora = dataHora.getHours().toString().padStart(2, '0') + ':' +
                    dataHora.getMinutes().toString().padStart(2, '0');
                horariosOcupados.add(hora);
            });

            // === NOVA LÓGICA: bloquear horários passados se for hoje ===
            const hoje = new Date();
            const ehHoje = dataObj.toDateString() === hoje.toDateString();

            const disponiveis = horariosFixos.map(hora => {
                const [horaStr, minutoStr] = hora.split(':').map(Number);
                const horarioDate = new Date(dataObj);
                horarioDate.setHours(horaStr, minutoStr, 0, 0);

                // Se for hoje e o horário já passou, marcar como indisponível
                const horarioJaPassou = ehHoje && horarioDate < hoje;

                return {
                    hora,
                    disponivel: !horariosOcupados.has(hora) && !horarioJaPassou
                };
            });

            setHorariosDisponiveis(disponiveis);
        } catch (error) {
            console.error("Erro ao carregar horários:", error);
            showNotification("Erro ao carregar horários disponíveis", "error");
        } finally {
            setCarregandoHorarios(false);
        }
    };

    const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
        setNotification({
            show: true,
            message,
            type
        });
    };

    const hideNotification = () => {
        setNotification(prev => ({ ...prev, show: false }));
    };

    const handleSelecionarServico = (servico: any) => {
        setServicoSelecionado(servico);
        setServico(servico.titulo);
        setCurrentStep('data');
    };

    const handleVoltar = () => {
        setCurrentStep('servico');
        setServicoSelecionado(null);
        setDataSelecionada("");
        setHoraSelecionada("");
        setHorariosDisponiveis([]);
    };

    const handleSelecionarData = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDataSelecionada(e.target.value);
        setHoraSelecionada(""); // Reseta a hora quando a data muda
    };

    const handleSelecionarHora = (hora: string) => {
        if (horariosDisponiveis.find(h => h.hora === hora)?.disponivel) {
            setHoraSelecionada(hora);
        }
    };

    const formatarDataHora = () => {
        if (!dataSelecionada || !horaSelecionada) return "";
        return `${dataSelecionada}T${horaSelecionada}`;
    };

    const handleAgendar = async () => {
        if (!user) {
            showNotification("Você precisa estar logado para agendar!", "error");
            return;
        }

        if (!servico || !dataSelecionada || !horaSelecionada) {
            showNotification("Preencha todos os campos!", "error");
            return;
        }

        const dataHoraCompleta = formatarDataHora();
        if (!dataHoraCompleta) {
            showNotification("Data ou hora inválida!", "error");
            return;
        }

        setLoading(true);

        try {
            // Busca o telefone do usuário
            const usuarioTelefone = await buscarTelefoneUsuario(user.uid);

            await addDoc(collection(db, "agendamentos"), {
                usuarioId: user.uid,
                usuarioEmail: user.email,
                usuarioNome: user.displayName || "Cliente",
                usuarioTelefone: usuarioTelefone, // AQUI ESTÁ O CAMPO QUE FALTAVA
                servico: servicoSelecionado.titulo,
                preco: servicoSelecionado.preco,
                duracao: servicoSelecionado.duracao,
                dataHora: new Date(dataHoraCompleta),
                status: "pendente",
                criadoEm: serverTimestamp(),
            });

            showNotification("Agendamento criado com sucesso! Em breve entraremos em contato para confirmação.");

            // Limpa o formulário e fecha o modal após um delay
            setTimeout(() => {
                setServico("");
                setServicoSelecionado(null);
                setDataSelecionada("");
                setHoraSelecionada("");
                setHorariosDisponiveis([]);
                setCurrentStep('servico');
                onClose();
            }, 2000);

        } catch (error: any) {
            console.error("Erro detalhado:", error);
            showNotification("Erro ao agendar: " + error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    // Fecha o modal ao pressionar ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Overlay escuro */}
                <div
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-neutral-800 rounded-lg max-w-2xl w-full mx-4 shadow-xl">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-neutral-700">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-white">Agendar Serviço</h2>
                            {/* Steps Indicator */}
                            <div className="flex gap-2">
                                <div className={`w-3 h-3 rounded-full ${currentStep === 'servico' ? 'bg-yellow-500' : 'bg-neutral-600'
                                    }`} />
                                <div className={`w-3 h-3 rounded-full ${currentStep === 'data' ? 'bg-yellow-500' : 'bg-neutral-600'
                                    }`} />
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-6">
                        {!user ? (
                            <div className="text-center">
                                <h3 className="text-lg font-semibold mb-4">Faça Login para Agendar</h3>
                                <p className="text-gray-300 mb-6">
                                    Você precisa estar logado para fazer agendamentos.
                                </p>
                                <button
                                    onClick={() => window.location.href = "/login"}
                                    className="bg-yellow-600 text-black px-6 py-3 rounded-md hover:bg-yellow-500 transition w-full font-semibold"
                                >
                                    Fazer Login
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Step 1: Seleção de Serviço */}
                                {currentStep === 'servico' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                            <ScissorsIcon className="w-6 h-6 text-yellow-500" />
                                            Selecione o Serviço
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                                            {servicos.map((servicoItem) => (
                                                <div
                                                    key={servicoItem.id}
                                                    onClick={() => handleSelecionarServico(servicoItem)}
                                                    className={`bg-neutral-700 border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:border-yellow-500 group mx-1 ${servicoSelecionado?.id === servicoItem.id
                                                        ? 'border-yellow-500 bg-yellow-500/10'
                                                        : 'border-neutral-600'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`p-2 rounded-lg ${servicoSelecionado?.id === servicoItem.id
                                                            ? 'bg-yellow-500'
                                                            : 'bg-neutral-600 group-hover:bg-yellow-500'
                                                            } transition-colors`}>
                                                            {servicoItem.icone}
                                                        </div>

                                                        <div className="flex-1">
                                                            <h4 className={`font-semibold mb-1 ${servicoSelecionado?.id === servicoItem.id
                                                                ? 'text-yellow-500'
                                                                : 'text-white group-hover:text-yellow-500'
                                                                } transition-colors`}>
                                                                {servicoItem.titulo}
                                                            </h4>
                                                            <p className="text-gray-300 text-sm mb-2">
                                                                {servicoItem.descricao}
                                                            </p>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-yellow-500 font-bold">
                                                                    {servicoItem.preco}
                                                                </span>
                                                                <span className="text-gray-400 text-xs flex items-center gap-1">
                                                                    <ClockIcon className="w-3 h-3" />
                                                                    {servicoItem.duracao}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Seleção de Data/Hora */}
                                {currentStep === 'data' && servicoSelecionado && (
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <CalendarIcon className="w-6 h-6 text-yellow-500" />
                                                Escolha a Data e Hora
                                            </h3>
                                            <button
                                                onClick={handleVoltar}
                                                className="text-yellow-500 hover:text-yellow-400 text-sm transition-colors"
                                            >
                                                ← Voltar
                                            </button>
                                        </div>

                                        {/* Resumo do Serviço Selecionado */}
                                        <div className="bg-neutral-700 rounded-lg p-4 mb-6 border border-yellow-500/30 mx-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-yellow-500">
                                                        {servicoSelecionado.titulo}
                                                    </h4>
                                                    <p className="text-gray-300 text-sm">
                                                        {servicoSelecionado.descricao}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-yellow-500 font-bold text-lg">
                                                        {servicoSelecionado.preco}
                                                    </p>
                                                    <p className="text-gray-400 text-sm">
                                                        {servicoSelecionado.duracao}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Seleção de Data */}
                                        <div className="mb-6">
                                            <label className="block text-gray-300 mb-2 text-sm font-medium">
                                                Data
                                            </label>
                                            <input
                                                type="date"
                                                value={dataSelecionada}
                                                onChange={handleSelecionarData}
                                                className="w-full p-3 rounded bg-neutral-700 text-white border border-neutral-600 focus:border-yellow-500 focus:outline-none transition-colors"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>

                                        {/* Seleção de Horário */}
                                        {dataSelecionada && (
                                            <div className="mb-6">
                                                <label className="block text-gray-300 mb-2 text-sm font-medium">
                                                    Horário Disponível
                                                </label>
                                                {carregandoHorarios ? (
                                                    <div className="text-center py-4">
                                                        <p className="text-gray-400">Carregando horários disponíveis...</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                        {horariosDisponiveis.map((horario) => (
                                                            <button
                                                                key={horario.hora}
                                                                onClick={() => handleSelecionarHora(horario.hora)}
                                                                disabled={!horario.disponivel}
                                                                className={`p-3 rounded border-2 text-sm font-medium transition-all ${horaSelecionada === horario.hora
                                                                    ? 'bg-yellow-500 border-yellow-500 text-black'
                                                                    : horario.disponivel
                                                                        ? 'bg-neutral-700 border-neutral-600 text-white hover:border-yellow-500 hover:bg-yellow-500/10'
                                                                        : 'bg-neutral-800 border-neutral-700 text-gray-500 cursor-not-allowed'
                                                                    }`}
                                                            >
                                                                {horario.hora}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <button
                                            onClick={handleAgendar}
                                            disabled={loading || !dataSelecionada || !horaSelecionada}
                                            className="bg-yellow-600 text-black px-6 py-3 rounded-md hover:bg-yellow-500 transition w-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? "Agendando..." : `Confirmar Agendamento - ${servicoSelecionado.preco}`}
                                        </button>

                                        {dataSelecionada && horaSelecionada && (
                                            <p className="text-gray-400 text-sm text-center mt-4">
                                                Agendamento para: {new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR')} às {horaSelecionada}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Notificação */}
            {notification.show && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={hideNotification}
                    duration={notification.type === "success" ? 5000 : 7000}
                />
            )}

            {/* Estilos para esconder a scrollbar */}
            <style jsx>{`
                .overflow-y-auto::-webkit-scrollbar {
                    width: 6px;
                }
                .overflow-y-auto::-webkit-scrollbar-track {
                    background: #404040;
                    border-radius: 3px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #737373;
                    border-radius: 3px;
                }
                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: #a3a3a3;
                }
            `}</style>
        </>
    );
}