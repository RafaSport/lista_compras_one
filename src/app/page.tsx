import { redirect } from "next/navigation";

// A raiz sempre leva ao login. A tela inicial fica em /inicio.
export default function Raiz() {
  redirect("/login");
}
