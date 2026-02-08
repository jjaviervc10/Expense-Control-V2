import type { PropsWithChildren } from "react";

export default function SuccessMessage({ children }: PropsWithChildren) {
  return (
    <p className="bg-green-600 text-white font-bold text-sm text-center">
      {children}
    </p>
  );
}
