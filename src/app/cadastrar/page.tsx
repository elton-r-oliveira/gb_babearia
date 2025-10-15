"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function CadastrarPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !senha || !confirmarSenha) {
      alert("Preencha todos os campos!");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    if (senha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    try {
      setLoading(true);

      // Cria o usuário no Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Atualiza o nome de exibição
      await updateProfile(user, { displayName: nome });

      // Cria um documento no Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        nome,
        email,
        criadoEm: serverTimestamp(),
      });

      alert("Conta criada com sucesso!");
      router.push("/");
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      if (error.code === "auth/email-already-in-use") {
        alert("Este e-mail já está em uso. Tente fazer login.");
      } else if (error.code === "auth/invalid-email") {
        alert("E-mail inválido.");
      } else if (error.code === "auth/weak-password") {
        alert("Senha muito fraca. Use pelo menos 6 caracteres.");
      } else {
        alert("Erro ao cadastrar: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-8 max-w-md w-full shadow-xl">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            GB <span className="text-yellow-500">Barbershop</span>
          </h1>
          <p className="text-gray-300 mt-2">Crie sua conta para agendar horários</p>
        </div>

        <form onSubmit={handleCadastro} className="space-y-6">
          {/* Campo Nome */}
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

          {/* Campo Email */}
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

          {/* Campo Senha */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Senha
            </label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-3 rounded bg-neutral-700 text-white border border-neutral-600 focus:border-yellow-500 focus:outline-none transition-colors"
              required
              minLength={6}
            />
          </div>

          {/* Campo Confirmar Senha */}
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

          {/* Botão Cadastrar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-600 text-black py-3 rounded-md hover:bg-yellow-500 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Cadastrando..." : "Criar Conta"}
          </button>
        </form>

        {/* Link para login */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <p className="text-yellow-500">Já tem uma conta?</p>
            <button
              onClick={() => router.push("/login")}
              className="text-yellow-500 hover:text-yellow-400 text-sm transition-colors underline"
            >
              Faça login
            </button>
          </div>
        </div>

        {/* Informações de contato */}
        <div className="mt-8 pt-6 border-t border-neutral-700">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>(21) 4002-8922</span>
          </div>
          <p className="text-gray-400 text-xs text-center mt-2">
            Dúvidas? Entre em contato conosco
          </p>
        </div>
      </div>
    </main>
  );
}