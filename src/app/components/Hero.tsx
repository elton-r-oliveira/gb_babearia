"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import ModalAgendamento from "./ModalAgendamento";
import ModalLogin from "./ModalLogin";
import ModalCadastro from "./ModalCadastro";

export default function Hero() {
  const [isModalAgendamentoOpen, setIsModalAgendamentoOpen] = useState(false);
  const [isModalLoginOpen, setIsModalLoginOpen] = useState(false);
  const [isModalCadastroOpen, setIsModalCadastroOpen] = useState(false); 
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // verificaçãousuário logado
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const openAgendamentoModal = () => {
    if (!user) {
      setIsModalLoginOpen(true);
    } else {
      setIsModalAgendamentoOpen(true);
    }
  };

  const closeAgendamentoModal = () => setIsModalAgendamentoOpen(false);
  const closeLoginModal = () => setIsModalLoginOpen(false);
  const closeCadastroModal = () => setIsModalCadastroOpen(false);

  const handleLoginSuccess = () => {
    setIsModalLoginOpen(false);

    // Se o usuário estava tentando agendar antes de fazer login
    if (!user) {
      setIsModalAgendamentoOpen(false);
    }
  };

  const handleCadastroSuccess = () => {
    setIsModalCadastroOpen(false);
    setIsModalAgendamentoOpen(true); // caso deseje abrir o agendamento direto após fazer o login
  };

  const switchToCadastro = () => {
    setIsModalLoginOpen(false);
    setIsModalCadastroOpen(true);
  };

  const switchToLogin = () => {
    setIsModalCadastroOpen(false);
    setIsModalLoginOpen(true);
  };

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

  return (
    <>
      <section
        id="inicio"
        className="relative h-screen flex flex-col justify-center items-center text-center text-white bg-cover bg-center"
        style={{ backgroundImage: "url('/images/background1.png')" }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 px-4">
          <img
            src="/images/logo.png"
            alt="Logo GB Barbershop"
            className="w-86 mx-auto mb-6"
          />
          <p className="text-lg md:text-xl mb-8">
            Estilo, tradição e excelência em cada corte
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={openAgendamentoModal}
              className="bg-yellow-500 text-black px-6 py-2 rounded-md hover:bg-yellow-600 transition"
            >
              Agendar Horário
            </button>
            <a
              href="#servicos"
              onClick={(e) => handleSmoothScroll(e, "servicos")}
              className="bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition"
            >
              Nossos Serviços
            </a>
          </div>
        </div>
      </section>

      <ModalAgendamento
        isOpen={isModalAgendamentoOpen}
        onClose={closeAgendamentoModal}
      />

      <ModalLogin
        isOpen={isModalLoginOpen}
        onClose={closeLoginModal}
        onSwitchToCadastro={switchToCadastro}
        onLoginSuccess={handleLoginSuccess}
      />

      <ModalCadastro
        isOpen={isModalCadastroOpen}
        onClose={closeCadastroModal}
        onSwitchToLogin={switchToLogin}
        onCadastroSuccess={handleCadastroSuccess}
      />
    </>
  );
}