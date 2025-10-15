"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import ModalAgendamento from "./ModalAgendamento";
import ModalLogin from "./ModalLogin";
import ModalCadastro from "./ModalCadastro";
import { getIdToken } from "firebase/auth";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalAgendamentoOpen, setIsModalAgendamentoOpen] = useState(false);
  const [isModalLoginOpen, setIsModalLoginOpen] = useState(false);
  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false);
  const [isModalLogoutOpen, setIsModalLogoutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          const token = await user.getIdToken(); // ou getIdToken(user)
          const response = await fetch("/api/admin/check", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } catch (err) {
          console.error("Erro ao verificar admin:", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
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
    setIsMobileMenuOpen(false); // Fecha o menu mobile após clicar
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsModalLogoutOpen(false);
      setIsMobileMenuOpen(false); // Fecha o menu mobile após logout
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
    setIsMobileMenuOpen(false); // Fecha o menu mobile
  };

  const handleLoginSuccess = () => {
    setIsMobileMenuOpen(false); // Fecha o menu mobile após login
  };

  const handleCadastroSuccess = () => {
    setIsMobileMenuOpen(false); // Fecha o menu mobile após cadastro
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const openLogoutModal = () => {
    setIsModalLogoutOpen(true);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled
          ? "bg-black/90 backdrop-blur-md shadow-md"
          : "bg-transparent"
          }`}
      >
        <div className="flex justify-between items-center px-6 py-4 text-white w-full">
          {/* Logo - Canto Esquerdo */}
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              GB <span className="text-yellow-500">Barbershop</span>
            </h1>
          </div>

          {/* Menu Central - Desktop */}
          <div className="flex-1 flex justify-center">
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
          </div>

          {/* Login/Sair - Desktop */}
          <div className="flex-1 flex justify-end">
            <div className="hidden md:flex gap-4 items-center">
              {user ? (
                <>
                  {/* Link Admin - Só aparece para admins */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="text-sm text-gray-300 hover:text-yellow-500 transition-colors"
                    >
                      PAINEL DE ADMIN
                    </Link>
                  )}

                  <span className="text-sm text-gray-300">
                    Olá, {user.displayName || user.email}
                  </span>

                  <button
                    onClick={openLogoutModal}
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

            {/* Botão Hambúrguer - Mobile */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden bg-yellow-600 text-black p-2 rounded-md hover:bg-yellow-500 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-neutral-800">
            <div className="px-6 py-4 space-y-4">
              {/* Links do Menu */}
              <div className="space-y-3">
                <Link
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setIsMobileMenuOpen(false);
                  }}
                  className="block py-2 text-white hover:text-yellow-500 transition-colors border-b border-neutral-800"
                >
                  Início
                </Link>
                <Link
                  href="#sobre"
                  onClick={(e) => handleSmoothScroll(e, "sobre")}
                  className="block py-2 text-white hover:text-yellow-500 transition-colors border-b border-neutral-800"
                >
                  Sobre
                </Link>
                <Link
                  href="#servicos"
                  onClick={(e) => handleSmoothScroll(e, "servicos")}
                  className="block py-2 text-white hover:text-yellow-500 transition-colors border-b border-neutral-800"
                >
                  Serviços
                </Link>
                <Link
                  href="#contato"
                  onClick={(e) => handleSmoothScroll(e, "contato")}
                  className="block py-2 text-white hover:text-yellow-500 transition-colors border-b border-neutral-800"
                >
                  Contato
                </Link>

                {/* Link Admin no Mobile - Só aparece para admins */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-yellow-500 hover:text-yellow-400 transition-colors border-b border-neutral-800"
                  >
                    Painel Admin
                  </Link>
                )}
              </div>

              {/* Área de Login/Logout Mobile */}
              <div className="pt-4 border-t border-neutral-700">
                {user ? (
                  <div className="space-y-3">
                    <p className="text-gray-300 text-sm">
                      Logado como: <span className="text-yellow-500">{user.displayName || user.email}</span>
                    </p>
                    <button
                      onClick={openAgendamentoModal}
                      className="w-full bg-yellow-600 text-black py-2 rounded-md hover:bg-yellow-500 transition font-medium"
                    >
                      Agendar Horário
                    </button>
                    <button
                      onClick={openLogoutModal}
                      className="w-full bg-neutral-700 text-white py-2 rounded-md hover:bg-neutral-600 transition font-medium"
                    >
                      Sair
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setIsModalLoginOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-yellow-600 text-black py-2 rounded-md hover:bg-yellow-500 transition font-medium"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setIsModalCadastroOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-neutral-700 text-white py-2 rounded-md hover:bg-neutral-600 transition font-medium"
                    >
                      Cadastrar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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

      {/* Modal de Confirmação de Logout */}
      {isModalLogoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsModalLogoutOpen(false)}
          />

          <div className="relative bg-neutral-800 border border-neutral-700 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">
                Confirmar Logout
              </h3>

              <p className="text-gray-300 mb-6">
                Tem certeza que deseja sair da sua conta?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalLogoutOpen(false)}
                  className="flex-1 bg-neutral-700 text-white py-2 rounded-md hover:bg-neutral-600 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-yellow-600 text-black py-2 rounded-md hover:bg-yellow-500 transition font-medium"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}