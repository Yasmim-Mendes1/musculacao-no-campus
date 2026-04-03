import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";
import { Dumbbell, Target, Calendar, Zap, TrendingUp, HeartPulse, Flame, Sprout, Bolt, ArrowRight } from "lucide-react";

//define os parâmetros que o componente recebe
interface Props {
  onComplete: (data: { goal: string; level: string; daysPerWeek: number; trainingDays: string[] }) => void;
}

//array com as etapas do onboarding
const steps = [
  {
    title: "Qual seu objetivo?",
    subtitle: "Vamos personalizar seu treino",
    key: "goal",
    icon: Target,
    options: [
      { value: "hipertrofia", label: "Hipertrofia", icon: TrendingUp, desc: "Ganhar massa muscular" },
      { value: "forca", label: "Força", icon: Dumbbell, desc: "Ficar mais forte" },
      { value: "resistencia", label: "Resistência", icon: HeartPulse, desc: "Melhorar condicionamento" },
      { value: "emagrecimento", label: "Emagrecimento", icon: Flame, desc: "Perder gordura" },
    ],
  },
  {
    title: "Seu nível de experiência?",
    subtitle: "Sem julgamentos, somos todos campeões",
    key: "level",
    icon: Dumbbell,
    options: [
      { value: "iniciante", label: "Iniciante", icon: Sprout, desc: "Menos de 6 meses" },
      { value: "intermediario", label: "Intermediário", icon: Bolt, desc: "6 meses a 2 anos" },
      { value: "avancado", label: "Avançado", icon: Flame, desc: "Mais de 2 anos" },
    ],
  },
  {
    title: "Quantos dias por semana?",
    subtitle: "Escolha os dias que vai treinar",
    key: "days",
    icon: Calendar,
    options: [],
  },
];

//dias da semana
const allDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const OnboardingPage = ({ onComplete }: Props) => {
  const [step, setStep] = useState(0); //estado para controlar a etapa atual do onboarding
  const [goal, setGoal] = useState(""); //estado para armazenar o objetivo escolhido pelo usuário
  const [level, setLevel] = useState(""); //estado para armazenar o nível de experiência escolhido pelo usuário
  const [selectedDays, setSelectedDays] = useState<string[]>([]); //estado para armazenar os dias de treino escolhidos pelo usuário

  const toggleDay = (day: string) => { //função para selecionar ou deselecionar um dia de treino
    setSelectedDays((prev) => //se o dia já estiver selecionado, remove ele; se não estiver selecionado, adiciona ele
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleNext = () => { //função chamada quando o usuário clica no botão de próximo
    if (step < 2) { //se não for a última etapa, avança para a próxima
      setStep(step + 1);
    } else { //se for a última etapa, chama a função onComplete passando os dados coletados
      onComplete({
        goal,
        level,
        daysPerWeek: selectedDays.length,
        trainingDays: selectedDays,
      });
    }
  };

  const canProceed = () => {
    if (step === 0) return !!goal;
    if (step === 1) return !!level;
    return selectedDays.length >= 2;
  };

  const currentStep = steps[step]; //pega os dados da etapa atual (título, subtítulo, opções, etc)
  const Icon = currentStep.icon; //pega o ícone da etapa atual

  return (
    <div className="min-h-screen flex flex-col bg-background p-4">
      {/* progress */}
      <div className="flex gap-2 mb-8 mt-4 max-w-md mx-auto w-full">
        {steps.map((_, i) => ( //percorre as etapas para mostrar a barra de progresso
          <div key={i} className="flex-1 h-2 rounded-full overflow-hidden bg-muted">
            <motion.div
              className="h-full gradient-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: i <= step ? "100%" : "0%" }}
              transition={{ duration: 0.4 }}
            />
          </div>
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
                <Icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-display">{currentStep.title}</h2> {/* título da etapa atual */}
              <p className="text-muted-foreground mt-1">{currentStep.subtitle}</p>
            </div>

            {step < 2 ? ( //se não for a última etapa, mostra as opções de objetivo e nível; se for a última etapa, mostra os dias da semana para escolher)
              <div className="grid gap-3">
                {currentStep.options.map((opt) => {
                  const selected = step === 0 ? goal === opt.value : level === opt.value;
                  return (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => step === 0 ? setGoal(opt.value) : setLevel(opt.value)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        selected 
                          ? "border-primary bg-secondary shadow-md" //se selecionado, destaca com borda e sombra
                          : "border-border bg-card hover:border-primary/30" //se não selecionado, tem borda normal e efeito hover
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <opt.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{opt.label}</p>
                        <p className="text-sm text-muted-foreground">{opt.desc}</p>
                      </div>
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto w-6 h-6 rounded-full gradient-primary flex items-center justify-center"
                        >
                          <Zap className="w-3 h-3 text-primary-foreground" /> 
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {allDays.map((day) => { {/* percorre os dias da semana */}
                  const selected = selectedDays.includes(day); //verifica se o dia está selecionado
                  return (
                    <motion.button
                      key={day}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleDay(day)}
                      className={`p-4 rounded-2xl border-2 font-semibold transition-all ${
                        selected
                          ? "border-primary bg-secondary text-secondary-foreground" //se selecionado, destaca com borda e muda cor
                          : "border-border bg-card text-muted-foreground hover:border-primary/30" //se não selecionado, tem borda normal e efeito hover
                      }`}
                    >
                      {day}
                    </motion.button>
                  );
                })}
              </div>
            )}

            <Button
              onClick={handleNext}
              disabled={!canProceed()} //desabilita o botão se o usuário não fez uma escolha válida
              className="w-full mt-8 h-12 rounded-xl text-base font-bold"
            >
              {step < 2 ? <>Próximo <ArrowRight className="w-4 h-4 ml-1" /></> : <>Gerar Meu Treino</>}
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingPage;