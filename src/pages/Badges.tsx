import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getProfile, ALL_BADGES } from "../lib/store";
import { BADGE_ICONS } from "../lib/badgeIcons";
import { ArrowLeft, Star } from "lucide-react";

//define a página de conquistas
const BadgesPage = () => {
  const navigate = useNavigate(); //função para mudar de rota
  const profile = getProfile(); //pega os dados do usuário
  if (!profile) return null; //se não tiver perfil, não renderiza nada

  const earned = profile.badges; //lista de conquistas que o usuário já desbloqueou

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="gradient-xp px-4 pt-6 pb-8 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-2"> 
          <button onClick={() => navigate("/")} className="p-2 rounded-xl bg-primary-foreground/20">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-primary-foreground font-bold text-xl">Conquistas</h1>
        </div>
        <p className="text-primary-foreground/70 text-sm ml-12">
          {earned.length} de {ALL_BADGES.length} desbloqueadas
        </p>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {ALL_BADGES.map((badge, i) => { //percorre todas as conquistas possíveis
          const isEarned = earned.includes(badge.id); //verifica se o usuário tem
          const Icon = BADGE_ICONS[badge.id] ?? Star; //guarda o ícone da conquista
          return (
            <motion.div //animação de fade-in e slide-up
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              //se nao desbloqueada, fica transparente e cinza
              className={`glass-card rounded-2xl p-4 flex items-center gap-4 ${!isEarned ? "opacity-50 grayscale" : ""}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isEarned ? "gradient-primary" : "bg-muted"}`}>
                <Icon className={`w-6 h-6 ${isEarned ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold ${isEarned ? "text-foreground" : "text-muted-foreground"}`}>{badge.label}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
              {isEarned && ( //se desbloqueada, mostra uma estrela de destaque
                <div className="w-8 h-8 rounded-full gradient-xp flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgesPage;