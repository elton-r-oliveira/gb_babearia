// components/ModalAgendamento.tsx
"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

interface ModalAgendamentoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalAgendamento({ isOpen, onClose }: ModalAgendamentoProps) {
  const [servico, setServico] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Verifica se usuário está logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleAgendar = async () => {
    if (!user) {
      alert("Você precisa estar logado para agendar!");
      return;
    }

    if (!servico || !dataHora) {
      alert("Preencha todos os campos!");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "agendamentos"), {
        usuarioId: user.uid,
        usuarioEmail: user.email,
        servico,
        dataHora,
        status: "pendente",
        criadoEm: serverTimestamp(),
      });
      alert("Agendamento criado com sucesso!");
      setServico("");
      setDataHora("");
      onClose(); // Fecha o modal após agendamento
    } catch (error: any) {
      console.error("Erro detalhado:", error);
      alert("Erro ao agendar: " + error.message);
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
      document.body.style.overflow = "hidden"; // Previne scroll do body
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay escuro */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-neutral-800 rounded-lg max-w-md w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-700">
          <h2 className="text-xl font-bold text-white">Agendar Serviço</h2>
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
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Serviço</label>
                <select
                  value={servico}
                  onChange={(e) => setServico(e.target.value)}
                  className="w-full p-3 rounded bg-neutral-700 text-white border border-neutral-600 focus:border-yellow-500 focus:outline-none transition-colors"
                >
                  <option value="">Selecione um serviço</option>
                  <option value="Corte de Cabelo">Corte de Cabelo - R$ 40</option>
                  <option value="Barba">Barba - R$ 35</option>
                  <option value="Corte + Barba">Corte + Barba - R$ 65</option>
                  <option value="Pintura de Cabelo">Pintura de Cabelo - R$ 80</option>
                  <option value="Tratamento Capilar">Tratamento Capilar - R$ 50</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Data e Hora</label>
                <input
                  type="datetime-local"
                  value={dataHora}
                  onChange={(e) => setDataHora(e.target.value)}
                  className="w-full p-3 rounded bg-neutral-700 text-white border border-neutral-600 focus:border-yellow-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                onClick={handleAgendar}
                disabled={loading || !servico || !dataHora}
                className="bg-yellow-600 text-black px-6 py-3 rounded-md hover:bg-yellow-500 transition w-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {loading ? "Agendando..." : "Confirmar Agendamento"}
              </button>

              <p className="text-gray-400 text-sm text-center">
                Logado como: {user?.displayName}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}