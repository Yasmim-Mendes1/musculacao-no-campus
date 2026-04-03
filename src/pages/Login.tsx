import { useState } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

//define parâmtros que o componente recebe
interface Props {
  onLogin: (name: string, email: string, isSignup: boolean) => string | null;
}

//recebe a função onLogin como prop
const LoginPage = ({ onLogin }: Props) => {
  const [isSignup, setIsSignup] = useState(false); //estado para controlar se está no modo de login ou cadastro
  const [name, setName] = useState(""); //estado para armazenar o nome do usuário (usado apenas no cadastro)
  const [email, setEmail] = useState(""); //estado para armazenar o email do usuário
  const [password, setPassword] = useState(""); //estado para armazenar a senha do usuário (não é realmente usado para autenticação, apenas para simular um formulário completo)
  const [error, setError] = useState(""); //estado para armazenar mensagens de erro (como "Usuário não encontrado" ou "Senha incorreta")

  //função chamada quando o formulário é enviado
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const err = onLogin(name || "Atleta", email, isSignup);
    if (err) setError(err);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <img
            src={logo}
            alt="Musculação no Campus"
            className="w-32 h-32 mb-4 rounded-2xl"
          />
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex rounded-xl bg-muted p-1 mb-6">
            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                !isSignup ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground" //se não está no modo de cadastro, destaca o botão de login; se está no modo de cadastro, deixa ele sem destaque
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsSignup(true)} //quando clica, ativa o modo de cadastro
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                isSignup ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/*  chama handleSubmit */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && ( //se estiver no modo de cadastro, mostra o campo de nome
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}>
                <Label htmlFor="name" className="text-sm font-semibold">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)} //atualiza o estado do nome quando o usuário digita
                  placeholder="Seu nome"
                  className="mt-1 rounded-xl"
                />
              </motion.div>
            )}
            <div>
              <Label htmlFor="email" className="text-sm font-semibold">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} //atualiza o estado do email quando o usuário digita
                placeholder="seu@email.com"
                className="mt-1 rounded-xl"
                required //campo obrigatório
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-semibold">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} //atualiza o estado da senha quando o usuário digita
                placeholder="••••••••"
                className="mt-1 rounded-xl"
                required //campo obrigatório
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center font-medium">{error}</p>
            )}
            {/* envia o formulário */}
            <Button type="submit" className="w-full rounded-xl h-12 text-base font-bold gap-2">
              {isSignup ? <>Criar Conta</> : <>Entrar</>} 
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;