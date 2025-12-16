import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useBudget } from "../hooks/useBudget";
import { useState } from "react";

export default function ConfirmResetModal({ open, onClose, onConfirm }: any) {
  const [loading, setLoading] = useState(false);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                <Dialog.Title className="text-xl font-bold text-center">
                  ⚠️ Advertencia
                </Dialog.Title>
                <div className="mt-4">
                  <p>
                    Al resetear la app se eliminarán los registros y la
                    información de tus gastos para este periodo. Se recomienda
                    descargar tu PDF antes de dar click en el boton de aceptar.
                  </p>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setLoading(true);
                      onConfirm();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    {loading ? "Procesando..." : "Aceptar"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
