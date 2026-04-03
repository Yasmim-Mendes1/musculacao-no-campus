import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Timer, ChevronDown, ChevronUp, Trophy, PartyPopper, Moon, Star } from "lucide-react";
import { Button } from "../components/ui/button.js";
import { Input } from "../components/ui/input";
import { getTodayWorkout, completeWorkout, type Exercise } from "../lib/store";
import { ALL_BADGES } from "../lib/store";
import { BADGE_ICONS } from "../lib/badgeIcons";

const WorkoutPage = () => {
  const navigate = useNavigate(); //hook para navegação programática entre páginas
  const workout = getTodayWorkout(); //pega o treino do dia atual com base no perfil do usuário e na data atual, retorna null se for dia de descanso
  const [exercises, setExercises] = useState<(Exercise & { weights: number[] })[]>([]); //estado para armazenar os exercícios do treino atual, cada exercício tem um array de pesos para cada série, e a quantidade de séries completadas
  const [expandedIdx, setExpandedIdx] = useState(0); //estado para controlar qual exercício está expandido para mostrar os detalhes (pesos, completar série, etc.)
  const [restTimer, setRestTimer] = useState(0); //estado para controlar o timer de descanso entre as séries, em segundos
  const [isResting, setIsResting] = useState(false); //estado para indicar se o usuário está no período de descanso entre as séries, usado para mostrar ou esconder o overlay de descanso
  const [completed, setCompleted] = useState(false); //estado para indicar se o treino foi completado, usado para mostrar a tela de conclusão do treino
  const [xpEarned, setXpEarned] = useState(0); //estado para armazenar o XP ganho ao completar o treino, mostrado na tela de conclusão do treino

  useEffect(() => { 
    if (workout) { //quando o componente é montado, se tiver um treino para hoje, inicializa o estado de exercícios com os exercícios do treino, adicionando os pesos (inicialmente zero) e a quantidade de séries completadas (inicialmente zero)
      setExercises(workout.exercises.map((e) => ({ ...e, weights: Array(e.sets ?? 0).fill(0), completedSets: 0 })) as (Exercise & { weights: number[] })[]);
    }
  }, []);

  const [startTime] = useState(() => Date.now());

  const startRest = useCallback(() => { //função para iniciar o período de descanso entre as séries, define o timer para 90 segundos e ativa o estado de descanso
    setRestTimer(90);
    setIsResting(true);
  }, []);

  useEffect(() => {
    if (!isResting || restTimer <= 0) { //se não estiver descansando ou se o timer chegou a zero, desativa o estado de descanso e para o timer
      if (restTimer <= 0) setIsResting(false);
      return;
    }
    const t = setTimeout(() => setRestTimer((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [isResting, restTimer]);

  const completeSeries = (exIdx: number) => {
    setExercises((prev) => { 
      const updated = [...prev]; //cria uma cópia do estado de exercícios para modificar
      const ex = { ...updated[exIdx] }; //pega o exercício que teve uma série completada e cria uma cópia para modificar
      ex.completedSets += 1; //incrementa a quantidade de séries completadas para esse exercício
      updated[exIdx] = ex; //atualiza o exercício modificado no array de exercícios
      if ((ex.completedSets ?? 0) >= (ex.sets ?? 0)  && exIdx < updated.length - 1) {
        setTimeout(() => setExpandedIdx(exIdx + 1), 500); //se completou todas as séries do exercício e não é o último exercício, expande o próximo exercício após meio segundo
      }
      return updated;
    });
    startRest();
  };

  const setWeight = (exIdx: number, setIdx: number, weight: number) => {
    setExercises((prev) => {
      const updated = [...prev]; //cria uma cópia do estado de exercícios para modificar
      const ex = { ...updated[exIdx], weights: [...updated[exIdx].weights] }; //pega o exercício que teve o peso de uma série modificado e cria uma cópia para modificar, incluindo uma cópia do array de pesos
      ex.weights[setIdx] = weight; //atualiza o peso da série específica com o valor fornecido
      updated[exIdx] = ex; //atualiza o exercício modificado no array de exercícios
      return updated;
    });
  };

  //verifica se todos os exercícios tiveram todas as séries completadas
  const allDone = exercises.length > 0 && exercises.every((e) => e.completedSets >= e.sets);

  //função chamada quando o usuário clica no botão de finalizar treino
  const [newBadges, setNewBadges] = useState<string[]>([]);

  const BADGE_META = Object.fromEntries(ALL_BADGES.map((b) => [b.id, b]));

  const finishWorkout = () => {
    if (!workout) return;
    const duration = Math.floor((Date.now() - startTime) / 60000);
    const logExercises = exercises.map((e) => ({
      exerciseId: e.id,
      weights: e.weights,
      completed: e.completedSets >= e.sets,
    }));
    const result = completeWorkout(workout.id, logExercises, duration);
    setXpEarned(result?.xp || 0);
    setNewBadges(result?.newBadges || []);
    setCompleted(true);
  };

  if (!workout) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Moon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Dia de Descanso</h2>
        <p className="text-muted-foreground mt-2">Seu corpo precisa recuperar!</p>
        <Button onClick={() => navigate("/")} className="mt-6 rounded-xl">Voltar</Button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
            <PartyPopper className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-display text-foreground mb-2">Treino Completo!</h2>
          <div className="gradient-xp text-xp-foreground rounded-2xl px-6 py-3 inline-block mb-4">
            <p className="text-sm">XP Ganho</p>
            <p className="text-3xl font-bold">+{xpEarned}</p>
          </div>
          <div className="flex flex-col items-center gap-3 w-full max-w-xs mx-auto">
            {/* conquistas desbloqueadas */}
            {newBadges.length > 0 && (
              <div className="w-full">
                <p className="text-xs text-muted-foreground text-center mb-2 font-semibold uppercase tracking-wide">
                  Conquistas desbloqueadas!
                </p>
                <div className="flex flex-col gap-2">
                  {newBadges.map((id, i) => {
                    const meta = BADGE_META[id];
                    if (!meta) return null;
                    const Icon = BADGE_ICONS[id] ?? Star;
                    return (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.15 }}
                        className="flex items-center gap-3 bg-accent/20 border border-accent/30 rounded-2xl px-4 py-3"
                      >
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-foreground">{meta.label}</p>
                          <p className="text-xs text-muted-foreground">Nova conquista!</p>
                        </div>
                        <Star className="w-4 h-4 text-accent ml-auto shrink-0" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* destaque de todos os exercícios */}
            {exercises.filter((e) => e.completedSets >= e.sets).length === exercises.length && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}>
                <div className="flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-2 rounded-xl">
                  <Trophy className="w-5 h-5" />
                  <span className="font-bold text-sm">Todos os exercícios!</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
        <Button onClick={() => navigate("/")} className="mt-8 rounded-xl px-8">
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="gradient-primary px-4 pt-6 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate("/")} className="p-2 rounded-xl bg-primary-foreground/20">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-primary-foreground font-bold text-lg">{workout.name}</h1>
            <p className="text-primary-foreground/70 text-sm">{workout.label}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {exercises.map((ex, i) => (
            <div key={i} className="flex-1 h-2 rounded-full bg-primary-foreground/20 overflow-hidden"> {/* barra de progresso para cada exercício, mostrando o progresso com base nas séries completadas */}
              <div
                className="h-full bg-primary-foreground rounded-full transition-all"
                style={{ width: `${(ex.completedSets / ex.sets) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isResting && ( //se estiver no período de descanso, mostra um overlay fixo no topo com o timer regressivo e um botão para pular o descanso
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-0 z-10 mx-4 mt-4"
          >
            <div className="glass-card rounded-2xl p-4 flex items-center justify-between border-2 border-primary/30">
              <div className="flex items-center gap-3">
                <Timer className="w-5 h-5 text-primary animate-float" />
                <div>
                  <p className="text-sm font-bold text-foreground">Descansando...</p>
                  <p className="text-xs text-muted-foreground">Próxima série em breve</p>
                </div>
              </div>
              <div className="flex flex-col items-center sm:flex-row sm:items-center gap-1 sm:gap-3">
                <div className="text-2xl font-bold text-primary font-display">
                  {Math.floor(restTimer / 60)}:{String(restTimer % 60).padStart(2, "0")}
                </div>
                <Button size="sm" variant="outline" onClick={() => setIsResting(false)} className="rounded-xl">
                  Pular
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 mt-4 space-y-3">
        {exercises.map((ex, exIdx) => {
          const isExpanded = expandedIdx === exIdx; //verifica se o exercício atual é o que está expandido para mostrar os detalhes
          const isDone = ex.completedSets >= ex.sets; //verifica se o exercício foi completado (todas as séries feitas) para mostrar o estado de conclusão do exercício (barra de progresso completa, ícone de check, etc.)
          return (
            <motion.div
              key={ex.id}
              layout
              className={`glass-card rounded-2xl overflow-hidden transition-all ${isDone ? "opacity-60" : ""}`}
            >
              <button
                onClick={() => setExpandedIdx(isExpanded ? -1 : exIdx)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDone ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground" //se o exercício foi completado, destaca com gradiente e cor de texto clara; se não, mostra com fundo e texto mais apagados
                  }`}>
                    {isDone ? <Check className="w-4 h-4" /> : exIdx + 1}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-foreground text-sm">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ex.muscleGroup} · {ex.sets}x{ex.reps} · {ex.completedSets}/{ex.sets} séries
                    </p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              <AnimatePresence>
                {isExpanded && !isDone && ( //se o exercício está expandido e não foi completado, mostra os detalhes para registrar os pesos e completar as séries
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      {Array.from({ length: ex.sets }).map((_, setIdx) => {
                        const isCompleted = setIdx < ex.completedSets; //verifica se a série atual já foi completada para mostrar o estado de conclusão da série (campo de peso desabilitado, ícone de check, etc.)
                        const isCurrent = setIdx === ex.completedSets; //verifica se a série atual é a próxima série a ser completada para mostrar o estado de série atual (campo de peso habilitado, botão de completar série, etc.)
                        return (
                          <div
                            key={setIdx}
                            className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                              isCompleted
                                ? "bg-secondary"
                                : isCurrent
                                ? "bg-muted border-2 border-primary/30"
                                : "bg-muted/50"
                            }`}
                          >
                            <span className="text-sm font-bold text-muted-foreground w-16 pt-2">
                              Série {setIdx + 1}
                            </span>
                            <div className="flex flex-col gap-0.5 flex-1">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  placeholder="Peso (kg)"
                                  value={ex.weights[setIdx] || ""}
                                  onChange={(e) => setWeight(exIdx, setIdx, Number(e.target.value))}
                                  className="rounded-xl h-9 text-center w-[105px]"
                                  disabled={isCompleted}
                                />
                                {isCurrent && (
                                  <Button size="sm" onClick={() => completeSeries(exIdx)} className="rounded-xl">
                                    <Check className="w-4 h-4" />
                                  </Button>
                                )}
                                {isCompleted && <Check className="w-5 h-5 text-primary" />}
                              </div>
                              <span className="text-xs text-muted-foreground">{ex.reps} reps</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {allDone && ( //se todos os exercícios foram completados, mostra um botão para concluir o treino, que chama a função finishWorkout para registrar a conclusão do treino, calcular o XP ganho e mostrar a tela de conclusão do treino
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button onClick={finishWorkout} className="w-full h-14 rounded-2xl text-lg font-bold">
              Concluir Treino
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WorkoutPage;