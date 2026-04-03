import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Calendar } from "lucide-react";
import { getProfile, getLogs } from "../lib/store";

const StreakPage = () => {
  const navigate = useNavigate(); //hook para navegação programática entre páginas
  const profile = getProfile(); //pega os dados do perfil do usuário, que incluem informações como streak atual, melhor streak, etc.
  const logs = getLogs(); //pega o histórico de treinos do usuário, que é uma lista de objetos com data, exercícios feitos, XP ganho, etc.
  if (!profile) return null; //se não tiver perfil, não renderiza nada (poderia redirecionar para o onboarding, mas nesse caso só retorna null)

  //cria um conjunto com as datas em que o usuário treinou
  const trainedDates = new Set(logs.map((l) => l.date));

  //gera os dados dos últimos 3 meses para exibir o calendário de treinos
  const today = new Date();
  const months: { label: string; year: number; month: number; days: { date: string; day: number; trained: boolean; isToday: boolean }[] }[] = [];

  //para cada um dos últimos 3 meses, calcula os dias do mês, quais dias o usuário treinou e se é o dia atual
  for (let m = 0; m <= 2; m++) {
    const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: typeof months[0]["days"] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const isToday = dateStr === today.toISOString().split("T")[0];
      days.push({ date: dateStr, day: i, trained: trainedDates.has(dateStr), isToday });
    }

    months.push({ label: monthNames[month], year, month, days });
  }

  const weekHeaders = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="gradient-streak px-4 pt-6 pb-8 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate("/")} className="p-2 rounded-xl bg-primary-foreground/20">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-primary-foreground font-bold text-xl">Histórico de Treinos</h1>
        </div>
        <div className="flex items-center gap-6 ml-12 mt-2">
          <div className="text-center">
            <p className="text-primary-foreground font-bold text-2xl">{profile.streak}</p>
            <p className="text-primary-foreground/70 text-xs">Streak atual</p>
          </div>
          <div className="text-center">
            <p className="text-primary-foreground font-bold text-2xl">{profile.bestStreak}</p>
            <p className="text-primary-foreground/70 text-xs">Melhor streak</p>
          </div>
          <div className="text-center">
            <p className="text-primary-foreground font-bold text-2xl">{trainedDates.size}</p>
            <p className="text-primary-foreground/70 text-xs">Dias treinados</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map((m, mi) => { //percorre os meses para mostrar o calendário de treinos de cada mês
          const firstDayOfWeek = new Date(m.year, m.month, 1).getDay();
          return (
            <motion.div
              key={mi}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * mi }}
              className="glass-card rounded-2xl p-4"
            >
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {m.label} {m.year}
              </h3>
              <div className="grid grid-cols-7 gap-1">
                {weekHeaders.map((h, i) => ( //exibe os cabeçalhos dos dias da semana
                  <div key={i} className="text-center text-[10px] text-muted-foreground font-semibold pb-1">{h}</div>
                ))}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {m.days.map((day) => ( //exibe cada dia do mês, destacando os dias em que o usuário treinou e o dia atual
                  <div
                        key={day.date}
                        className={`w-full aspect-square sm:aspect-auto sm:h-8 rounded-lg flex items-center justify-center text-[11px] font-medium transition-all ${
                            day.trained
                            ? "gradient-primary text-primary-foreground"
                            : day.isToday
                            ? "border-2 border-primary text-primary"
                            : "bg-muted/50 text-muted-foreground"
                        }`}
                        >
                    {day.trained ? <Check className="w-3 h-3" /> : day.day}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StreakPage;