"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface ModalCadastroProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onCadastroSuccess: () => void;
}

const limparNumero = (valor: string) => valor.replace(/\D/g, '');

export default function ModalCadastro({ isOpen, onClose, onSwitchToLogin, onCadastroSuccess }: ModalCadastroProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const formatarTelefone = (valor: string) => {
    const apenasNumeros = limparNumero(valor);

    if (apenasNumeros.length <= 10) {
      return apenasNumeros
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      return apenasNumeros
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1");
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarTelefone(e.target.value);
    setTelefone(valorFormatado);
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !telefone || !senha || !confirmarSenha) {
      alert("Preencha todos os campos!");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    if (senha.length < 8) {
      alert("A senha deve ter pelo menos 8 caracteres!");
      return;
    }

    const apenasNumerosTelefone = limparNumero(telefone);
    if (apenasNumerosTelefone.length < 10) {
      alert("Por favor, insira um telefone válido!");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await updateProfile(user, { displayName: nome });

      await setDoc(doc(db, "usuarios", user.uid), {
        nome,
        email,
        telefone: apenasNumerosTelefone,
        telefoneFormatado: telefone,
        criadoEm: serverTimestamp(),
      });

      alert("Conta criada com sucesso!");
      onCadastroSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      if (error.code === "auth/email-already-in-use") {
        alert("Este e-mail já está em uso. Tente fazer login.");
      } else {
        alert("Erro ao cadastrar: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-neutral-800 border border-neutral-700 rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            Cadastro
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleCadastro} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Nome Completo
            </label>
            <input
              type="text"
              placeholder="Seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-3 rounded bg-neutral-700 text-white border border-neutral-600 focus:border-yellow-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              E-mail
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-neutral-700 text-white border border-neutral-600 focus:border-yellow-500 focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Telefone
            </label>
            <input
              type="tel"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={handleTelefoneChange}
              className="w-full p-3 rounded bg-neutral-700 text-white border border-neutral-600 focus:border-yellow-500 focus:outline-none transition-colors"
              required
              maxLength={15}
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Senha
            </label>
            <input
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-3 rounded bg-neutral-700 text-white border border-neutral-600 focus:border-yellow-500 focus:outline-none transition-colors"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Confirmar Senha
            </label>
            <input
              type="password"
              placeholder="Digite a senha novamente"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className={`w-full p-3 rounded bg-neutral-700 text-white border transition-colors focus:outline-none ${confirmarSenha && senha !== confirmarSenha
                ? "border-red-500 focus:border-red-500"
                : "border-neutral-600 focus:border-yellow-500"
                }`}
              required
            />
            {confirmarSenha && senha !== confirmarSenha && (
              <p className="text-red-400 text-xs mt-1">As senhas não coincidem</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-600 text-black py-3 rounded-md hover:bg-yellow-500 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Cadastrando..." : "Criar Conta"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onSwitchToLogin}
            className="text-yellow-500 hover:text-yellow-400 text-sm transition-colors cursor-pointer"
          >
            Já tem uma conta? Faça login
          </button>
        </div>
      </div>
    </div>
  );
}