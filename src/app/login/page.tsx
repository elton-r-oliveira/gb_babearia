"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, senha);
      router.push("/");
    } catch (error: any) {
      console.error("Erro de login:", error);
      alert("Erro ao fazer login: " + error.message);
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
          <p className="text-gray-300 mt-2">Faça login para agendar seu horário</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
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
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-3 rounded bg-neutral-700 text-white border border-neutral-600 focus:border-yellow-500 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Botão Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-600 text-black py-3 rounded-md hover:bg-yellow-500 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* Link para recuperar senha */}
        <div className="mt-6 text-center">
          <button
            onClick={() => alert("Entre em contato conosco para recuperar sua senha!")}
            className="text-yellow-500 hover:text-yellow-400 text-sm transition-colors"
          >
            Esqueceu sua senha?
          </button>
        </div>

        {/* Link para cadastro */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <p className="text-yellow-500">Não tem conta?</p>
            <button
              onClick={() => router.push("/cadastrar")}
              className="text-yellow-500 hover:text-yellow-400 text-sm transition-colors underline"
            >
              Crie uma conta
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
            Problemas para acessar? Entre em contato
          </p>
        </div>
      </div>
    </main>
  );
}