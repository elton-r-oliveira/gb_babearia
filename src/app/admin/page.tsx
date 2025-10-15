// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, orderBy, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import {
    CalendarIcon,
    UserIcon,
    ScissorsIcon,
    ClockIcon,
    CurrencyDollarIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    PhoneIcon,
    FunnelIcon
} from "@heroicons/react/24/outline";

// Lista de emails autorizados como admin (configure com seu email)
const ADMIN_EMAILS = ["elton@gmail.com", "admin@gbbarbershop.com"];

interface Agendamento {
    id: string;
    usuarioId: string;
    usuarioEmail: string;
    usuarioNome: string;
    usuarioTelefone: string;
    servico: string;
    preco: string;
    duracao: string;
    dataHora: Date;
    status: "pendente" | "confirmado" | "cancelado" | "concluido";
    criadoEm: Date;
}

export default function AdminPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState<string>("todos");
    const [filtroPeriodo, setFiltroPeriodo] = useState<string>("todos");
    const [dataInicio, setDataInicio] = useState<string>("");
    const [dataFim, setDataFim] = useState<string>("");
    const [mostrarFiltroAvancado, setMostrarFiltroAvancado] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);

            if (user && ADMIN_EMAILS.includes(user.email!)) {
                setIsAdmin(true);
                carregarAgendamentos();
            } else {
                setIsAdmin(false);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const carregarAgendamentos = async () => {
        try {
            setLoading(true);
            const agendamentosRef = collection(db, "agendamentos");
            const q = query(agendamentosRef, orderBy("dataHora", "asc"));
            const querySnapshot = await getDocs(q);

            const agendamentosData: Agendamento[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                agendamentosData.push({
                    id: doc.id,
                    ...data,
                    dataHora: data.dataHora.toDate(),
                    criadoEm: data.criadoEm.toDate(),
                    usuarioTelefone: data.usuarioTelefone || "",
                } as Agendamento);
            });

            setAgendamentos(agendamentosData);
        } catch (error) {
            console.error("Erro ao carregar agendamentos:", error);
        } finally {
            setLoading(false);
        }
    };

    const atualizarStatus = async (id: string, novoStatus: Agendamento["status"]) => {
        try {
            const agendamentoRef = doc(db, "agendamentos", id);
            await updateDoc(agendamentoRef, {
                status: novoStatus
            });

            setAgendamentos(prev =>
                prev.map(ag => ag.id === id ? { ...ag, status: novoStatus } : ag)
            );
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
        }
    };

    const excluirAgendamento = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;

        try {
            await deleteDoc(doc(db, "agendamentos", id));
            setAgendamentos(prev => prev.filter(ag => ag.id !== id));
        } catch (error) {
            console.error("Erro ao excluir agendamento:", error);
        }
    };

    const formatarTelefone = (telefone: string) => {
        if (!telefone) return "Não informado";

        const numeros = telefone.replace(/\D/g, '');

        if (numeros.length === 11) {
            return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
        } else if (numeros.length === 10) {
            return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
        }

        return telefone;
    };

    // Função para extrair valor numérico do preço
    const extrairValorNumerico = (preco: string): number => {
        const valor = preco.replace(/[^\d,]/g, '').replace(',', '.');
        return parseFloat(valor) || 0;
    };

    // Função para criar data no início do dia (00:00:00) - CORRIGIDA
    const criarDataInicio = (dataString: string): Date => {
        // Usando UTC para evitar problemas de fuso horário
        const [year, month, day] = dataString.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    };

    // Função para criar data no final do dia (23:59:59.999) - CORRIGIDA
    const criarDataFim = (dataString: string): Date => {
        // Usando UTC para evitar problemas de fuso horário
        const [year, month, day] = dataString.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    };

    // Calcular totais
    const calcularTotais = () => {
        const hoje = new Date();
        // Normalizar hoje para início do dia (local time)
        const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0, 0);
        const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59, 999);

        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();

        // Calcular períodos relativos
        const umaSemanaAtras = new Date(inicioHoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        const trintaDiasAtras = new Date(inicioHoje.getTime() - 30 * 24 * 60 * 60 * 1000);

        let agendamentosFiltrados = agendamentos;

        // Aplicar filtro de período
        if (filtroPeriodo !== "todos") {
            agendamentosFiltrados = agendamentos.filter(ag => {
                const dataAgendamento = ag.dataHora;

                switch (filtroPeriodo) {
                    case "hoje":
                        return dataAgendamento >= inicioHoje && dataAgendamento <= fimHoje;

                    case "semana":
                        return dataAgendamento >= umaSemanaAtras && dataAgendamento <= fimHoje;

                    case "mes":
                        return dataAgendamento >= trintaDiasAtras && dataAgendamento <= fimHoje;

                    case "mes_atual":
                        const primeiroDiaMes = new Date(anoAtual, mesAtual, 1, 0, 0, 0, 0);
                        const ultimoDiaMes = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59, 999);
                        return dataAgendamento >= primeiroDiaMes && dataAgendamento <= ultimoDiaMes;

                    case "personalizado":
                        if (dataInicio && dataFim) {
                            const inicio = criarDataInicio(dataInicio);
                            const fim = criarDataFim(dataFim);

                            console.log('=== FILTRO PERSONALIZADO ===');
                            console.log('Data Início (input):', dataInicio);
                            console.log('Data Fim (input):', dataFim);
                            console.log('Início (UTC):', inicio.toISOString());
                            console.log('Fim (UTC):', fim.toISOString());
                            console.log('Data Agendamento:', dataAgendamento.toISOString());
                            console.log('Dentro do período?', dataAgendamento >= inicio && dataAgendamento <= fim);
                            console.log('============================');

                            return dataAgendamento >= inicio && dataAgendamento <= fim;
                        }
                        return true;

                    default:
                        return true;
                }
            });
        }

        // Aplicar filtro de status
        if (filtroStatus !== "todos") {
            agendamentosFiltrados = agendamentosFiltrados.filter(ag => ag.status === filtroStatus);
        }

        // Calcular totais
        const total = agendamentosFiltrados.length;
        const pendentes = agendamentosFiltrados.filter(a => a.status === "pendente").length;
        const confirmados = agendamentosFiltrados.filter(a => a.status === "confirmado").length;
        const concluidos = agendamentosFiltrados.filter(a => a.status === "concluido").length;

        // Calcular valor total
        const valorTotal = agendamentosFiltrados
            .filter(a => a.status !== "cancelado") // Não incluir cancelados no valor total
            .reduce((total, ag) => total + extrairValorNumerico(ag.preco), 0);

        return {
            agendamentosFiltrados,
            total,
            pendentes,
            confirmados,
            concluidos,
            valorTotal: valorTotal.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            })
        };
    };

    const { agendamentosFiltrados, total, pendentes, confirmados, concluidos, valorTotal } = calcularTotais();

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pendente": return "bg-yellow-500";
            case "confirmado": return "bg-green-500";
            case "cancelado": return "bg-red-500";
            case "concluido": return "bg-blue-500";
            default: return "bg-gray-500";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "pendente": return "Pendente";
            case "confirmado": return "Confirmado";
            case "cancelado": return "Cancelado";
            case "concluido": return "Concluído";
            default: return status;
        }
    };

    // Resetar filtros personalizados quando mudar o período
    useEffect(() => {
        if (filtroPeriodo !== "personalizado") {
            setDataInicio("");
            setDataFim("");
        }
    }, [filtroPeriodo]);

    const limparFiltros = () => {
        setFiltroStatus("todos");
        setFiltroPeriodo("todos");
        setDataInicio("");
        setDataFim("");
    };
    if (!user) {
        return (
            <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
                    <p className="text-gray-300 mb-6">Faça login para acessar o painel administrativo.</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="bg-yellow-600 text-black px-6 py-3 rounded-md hover:bg-yellow-500 transition"
                    >
                        Fazer Login
                    </button>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
                    <p className="text-gray-300">Você não tem permissão para acessar esta página.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-4 pt-20">
            <div className="max-w-7xl mx-auto">
                {/* Header com Filtros */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
                            <p className="text-gray-300">Gerencie os agendamentos da barbearia</p>
                        </div>

                        {/* Filtros e Botões */}
                        <div className="flex flex-wrap gap-3 items-center">
                            <select
                                value={filtroStatus}
                                onChange={(e) => setFiltroStatus(e.target.value)}
                                className="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-white focus:border-yellow-500 focus:outline-none text-sm"
                            >
                                <option value="todos">Todos os Status</option>
                                <option value="pendente">Pendentes</option>
                                <option value="confirmado">Confirmados</option>
                                <option value="concluido">Concluídos</option>
                                <option value="cancelado">Cancelados</option>
                            </select>

                            <select
                                value={filtroPeriodo}
                                onChange={(e) => setFiltroPeriodo(e.target.value)}
                                className="bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-white focus:border-yellow-500 focus:outline-none text-sm"
                            >
                                <option value="todos">Todos os Períodos</option>
                                <option value="hoje">Hoje</option>
                                <option value="semana">Última Semana</option>
                                <option value="mes">Últimos 30 Dias</option>
                                <option value="mes_atual">Este Mês</option>
                                <option value="personalizado">Personalizado</option>
                            </select>

                            <button
                                onClick={() => setMostrarFiltroAvancado(!mostrarFiltroAvancado)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md transition text-sm ${mostrarFiltroAvancado
                                    ? "bg-yellow-600 text-black"
                                    : "bg-neutral-700 text-white hover:bg-neutral-600"
                                    }`}
                            >
                                <FunnelIcon className="w-4 h-4" />
                                Filtros
                            </button>

                            <button
                                onClick={carregarAgendamentos}
                                className="bg-yellow-600 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition text-sm font-medium"
                            >
                                Atualizar
                            </button>
                        </div>
                    </div>

                    {/* Filtros Avançados */}
                    {mostrarFiltroAvancado && (
                        <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Data Início
                                    </label>
                                    <input
                                        type="date"
                                        value={dataInicio}
                                        onChange={(e) => setDataInicio(e.target.value)}
                                        className="w-full bg-neutral-700 border border-neutral-600 rounded-md px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Data Fim
                                    </label>
                                    <input
                                        type="date"
                                        value={dataFim}
                                        onChange={(e) => setDataFim(e.target.value)}
                                        className="w-full bg-neutral-700 border border-neutral-600 rounded-md px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-end gap-2"> {/* Adicionado gap-2 para espaçamento */}
                                    <button
                                        onClick={() => {
                                            setFiltroPeriodo("personalizado");
                                        }}
                                        className="bg-yellow-600 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition flex-1"
                                    >
                                        Aplicar Período
                                    </button>
                                    <button
                                        onClick={limparFiltros}
                                        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition whitespace-nowrap"
                                    >
                                        Limpar Filtros
                                    </button>
                                </div>
                            </div>

                            {dataInicio && dataFim && (
                                <div className="mt-3 text-sm text-gray-300">
                                    {/* <p>Período selecionado: {new Date(dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')} até {new Date(dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}</p> */}
                                    <p className="text-xs text-gray-400 text-align-center">Incluindo todo o dia final selecionado (até 23:59:59)</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Resto do código permanece igual... */}
                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total</p>
                                <p className="text-2xl font-bold">{total}</p>
                            </div>
                            <CalendarIcon className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>
                    <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Pendentes</p>
                                <p className="text-2xl font-bold">{pendentes}</p>
                            </div>
                            <ClockIcon className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>
                    <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Confirmados</p>
                                <p className="text-2xl font-bold">{confirmados}</p>
                            </div>
                            <CheckCircleIcon className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Concluídos</p>
                                <p className="text-2xl font-bold">{concluidos}</p>
                            </div>
                            <CheckCircleIcon className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Valor Total</p>
                                <p className="text-2xl font-bold">{valorTotal}</p>
                            </div>
                            <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                </div>

                {/* Lista de Agendamentos */}
                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-gray-400">Carregando agendamentos...</p>
                    </div>
                ) : agendamentosFiltrados.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-400">Nenhum agendamento encontrado.</p>
                    </div>
                ) : (
                    <div className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Contato
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Serviço
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Data/Hora
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Valor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-700">
                                    {agendamentosFiltrados.map((agendamento) => (
                                        <tr key={agendamento.id} className="hover:bg-neutral-750 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <p className="font-medium text-white">{agendamento.usuarioNome}</p>
                                                    <p className="text-sm text-gray-400">{agendamento.usuarioEmail}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <PhoneIcon className="w-4 h-4 text-yellow-500" />
                                                    <span className="text-sm">{formatarTelefone(agendamento.usuarioTelefone)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <ScissorsIcon className="w-4 h-4 text-yellow-500" />
                                                    <span>{agendamento.servico}</span>
                                                </div>
                                                <p className="text-sm text-gray-400">{agendamento.duracao}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-white">
                                                    {agendamento.dataHora.toLocaleDateString('pt-BR')}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {agendamento.dataHora.toLocaleTimeString('pt-BR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <CurrencyDollarIcon className="w-4 h-4 text-yellow-500" />
                                                    <span className="font-semibold">{agendamento.preco}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agendamento.status)}`}>
                                                    {getStatusText(agendamento.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    {agendamento.status === "pendente" && (
                                                        <>
                                                            <button
                                                                onClick={() => atualizarStatus(agendamento.id, "confirmado")}
                                                                className="text-green-500 hover:text-green-400 transition-colors"
                                                                title="Confirmar"
                                                            >
                                                                <CheckCircleIcon className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => atualizarStatus(agendamento.id, "cancelado")}
                                                                className="text-red-500 hover:text-red-400 transition-colors"
                                                                title="Cancelar"
                                                            >
                                                                <XCircleIcon className="w-5 h-5" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {agendamento.status === "confirmado" && (
                                                        <button
                                                            onClick={() => atualizarStatus(agendamento.id, "concluido")}
                                                            className="text-blue-500 hover:text-blue-400 transition-colors"
                                                            title="Marcar como Concluído"
                                                        >
                                                            <CheckCircleIcon className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => excluirAgendamento(agendamento.id)}
                                                        className="text-gray-400 hover:text-red-400 transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}