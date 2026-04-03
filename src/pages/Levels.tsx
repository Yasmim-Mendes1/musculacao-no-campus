import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Lock, CheckCircle, Sparkles, Crown, Shield, Sword, GraduationCap } from "lucide-react";
import { getProfile } from "../lib/store";

//define os níveis, XP necessário, ícones e descrições
const levels = [
  { level: 1, name: "Calouro", xpNeeded: 0, icon: GraduationCap, description: "Todo mundo começa por aqui" },
  { level: 2, name: "Calouro", xpNeeded: 200, icon: GraduationCap, description: "Ainda aprendendo os caminhos" },
  { level: 3, name: "Dedicado", xpNeeded: 400, icon: Star, description: "A consistência começou a aparecer" },
  { level: 4, name: "Dedicado", xpNeeded: 600, icon: Star, description: "Treinar já virou rotina" },
  { level: 5, name: "Dedicado", xpNeeded: 800, icon: Star, description: "Ninguém te para mais" },
  { level: 6, name: "Veterano", xpNeeded: 1000, icon: Shield, description: "Experiência de quem já treina há tempos" },
  { level: 7, name: "Veterano", xpNeeded: 1200, icon: Shield, description: "Os novatos pedem seus conselhos" },
  { level: 8, name: "Veterano", xpNeeded: 1400, icon: Shield, description: "Respeitado na academia" },
  { level: 9, name: "Veterano", xpNeeded: 1600, icon: Shield, description: "Poucos chegam até aqui" },
  { level: 10, name: "Veterano", xpNeeded: 1800, icon: Shield, description: "Referência no campus" },
  { level: 11, name: "Monstro", xpNeeded: 2000, icon: Sword, description: "Sua dedicação é assustadora" },
  { level: 15, name: "Monstro", xpNeeded: 2800, icon: Sword, description: "Nível de comprometimento insano" },
  { level: 20, name: "Monstro", xpNeeded: 3800, icon: Sword, description: "Lenda viva da academia" },
  { level: 21, name: "Lenda do Campus", xpNeeded: 4000, icon: Crown, description: "O nível máximo — você é inspiração" },
];

//define a página de níveis
const LevelsPage = () => {
  const navigate = useNavigate(); //função para mudar de rota
  const profile = getProfile(); //pega os dados do usuário, incluindo nível atual e XP total
  if (!profile) return null; //se não tiver perfil, não renderiza nada

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="gradient-primary px-4 pt-6 pb-8 rounded-b-[2rem]"> {/* header verde */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate("/")} className="p-2 rounded-xl bg-primary-foreground/20"> {/* voltar pra dashboard */}
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-primary-foreground font-bold text-xl">Níveis</h1>
        </div>
        <div className="ml-12 mt-2">
          <p className="text-primary-foreground/70 text-sm">Seu nível atual</p>
          {/* acha o nome do nível atual */}
          <p className="text-primary-foreground font-bold text-2xl">Nível {profile.currentLevel} — {levels.find(l => l.level === profile.currentLevel)?.name || "Calouro"}</p>
          <p className="text-primary-foreground/70 text-sm mt-1">{profile.xp} XP total</p>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {levels.map((lvl, i) => { {/* percorre todos os níveis */}
          const isCurrent = lvl.level === profile.currentLevel; {/* é o nível atual? */}
          const isUnlocked = profile.currentLevel >= lvl.level; {/* já desbloqueou este nível? */}
          const Icon = lvl.icon; {/* ícone do nível */}

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              className={`glass-card rounded-2xl p-4 flex items-center gap-4 ${
                //se é o nível atual, destaca com borda e animação; se não é desbloqueado, fica transparente e cinza; se desbloqueado mas não atual, fica normal
                isCurrent ? "ring-2 ring-primary" : !isUnlocked ? "opacity-50 grayscale" : ""
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                //se é o nível atual, tem fundo animado; se desbloqueado mas não atual, tem fundo normal; se não desbloqueado, tem fundo cinza
                isCurrent ? "gradient-primary animate-pulse" : isUnlocked ? "gradient-primary" : "bg-muted"
              }`}>
                {isUnlocked ? (
                    //se desbloqueado, mostra o ícone colorido; se não desbloqueado, mostra um cadeado cinza
                  <Icon className="w-6 h-6 text-primary-foreground" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-bold ${isCurrent ? "text-primary" : isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                    Nível {lvl.level} — {lvl.name}
                  </p>
                  {/* brilhozinho no nível atual */}
                  {isCurrent && <Sparkles className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground">{lvl.description}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{lvl.xpNeeded} XP necessários</p>
              </div>
              {isUnlocked && !isCurrent && (
                //se desbloqueado mas não é o atual, mostra um check de desbloqueado
                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LevelsPage;