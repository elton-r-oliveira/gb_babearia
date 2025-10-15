"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import ModalAgendamento from "./ModalAgendamento";
import ModalLogin from "./ModalLogin";
import ModalCadastro from "./ModalCadastro";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalAgendamentoOpen, setIsModalAgendamentoOpen] = useState(false);
  const [isModalLoginOpen, setIsModalLoginOpen] = useState(false);
  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    // Verifica se usuário está logado
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      unsubscribe();
    };
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const openAgendamentoModal = () => {
    if (!user) {
      setIsModalLoginOpen(true);
    } else {
      setIsModalAgendamentoOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    // Login bem sucedido - pode adicionar lógica adicional aqui
  };

  const handleCadastroSuccess = () => {
    // Cadastro bem sucedido - pode adicionar lógica adicional aqui
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled
          ? "bg-black/90 backdrop-blur-md shadow-md"
          : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4 text-white">
          <h1 className="text-xl font-bold">
            GB <span className="text-yellow-500">Barbershop</span>
          </h1>

          <ul className="hidden md:flex gap-8 text-sm font-medium">
            <li>
              <Link
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="hover:text-yellow-500 transition-colors"
              >
                Início
              </Link>
            </li>
            <li>
              <Link
                href="#sobre"
                onClick={(e) => handleSmoothScroll(e, "sobre")}
                className="hover:text-yellow-500 transition-colors"
              >
                Sobre
              </Link>
            </li>
            <li>
              <Link
                href="#servicos"
                onClick={(e) => handleSmoothScroll(e, "servicos")}
                className="hover:text-yellow-500 transition-colors"
              >
                Serviços
              </Link>
            </li>
            <li>
              <Link
                href="#contato"
                onClick={(e) => handleSmoothScroll(e, "contato")}
                className="hover:text-yellow-500 transition-colors"
              >
                Contato
              </Link>
            </li>
          </ul>

          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <span className="text-sm text-gray-300 hidden md:block">
                  Olá, {user.displayName || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-yellow-600 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition text-sm font-medium"
                >
                  Sair
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsModalLoginOpen(true)}
                className="bg-yellow-600 text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition text-sm font-medium"
              >
                Login
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* Modais */}
      <ModalAgendamento
        isOpen={isModalAgendamentoOpen}
        onClose={() => setIsModalAgendamentoOpen(false)}
      />

      <ModalLogin
        isOpen={isModalLoginOpen}
        onClose={() => setIsModalLoginOpen(false)}
        onSwitchToCadastro={() => {
          setIsModalLoginOpen(false);
          setIsModalCadastroOpen(true);
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      <ModalCadastro
        isOpen={isModalCadastroOpen}
        onClose={() => setIsModalCadastroOpen(false)}
        onSwitchToLogin={() => {
          setIsModalCadastroOpen(false);
          setIsModalLoginOpen(true);
        }}
        onCadastroSuccess={handleCadastroSuccess}
      />
    </>
  );
}