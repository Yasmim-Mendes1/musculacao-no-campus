import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Calendar, Dumbbell } from "lucide-react";
import { getProfile, getLogs } from "../lib/store";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, CartesianGrid } from "recharts";

//página de progresso
const ProgressPage = () => {
  const navigate = useNavigate(); //hook para navegação entre páginas
  const profile = getProfile(); //dados do usuário
  const logs = getLogs(); //histórico de treino do usuário

  if (!profile) return null; //se não tiver perfil, não renderiza nada

  const last7 = Array.from({ length: 7 }).map((_, i) => { //gera os dados dos últimos 7 dias para o gráfico de barras
    const d = new Date(); //começa com a data de hoje
    d.setDate(d.getDate() - (6 - i)); //ajusta a data para os últimos 7 dias (6 dias atrás até hoje)
    const dateStr = d.toISOString().split("T")[0]; //formata a data como string "YYYY-MM-DD"
    const dayLog = logs.filter((l) => l.date === dateStr); //filtra os logs para encontrar os treinos feitos nesse dia
    const xp = dayLog.reduce((sum, l) => sum + l.xpEarned, 0); //soma o XP ganho nesse dia
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]; //nomes dos dias da semana para exibir no gráfico
    return { day: dayNames[d.getDay()], xp, trained: dayLog.length > 0 }; //retorna o nome do dia, o XP ganho e se treinou ou não
  });

  const exerciseWeights: Record<string, { date: string; weight: number }[]> = {}; //objeto para armazenar a evolução de cargas por exercício
  logs.forEach((log) => { //percorre todos os logs de treino
    log.exercises.forEach((ex) => { //para cada exercício do treino
      const maxW = Math.max(...ex.weights.filter(w => w > 0), 0); //encontra a maior carga levantada nesse exercício (ignora pesos zero)
      if (maxW > 0) { //se levantou alguma carga, registra a data e o peso para esse exercício
        if (!exerciseWeights[ex.exerciseId]) exerciseWeights[ex.exerciseId] = []; //se ainda não tem registro para esse exercício, inicializa o array
        exerciseWeights[ex.exerciseId]!.push({ date: log.date, weight: maxW }); //adiciona a data e o peso levantado para esse exercício
      }
    });
  });

  const thisMonth = new Date().getMonth(); //mês atual para calcular as estatísticas mensais
  const monthLogs = logs.filter((l) => new Date(l.date).getMonth() === thisMonth); //filtra os logs para pegar apenas os treinos feitos no mês atual
  const monthDays = new Set(monthLogs.map((l) => l.date)).size; //conta quantos dias diferentes o usuário treinou nesse mês
  const monthXP = monthLogs.reduce((s, l) => s + l.xpEarned, 0); //soma o total de XP ganho nesse mês

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-yellow-400 px-4 pt-6 pb-8 rounded-b-[2rem]">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 rounded-xl bg-primary-foreground/20">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-primary-foreground font-bold text-lg">Progresso</h1>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Calendar, value: monthDays, label: "Dias este mês" },
            { icon: TrendingUp, value: monthXP, label: "XP este mês" },
            { icon: Dumbbell, value: profile.completedWorkouts, label: "Total treinos" },
          ].map((stat, i) => ( //exibe as estatísticas principais em cards
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-3 text-center"
            >
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* gráfico de XP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-4"
        >
          <h3 className="font-bold text-foreground mb-4">XP dos últimos 7 dias</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7}> {/* gráfico de barras para mostrar o XP ganho nos últimos 7 dias */}
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="xp" fill="hsl(78, 58%, 48%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* evolução de carga */}
        {Object.keys(exerciseWeights).length > 0 && ( //se tiver dados de evolução de carga, mostra o gráfico; se não tiver, não mostra essa seção
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-4"
          >
            <h3 className="font-bold text-foreground mb-4">Evolução de Cargas</h3>
            {Object.entries(exerciseWeights).slice(0, 3).map(([id, data]) => ( //percorre os exercícios com evolução de carga (limita a 3 para não poluir a tela)
              <div key={id} className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">{id}</p>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}> {/* gráfico de linha para mostrar a evolução de carga ao longo do tempo para cada exercício */}
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" hide />
                      <YAxis tick={{ fontSize: 10 }} width={30} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: 12,
                        }}
                      />
                      <Line type="monotone" dataKey="weight" stroke="hsl(78, 58%, 48%)" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* histórico de treinos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-4"
        >
          <h3 className="font-bold text-foreground mb-3">Histórico Recente</h3>
          {logs.length === 0 ? ( //se não tiver nenhum treino registrado, mostra uma mensagem; se tiver, mostra os últimos treinos
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum treino registrado ainda
            </p>
          ) : (
            <div className="space-y-2">
              {logs.slice(-10).reverse().map((log, i) => ( //mostra os últimos 10 treinos, do mais recente para o mais antigo
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{log.workoutId}</p>
                    <p className="text-xs text-muted-foreground">{log.date}</p>
                  </div>
                  <span className="text-sm font-bold text-xp">+{log.xpEarned} XP</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressPage;