export interface UserProfile {
  name: string;
  email: string;
  goal: "hipertrofia" | "forca" | "resistencia" | "emagrecimento";
  level: string;
  daysPerWeek: number;
  trainingDays: string[];
  xp: number;
  currentLevel: number;
  streak: number;
  bestStreak: number;
  badges: string[];
  completedWorkouts: number;
  joinedAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  muscleGroup: string;
  weight?: number;
  completedSets: number;
}

export interface WorkoutDay {
  id: string;
  name: string;
  label: string;
  exercises: Exercise[];
}

export interface WorkoutLog {
  date: string;
  workoutId: string;
  exercises: { exerciseId: string; weights: number[]; completed: boolean }[];
  xpEarned: number;
}

const KEYS = {
  profile: "mnc_profile",
  workouts: "mnc_workouts",
  logs: "mnc_logs",
  lastWorkoutDate: "mnc_last_workout",
  onboarded: "mnc_onboarded",
};

export function getProfile(): UserProfile | null {
  const d = localStorage.getItem(KEYS.profile);
  return d ? JSON.parse(d) : null;
}

export function saveProfile(p: UserProfile) {
  localStorage.setItem(KEYS.profile, JSON.stringify(p));
}

export function isOnboarded(): boolean {
  return localStorage.getItem(KEYS.onboarded) === "true";
}

export function setOnboarded() {
  localStorage.setItem(KEYS.onboarded, "true");
}

export function getWorkouts(): WorkoutDay[] {
  const d = localStorage.getItem(KEYS.workouts);
  return d ? JSON.parse(d) : [];
}

export function saveWorkouts(w: WorkoutDay[]) {
  localStorage.setItem(KEYS.workouts, JSON.stringify(w));
}

export function getLogs(): WorkoutLog[] {
  const d = localStorage.getItem(KEYS.logs);
  return d ? JSON.parse(d) : [];
}

export function saveLogs(l: WorkoutLog[]) {
  localStorage.setItem(KEYS.logs, JSON.stringify(l));
}

export function addXP(amount: number) {
  const p = getProfile();
  if (!p) return;
  p.xp += amount;
  const newLevel = Math.floor(p.xp / 200) + 1;
  p.currentLevel = newLevel;
  saveProfile(p);
}

export function completeWorkout(
  workoutId: string,
  exercises: WorkoutLog["exercises"],
  duration?: number //em minutos, opcional
) {
  const p = getProfile();
  if (!p) return;

  const logs = getLogs();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]!;

  const badgesBefore = [...p.badges];

  //comeback: verifica ANTES de atualizar streak —
  if (logs.length > 0) {
    const lastLog = logs[logs.length - 1]!;
    const lastDate = new Date(lastLog.date);
    const diffDays = Math.floor((Date.now() - lastDate.getTime()) / 86400000);
    if (diffDays >= 7 && !p.badges.includes("comeback")) {
      p.badges.push("comeback");
    }
  }

  //XP e nível
  p.completedWorkouts += 1;
  const xp = 50 + exercises.filter((e) => e.completed).length * 10;
  p.xp += xp;
  p.currentLevel = Math.floor(p.xp / 200) + 1;

  //streak
  const last = localStorage.getItem(KEYS.lastWorkoutDate);
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]!;
  if (last !== todayStr) {
    p.streak = last === yesterday ? p.streak + 1 : 1;
    if (p.streak > p.bestStreak) p.bestStreak = p.streak;
    localStorage.setItem(KEYS.lastWorkoutDate, todayStr);
  }

  //progresso semanal
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const weekLogs = logs.filter((l) => new Date(l.date) >= startOfWeek);
  const weekDays = new Set(weekLogs.map((l) => new Date(l.date).getDay()));
  const daysTrainedThisWeek = new Set(weekLogs.map((l) => l.date)).size + 1;

  const grant = (id: string) => {
    if (!p.badges.includes(id)) p.badges.push(id);
  };

  //conquistas de treinos
  grant("first_workout");
  if (p.completedWorkouts >= 10)  grant("10_workouts");
  if (p.completedWorkouts >= 50)  grant("50_workouts");
  if (p.completedWorkouts >= 100) grant("100_workouts");
  if (p.completedWorkouts >= 200) grant("200_workouts");

  //conquistas de sequência
  if (p.streak >= 5)  grant("no_rest_day");
  if (p.streak >= 7)  grant("7_streak");
  if (p.streak >= 14) grant("14_streak");
  if (p.streak >= 30) grant("30_streak");
  if (p.streak >= 60) grant("60_streak");

  //conquistas de nível
  if (p.currentLevel >= 5)  grant("level_5");
  if (p.currentLevel >= 10) grant("level_10");

  //semana perfeita
  if (daysTrainedThisWeek >= p.daysPerWeek) grant("perfect_week");

  //fim de semana
  if (weekDays.has(0) && weekDays.has(6)) grant("weekend_beast");

  //hora do dia
  const hour = today.getHours();
  if (hour < 7)  grant("early_bird");
  if (hour >= 22) grant("night_owl");

  //dia da semana
  if (today.getDay() === 1) grant("monday_warrior");

  //baseadas no treino em si
  const allSetsCompleted = exercises.every((e) => e.completed);
  if (allSetsCompleted) grant("all_sets");

  const hasHeavyLift = exercises.some((e) => e.weights.some((w) => w >= 100));
  if (hasHeavyLift) grant("heavy_lifter");

  const allWeightsLogged = exercises.every((e) => e.weights.every((w) => w > 0));
  if (allWeightsLogged) grant("perfectionist");

  //tempo do treino
  if (duration !== undefined && duration < 30) grant("speed_run");

  //dias desde o cadastro
  const diffFromJoin = Math.floor((Date.now() - new Date(p.joinedAt).getTime()) / 86400000);
  if (diffFromJoin >= 30) grant("social");

  saveProfile(p);

  logs.push({ date: todayStr, workoutId, exercises, xpEarned: xp });
  saveLogs(logs);

  const newBadges = p.badges.filter((b) => !badgesBefore.includes(b));

  saveProfile(p);
  logs.push({ date: todayStr, workoutId, exercises, xpEarned: xp });
  saveLogs(logs);

  return { xp, newBadges };
}

export function getTodayWorkout(): WorkoutDay | null {
  const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const today = days[new Date().getDay()];
  const workouts = getWorkouts();
  return workouts.find((w) => w.label === today) || workouts[0] || null;
}

export function getLevelName(level: number): string {
  if (level <= 2) return "Calouro";
  if (level <= 5) return "Dedicado";
  if (level <= 10) return "Veterano";
  if (level <= 20) return "Monstro";
  return "Lenda do Campus";
}

export interface BadgeMeta {
  id: string;
  label: string;
  description: string;
}

export const ALL_BADGES: BadgeMeta[] = [
  { id: "first_workout",  label: "Primeiro Passo",          description: "Complete seu primeiro treino na plataforma" },
  { id: "10_workouts",    label: "10 Treinos",               description: "Acumule 10 treinos completos no total" },
  { id: "50_workouts",    label: "50 Treinos",               description: "Alcance a marca de 50 treinos concluídos" },
  { id: "100_workouts",   label: "Centenário",               description: "Atinja a lendária marca de 100 treinos" },
  { id: "200_workouts",   label: "Máquina Humana",           description: "200 treinos? Você é uma força da natureza" },
  { id: "7_streak",       label: "Semana de Fogo",           description: "Treine por 7 dias consecutivos sem falhar" },
  { id: "14_streak",      label: "Quinzena Bruta",           description: "Duas semanas sem parar — dedicação pura" },
  { id: "30_streak",      label: "Mês Invicto",              description: "Mantenha uma sequência incrível de 30 dias" },
  { id: "60_streak",      label: "Inabalável",               description: "60 dias seguidos. Você assustaria o Rocky" },
  { id: "no_rest_day",    label: "Descansou? Nunca Ouvi Falar", description: "Treinou 5 dias seguidos sem folga" },
  { id: "monday_warrior", label: "Guerreiro da Segunda",     description: "Treinou numa segunda-feira — sobreviveu ao pior dia da semana" },
  { id: "early_bird",     label: "Madrugador Insano",        description: "Completou um treino antes das 7h da manhã" },
  { id: "night_owl",      label: "Coruja Fitness",           description: "Treinou depois das 22h — quem precisa dormir?" },
  { id: "weekend_beast",  label: "Fim de Semana? Que Isso",  description: "Treinou no sábado E no domingo na mesma semana" },
  { id: "comeback",       label: "O Retorno",                description: "Voltou a treinar após 7 dias de ausência" },
  { id: "speed_run",      label: "Flash Gordon",             description: "Completou um treino em menos de 30 minutos" },
  { id: "all_sets",       label: "Sem Moleza",               description: "Completou 100% das séries de um treino" },
  { id: "heavy_lifter",   label: "Levantador Pesado",        description: "Registrou mais de 100kg num exercício" },
  { id: "perfectionist",  label: "Perfeccionista",           description: "Registrou o peso em todas as séries de um treino" },
  { id: "social",         label: "Inspiração",               description: "Usou o app por 30 dias desde o cadastro" },
  { id: "level_5",        label: "Nível 5",                  description: "Chegou ao nível 5 — agora ficou sério" },
  { id: "level_10",       label: "Nível 10",                 description: "Nível 10 desbloqueado. Lenda em formação" },
  { id: "perfect_week",   label: "Semana Perfeita",          description: "Treinou todos os dias planejados na semana" },
];

export function generateWorkouts(goal: string, days: string[]): WorkoutDay[] {
  const exerciseDB: Record<string, Exercise[]> = {
    "Peito e Tríceps": [
      { id: "1", name: "Supino Reto", sets: 4, reps: "8-12", muscleGroup: "Peito", completedSets: 0 },
      { id: "2", name: "Supino Inclinado", sets: 3, reps: "10-12", muscleGroup: "Peito", completedSets: 0 },
      { id: "3", name: "Crucifixo", sets: 3, reps: "12-15", muscleGroup: "Peito", completedSets: 0 },
      { id: "4", name: "Tríceps Corda", sets: 3, reps: "12-15", muscleGroup: "Tríceps", completedSets: 0 },
      { id: "5", name: "Tríceps Francês", sets: 3, reps: "10-12", muscleGroup: "Tríceps", completedSets: 0 },
    ],
    "Costas e Bíceps": [
      { id: "6", name: "Puxada Frontal", sets: 4, reps: "8-12", muscleGroup: "Costas", completedSets: 0 },
      { id: "7", name: "Remada Curvada", sets: 3, reps: "10-12", muscleGroup: "Costas", completedSets: 0 },
      { id: "8", name: "Remada Unilateral", sets: 3, reps: "10-12", muscleGroup: "Costas", completedSets: 0 },
      { id: "9", name: "Rosca Direta", sets: 3, reps: "10-12", muscleGroup: "Bíceps", completedSets: 0 },
      { id: "10", name: "Rosca Martelo", sets: 3, reps: "12-15", muscleGroup: "Bíceps", completedSets: 0 },
    ],
    Pernas: [
      { id: "11", name: "Agachamento Livre", sets: 4, reps: "8-12", muscleGroup: "Quadríceps", completedSets: 0 },
      { id: "12", name: "Leg Press", sets: 4, reps: "10-12", muscleGroup: "Quadríceps", completedSets: 0 },
      { id: "13", name: "Cadeira Extensora", sets: 3, reps: "12-15", muscleGroup: "Quadríceps", completedSets: 0 },
      { id: "14", name: "Mesa Flexora", sets: 3, reps: "12-15", muscleGroup: "Posterior", completedSets: 0 },
      { id: "15", name: "Panturrilha", sets: 4, reps: "15-20", muscleGroup: "Panturrilha", completedSets: 0 },
    ],
    "Ombros e Abdômen": [
      { id: "16", name: "Desenvolvimento", sets: 4, reps: "8-12", muscleGroup: "Ombros", completedSets: 0 },
      { id: "17", name: "Elevação Lateral", sets: 3, reps: "12-15", muscleGroup: "Ombros", completedSets: 0 },
      { id: "18", name: "Elevação Frontal", sets: 3, reps: "12-15", muscleGroup: "Ombros", completedSets: 0 },
      { id: "19", name: "Abdominal Crunch", sets: 3, reps: "15-20", muscleGroup: "Abdômen", completedSets: 0 },
      { id: "20", name: "Prancha", sets: 3, reps: "30-60s", muscleGroup: "Abdômen", completedSets: 0 },
    ],
    "Full Body": [
      { id: "21", name: "Agachamento", sets: 3, reps: "10-12", muscleGroup: "Pernas", completedSets: 0 },
      { id: "22", name: "Supino", sets: 3, reps: "10-12", muscleGroup: "Peito", completedSets: 0 },
      { id: "23", name: "Remada", sets: 3, reps: "10-12", muscleGroup: "Costas", completedSets: 0 },
      { id: "24", name: "Desenvolvimento", sets: 3, reps: "10-12", muscleGroup: "Ombros", completedSets: 0 },
      { id: "25", name: "Rosca Direta", sets: 3, reps: "12-15", muscleGroup: "Bíceps", completedSets: 0 },
    ],
  };

  const splits: Record<number, string[]> = {
    2: ["Full Body", "Full Body"],
    3: ["Peito e Tríceps", "Costas e Bíceps", "Pernas"],
    4: ["Peito e Tríceps", "Costas e Bíceps", "Pernas", "Ombros e Abdômen"],
    5: ["Peito e Tríceps", "Costas e Bíceps", "Pernas", "Ombros e Abdômen", "Full Body"],
    6: ["Peito e Tríceps", "Costas e Bíceps", "Pernas", "Ombros e Abdômen", "Peito e Tríceps", "Costas e Bíceps"],
  };

  const split = splits[days.length] ?? splits[3]!;
  return days.map((day, i) => {
    const splitName = split[i] ?? "Full Body";
    const exercises = exerciseDB[splitName] ?? [];

    return {
      id: `w${i}`,
      name: `Treino ${String.fromCharCode(65 + i)} - ${splitName}`,
      label: day,
      exercises: exercises.map((e: Exercise) => ({
        ...e,
        id: `${e.id}_${i}`,
      })),
    };
  });
}

export function clearAllData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}