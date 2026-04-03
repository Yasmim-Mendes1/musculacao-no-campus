import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, Target, Calendar, LogOut, Trash2, TrendingUp, Dumbbell, HeartPulse, Flame, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { getProfile, saveProfile, saveWorkouts, generateWorkouts, clearAllData } from "../lib/store";

//array dedias da semana
const allDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
//array de metas
const goals = [
  { value: "hipertrofia", label: "Hipertrofia", icon: TrendingUp },
  { value: "forca", label: "Força", icon: Dumbbell },
  { value: "resistencia", label: "Resistência", icon: HeartPulse },
  { value: "emagrecimento", label: "Emagrecimento", icon: Flame },
];

const SettingsPage = () => {
  const navigate = useNavigate(); //hook para navegar entre páginas
  const profile = getProfile(); //pega os dados do perfil do usuário
  const [goal, setGoal] = useState<string>(profile?.goal || "hipertrofia"); //estado para armazenar a meta escolhida, inicia com a meta atual do perfil ou "hipertrofia" como padrão
  const [selectedDays, setSelectedDays] = useState<string[]>(profile?.trainingDays || []); //estado para armazenar os dias de treino escolhidos, inicia com os dias atuais do perfil ou vazio como padrão
  const [saved, setSaved] = useState(false); //estado para controlar se as configurações foram salvas, usado para mostrar feedback visual

  if (!profile) return null; //se não tiver perfil, não renderiza nada (poderia redirecionar para o onboarding, mas nesse caso só retorna null)

  const toggleDay = (day: string) => { //função para selecionar ou deselecionar um dia de treino
    setSelectedDays((prev) => //se o dia já estiver selecionado, remove ele; se não estiver selecionado, adiciona ele
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => { //função chamada quando o usuário clica no botão de salvar
    profile.goal = goal as typeof profile.goal; //atualiza a meta do perfil com a escolha atual
    profile.trainingDays = selectedDays; //atualiza os dias de treino do perfil com a escolha atual
    profile.daysPerWeek = selectedDays.length; //atualiza a quantidade de dias por semana do perfil com base na quantidade de dias selecionados
    saveProfile(profile); //salva o perfil atualizado no armazenamento local
    const workouts = generateWorkouts(goal, selectedDays); //gera um novo plano de treino com base na meta e nos dias escolhidos
    saveWorkouts(workouts); //salva os treinos gerados no armazenamento local, sobrescrevendo os treinos anteriores
    setSaved(true); //atualiza o estado para mostrar que as configurações foram salvas
    setTimeout(() => setSaved(false), 2000); //após 2 segundos, volta o estado para false para esconder o feedback visual de "Salvo!"
  };

  const handleLogout = () => { //função chamada quando o usuário clica no botão de sair da conta
    clearAllData(); //limpa todos os dados do armazenamento local, efetivamente "deslogando" o usuário
    window.location.href = "/"; //redireciona para a página inicial
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="gradient-primary px-4 pt-6 pb-8 rounded-b-[2rem]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 rounded-xl bg-primary-foreground/20">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-primary-foreground font-bold text-lg">Configurações</h1>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* objetivo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4"
        >
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Objetivo
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {goals.map((g) => ( //percorre as metas para mostrar os botões de escolha
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                className={`p-3 rounded-xl text-sm font-semibold transition-all ${
                  goal === g.value
                    ? "bg-secondary border-2 border-primary text-secondary-foreground"
                    : "bg-muted text-muted-foreground border-2 border-transparent"
                }`}
              >
                <g.icon className="w-4 h-4 mr-1 inline-block" />
                {g.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* dias da semana */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-4"
        >
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Dias de Treino
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {allDays.map((day) => ( //percorre os dias da semana para mostrar os botões de escolha
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`p-3 rounded-xl text-sm font-semibold transition-all ${
                  selectedDays.includes(day)
                    ? "bg-secondary border-2 border-primary text-secondary-foreground"
                    : "bg-muted text-muted-foreground border-2 border-transparent"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </motion.div>

        <Button
          onClick={handleSave}
          disabled={selectedDays.length < 2}
          className="w-full rounded-xl h-12 font-bold"
        >
          {saved ? <><Check className="w-4 h-4 mr-2" /> Salvo!</> : <><RefreshCw className="w-4 h-4 mr-2" /> Salvar e Regenerar Treino</>}
        </Button>

        <div className="pt-4 border-t border-border space-y-3">
          {/* sair da conta */}
          <Button variant="outline" onClick={handleLogout} className="w-full rounded-xl text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
          {/* apagar todos os dados */}
          <Button
            variant="ghost"
            onClick={() => { clearAllData(); window.location.href = "/"; }}
            className="w-full rounded-xl text-destructive/60"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Apagar Todos os Dados
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;