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
  XCircleIcon
} from "@heroicons/react/24/outline";

// Lista de emails autorizados como admin (configure com seu email)
const ADMIN_EMAILS = ["elton@gmail.com", "admin@gbbarbershop.com"];

interface Agendamento {
  id: string;
  usuarioId: string;
  usuarioEmail: string;
  usuarioNome: string;
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
      
      // Atualiza a lista local
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

  const agendamentosFiltrados = agendamentos.filter(ag => 
    filtroStatus === "todos" || ag.status === filtroStatus
  );

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-gray-300">Gerencie os agendamentos da barbearia</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold">{agendamentos.length}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pendentes</p>
                <p className="text-2xl font-bold">
                  {agendamentos.filter(a => a.status === "pendente").length}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Confirmados</p>
                <p className="text-2xl font-bold">
                  {agendamentos.filter(a => a.status === "confirmado").length}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Concluídos</p>
                <p className="text-2xl font-bold">
                  {agendamentos.filter(a => a.status === "concluido").length}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-neutral-800 border border-neutral-700 rounded-md px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
          >
            <option value="todos">Todos os Status</option>
            <option value="pendente">Pendentes</option>
            <option value="confirmado">Confirmados</option>
            <option value="concluido">Concluídos</option>
            <option value="cancelado">Cancelados</option>
          </select>
          
          <button
            onClick={carregarAgendamentos}
            className="bg-yellow-600 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition"
          >
            Atualizar
          </button>
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