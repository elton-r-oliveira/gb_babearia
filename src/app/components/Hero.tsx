"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import ModalAgendamento from "./ModalAgendamento";
import ModalLogin from "./ModalLogin";

export default function Hero() {
  const [isModalAgendamentoOpen, setIsModalAgendamentoOpen] = useState(false);
  const [isModalLoginOpen, setIsModalLoginOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verifica se usuário está logado
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

  const handleLoginSuccess = () => {
    // Após login bem sucedido, fecha o modal de login
    setIsModalLoginOpen(false);
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
          {/* <p className="mt-10 text-sm text-yellow-500 flex items-center justify-center gap-2 cursor-pointer">
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
            (21) 4002-8922
          </p> */}
        </div>
      </section>

      {/* Modais */}
      <ModalAgendamento
        isOpen={isModalAgendamentoOpen}
        onClose={closeAgendamentoModal}
      />

      <ModalLogin
        isOpen={isModalLoginOpen}
        onClose={closeLoginModal}
        onSwitchToCadastro={() => {
          // Aqui você pode adicionar lógica para abrir modal de cadastro se quiser
          console.log("Abrir cadastro do Hero");
        }}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}