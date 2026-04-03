import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dumbbell, ChevronRight } from "lucide-react";
import { getWorkouts } from "../lib/store";

const WorkoutsListPage = () => {
  const navigate = useNavigate();
  const workouts = getWorkouts();

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="gradient-primary px-4 pt-6 pb-8 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate("/")} className="p-2 rounded-xl bg-primary-foreground/20">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-primary-foreground font-bold text-xl">Meus Treinos</h1>
        </div>
        <p className="text-primary-foreground/70 text-sm ml-12">{workouts.length} treinos na sua ficha</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {workouts.map((workout, wi) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * wi }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shrink-0">
                <Dumbbell className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">{workout.name}</p>
                <p className="text-xs text-muted-foreground">{workout.label} — {workout.exercises.length} exercícios</p>
              </div>
            </div>
            <div className="space-y-2 ml-1">
              {workout.exercises.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{ex.name}</p>
                    <p className="text-[11px] text-muted-foreground">{ex.muscleGroup}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{ex.sets}x{ex.reps}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutsListPage;