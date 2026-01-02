// src/components/Onboarding.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";

// importar estilos como módulos
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// avatar (asegúrate de que exista en public/avatar.png)
import avatar from "/avatar.png";

export default function Onboarding() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("onboardingCompleted", "true");
  }, []);

  const handleFinish = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 to-blue-500 text-white p-4">
      <Swiper
        modules={[Pagination, Navigation]}
        pagination={{ clickable: true }}
        navigation={true}
        spaceBetween={30}
      >
        {/* Slide 1 */}
        <SwiperSlide>
          <div className="flex flex-col items-center justify-center min-h-screen">
            <img
              src={avatar}
              alt="Guía simpática"
              className="w-32 h-32 rounded-full shadow-lg mb-6"
            />
            <h2 className="text-3xl font-bold mb-4">¡Hola!</h2>
            <p className="text-center max-w-md">
              Soy <strong>GastoBot 🤖</strong>, tu asistente para manejar tus
              gastos sin complicaciones.
            </p>
          </div>
        </SwiperSlide>

        {/* Slide 2 */}
        <SwiperSlide>
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-3xl font-bold mb-4">Organiza tus gastos</h2>
            <p className="text-center max-w-md">
              Añade tus gastos por categoría y periodo para tener claridad total
              de tu dinero.
            </p>
          </div>
        </SwiperSlide>

        {/* Slide 3 */}
        <SwiperSlide>
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-3xl font-bold mb-4">Recibe recordatorios</h2>
            <p className="text-center max-w-md">
              Mantente al día con tus finanzas activando notificaciones.
            </p>
          </div>
        </SwiperSlide>

        {/* Slide final */}
        <SwiperSlide>
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-3xl font-bold mb-4">¡Listo para comenzar!</h2>
            <p className="text-center max-w-md mb-6">
              Tu app está configurada y lista para usar.
            </p>
            <button
              onClick={handleFinish}
              className="bg-white text-blue-600 font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-blue-100 transition"
            >
              Empezar
            </button>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
