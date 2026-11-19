"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { Campo } from "@/componentes/formulario";

// Schema do formulário de login. Separado do schema do servidor porque aqui
// só precisamos garantir que os campos não estão vazios.
const esquemaLogin = z.object({
  login: z.string().trim().min(1, "Informe o login."),
  senha: z.string().min(1, "Informe a senha."),
});

type DadosLogin = z.infer<typeof esquemaLogin>;

export default function PaginaEntrar() {
  const router = useRouter();
  const parametros = useSearchParams();
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  // Para onde voltar depois do login. O proxy manda ?destino=/compras
  const destino = parametros.get("destino") ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DadosLogin>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: { login: "", senha: "" },
  });

  async function aoEnviar(dados: DadosLogin) {
    setErroGeral(null);

    const resultado = await signIn("credentials", {
      login: dados.login,
      senha: dados.senha,
      redirect: false,
    });

    // signIn devolve erro em vez de lançar exceção
    if (resultado?.error) {
      setErroGeral("Login ou senha inválidos.");
      return;
    }

    router.push(destino);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(aoEnviar)}
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <Campo
        rotulo="Login"
        autoComplete="username"
        autoFocus
        erro={errors.login?.message}
        {...register("login")}
      />

      <Campo
        rotulo="Senha"
        type="password"
        autoComplete="current-password"
        erro={errors.senha?.message}
        {...register("senha")}
      />

      {erroGeral && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {erroGeral}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Não tem conta?{" "}
        <a
          href="/cadastro"
          className="font-medium text-slate-900 underline underline-offset-2 dark:text-slate-100"
        >
          Criar conta
        </a>
      </p>
    </form>
  );
}
