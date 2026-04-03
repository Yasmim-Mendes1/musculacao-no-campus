import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Flame, Trophy, Star, ChevronRight, Settings, TrendingUp, Calendar, Target, Award, Gem, Zap, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { getProfile, getTodayWorkout, getLogs, getLevelName } from "../lib/store";
import logo from "@/assets/logo.png";

//define a página de dashboard
const DashboardPage = () => {
  const navigate = useNavigate(); //função para mudar de rota
  const profile = getProfile(); //pega os dados do usuário
  const todayWorkout = getTodayWorkout(); //pega o treino do dia
  const logs = getLogs(); //pega os histórico de treino

  //se não tiver usuário logado, não renderiza nada
  if (!profile) return null;

  //NÍVEL E XP
  const xpForNextLevel = profile.currentLevel * 200;
  const xpProgress = (profile.xp % 200) / 200; //progresso dentro do nível atual
  const levelName = getLevelName(profile.currentLevel); //nome do nível atual

  //PROGRESSO SEMANAL
  const today = new Date(); //data atual
  const startOfWeek = new Date(today); //calcula o início da semana (domingo)
  startOfWeek.setDate(today.getDate() - today.getDay());
  const weekLogs = logs.filter((l) => new Date(l.date) >= startOfWeek); //filtra apenas os treinos dessa semana
  const daysTrainedThisWeek = new Set(weekLogs.map((l) => l.date)).size; //quantos dias diferentes treinou essa semana

  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"]; //nomes dos dias da semana
  const trainedDays = weekLogs.map((l) => new Date(l.date).getDay()); //dias da semana que treinou (0-6)

  //CONQUISTAS
  const badges = [
    { id: "first_workout", icon: Target, label: "Primeiro Treino" },
    { id: "10_workouts", icon: Award, label: "10 Treinos" },
    { id: "50_workouts", icon: Trophy, label: "50 Treinos" },
    { id: "7_streak", icon: Flame, label: "7 Dias Seguidos" },
    { id: "30_streak", icon: Gem, label: "30 Dias Seguidos" },
  ];

  //FRASE MOTIVACIONAL
  const motivationalPhrases = [
    "Hoje é dia de superar limites!",
    "Cada repetição te deixa mais forte!",
    "Consistência é o segredo do sucesso!",
    "Bora treinar, campeão!",
  ];
  //escolhe uma frase aleatória
  const phrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="gradient-primary px-4 pt-6 pb-12 rounded-b-[2rem]"> {/* header verde */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-10 h-10" /> {/* logo */}
            <div>
              <p className="text-primary-foreground/80 text-sm">Olá,</p>
              <p className="text-primary-foreground font-bold text-lg">{profile.name}!</p> {/* nome do usuário */}
            </div>
          </div>
          <button onClick={() => navigate("/settings")} className="p-2 rounded-xl bg-primary-foreground/20"> {/* botão de configurações */}
            <Settings className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* card de nível */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => navigate("/levels")}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-primary-foreground font-bold">Nível {profile.currentLevel} — {levelName}</span>
            <span className="text-primary-foreground/80 text-sm">{profile.xp} XP</span>
          </div>
          {/* barra de progresso */}
          <div className="h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary-foreground rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress * 100}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          {/* quanto falta pro próximo nível */}
          <p className="text-primary-foreground/60 text-xs mt-1">{200 - (profile.xp % 200)} XP para o próximo nível</p>
        </motion.div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {/* stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Flame, value: `${profile.streak}`, label: "Sequência", color: "gradient-streak", link: "/streak" },
            { icon: Trophy, value: `${profile.completedWorkouts}`, label: "Treinos", color: "gradient-primary", link: "/workouts" },
            { icon: Star, value: `${profile.badges.length}`, label: "Conquistas", color: "gradient-xp", link: "/badges" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              onClick={() => navigate(stat.link)}
              className="glass-card rounded-2xl p-3 text-center cursor-pointer active:scale-95 transition-transform"
            >
              <div className={`w-10 h-10 ${stat.color} rounded-xl mx-auto mb-2 flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* frase motivational */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-4 text-center flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">{phrase}</p>
        </motion.div>

        {/* treino do dia */}
        {todayWorkout && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={() => navigate("/workout")}
              className="w-full h-16 rounded-2xl text-lg font-bold animate-pulse-glow relative overflow-hidden"
            >
              <Dumbbell className="w-6 h-6 mr-3" />
              Treino do Dia
              <ChevronRight className="w-5 h-5 ml-auto" />
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-2">{todayWorkout.name}</p>
          </motion.div>
        )}

        {/* progresso da semana */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Semana
            </h3>
            <span className="text-sm text-muted-foreground">{daysTrainedThisWeek}/{profile.daysPerWeek} dias</span>
          </div>
          <div className="flex justify-between">
            {weekDays.map((d, i) => { //dias da semana
              const trained = trainedDays.includes(i); //treinou nesse dia?
              const isToday = i === today.getDay(); //é o dia atual?
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{d}</span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      trained 
                        ? "gradient-primary text-primary-foreground" //se treinou, mostra círculo colorido
                        : isToday //se é hoje mas não treinou, mostra círculo com borda
                        ? "border-2 border-primary text-primary" //se é hoje mas não treinou, mostra círculo com borda
                        : "bg-muted text-muted-foreground" //se não treinou e não é hoje, mostra círculo cinza
                    }`}
                  >
                    {trained ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* conquistas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card rounded-2xl p-4"
        >
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent" />
            Conquistas
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {badges.map((badge) => {
              const earned = profile.badges.includes(badge.id); //verifica se o usuário desbloqueou a conquista
              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center min-w-[60px] ${earned ? "" : "opacity-30 grayscale"}`} //se não desbloqueada, fica transparente e cinza
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 ${earned ? "gradient-primary" : "bg-muted"}`}>
                    <badge.icon className={`w-5 h-5 ${earned ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">{badge.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* progresso */}
        <Button
          variant="outline"
          onClick={() => navigate("/progress")} //botão para página de progresso detalhado
          className="w-full rounded-2xl h-12"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          Ver Progresso Detalhado
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;