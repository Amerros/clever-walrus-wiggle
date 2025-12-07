import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { format, parseISO, subMonths } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker'; // Import DateRange

interface Workout {
  id: string;
  workout_name: string;
  duration_minutes: number;
  workout_date: string;
  created_at: string;
}

interface Meal {
  id: string;
  meal_name: string;
  calories: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  meal_date: string;
  created_at: string;
}

interface Document {
  id: string;
  user_id: string;
  title: string;
  file_url: string;
  description: string | null;
  category: string | null;
  uploaded_at: string;
  body_fat_percentage: number | null;
  ai_analysis_report: string | null;
}

const ProgressReport = () => {
  const userProfile = useAppStore((state) => state.userProfile);
  const level = useAppStore((state) => state.level);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<Document[]>([]);
  // Explicitly type dateRange as DateRange | undefined
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });

  useEffect(() => {
    if (userProfile?.userId) {
      fetchData();
    }
  }, [userProfile?.userId, dateRange]);

  const fetchData = async () => {
    if (!userProfile?.userId) return;

    const fromDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '1900-01-01';
    const toDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

    // Fetch Workouts
    const { data: workoutData, error: workoutError } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userProfile.userId)
      .gte('workout_date', fromDate)
      .lte('workout_date', toDate)
      .order('workout_date', { ascending: true });

    if (workoutError) {
      console.error("Error fetching workouts:", workoutError);
      toast.error("Failed to load workout data.");
    } else {
      setWorkouts(workoutData || []);
    }

    // Fetch Meals
    const { data: mealData, error: mealError } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userProfile.userId)
      .gte('meal_date', fromDate)
      .lte('meal_date', toDate)
      .order('meal_date', { ascending: true });

    if (mealError) {
      console.error("Error fetching meals:", mealError);
      toast.error("Failed to load meal data.");
    } else {
      setMeals(mealData || []);
    }

    // Fetch Progress Photos
    const { data: photoData, error: photoError } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userProfile.userId)
      .eq('category', 'Progress Photo')
      .gte('uploaded_at', fromDate)
      .lte('uploaded_at', toDate)
      .order('uploaded_at', { ascending: false }); // Show newest first

    if (photoError) {
      console.error("Error fetching progress photos:", photoError);
      toast.error("Failed to load progress photos.");
    } else {
      setProgressPhotos(photoData || []);
    }
  };

  const processWorkoutDataForChart = () => {
    const dailyWorkoutDuration: { [key: string]: number } = {};
    workouts.forEach(workout => {
      const date = format(parseISO(workout.workout_date), 'MMM dd');
      dailyWorkoutDuration[date] = (dailyWorkoutDuration[date] || 0) + workout.duration_minutes;
    });
    return Object.entries(dailyWorkoutDuration).map(([date, duration]) => ({ date, duration }));
  };

  const processMealDataForChart = () => {
    const dailyCalories: { [key: string]: number } = {};
    meals.forEach(meal => {
      const date = format(parseISO(meal.meal_date), 'MMM dd');
      dailyCalories[date] = (dailyCalories[date] || 0) + (meal.calories || 0);
    });
    return Object.entries(dailyCalories).map(([date, calories]) => ({ date, calories }));
  };

  const workoutChartData = processWorkoutDataForChart();
  const mealChartData = processMealDataForChart();

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="text-center max-w-4xl mx-auto w-full space-y-8">
        <h1 className="text-4xl font-bold text-primary-foreground mb-6">
          <span className="text-green-400">PROGRESS</span> REPORT
        </h1>
        <p className="text-lg text-text-secondary mb-8">
          Visualize your hunter journey and growth.
        </p>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-primary-foreground">Overall Status</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-text-secondary">
            <div>
              <p className="font-semibold">Current Level:</p>
              <p className="text-xl text-primary-accent">{level.currentLevel}</p>
            </div>
            <div>
              <p className="font-semibold">Total XP:</p>
              <p className="text-xl text-secondary-accent">{level.totalXP}</p>
            </div>
            {userProfile && (
              <>
                <div>
                  <p className="font-semibold">Start Weight:</p>
                  <p className="text-xl">{userProfile.startWeight} kg</p>
                </div>
                <div>
                  <p className="font-semibold">Current Weight:</p>
                  <p className="text-xl">{userProfile.currentWeight} kg</p>
                </div>
                <div>
                  <p className="font-semibold">Goal Weight:</p>
                  <p className="text-xl">{userProfile.goalWeight} kg</p>
                </div>
                <div>
                  <p className="font-semibold">Height:</p>
                  <p className="text-xl">{userProfile.height} cm</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-primary-foreground flex justify-between items-center">
              Activity Over Time
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal bg-input border-border text-foreground",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-text-secondary mb-2">Workout Duration (minutes)</h3>
              {workoutChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={workoutChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--text-secondary))" />
                    <YAxis stroke="hsl(var(--text-secondary))" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="duration" fill="hsl(var(--sl-primary-accent))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-text-secondary">No workout data for this period.</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-secondary mb-2">Daily Calorie Intake (kcal)</h3>
              {mealChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mealChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--text-secondary))" />
                    <YAxis stroke="hsl(var(--text-secondary))" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Line type="monotone" dataKey="calories" stroke="hsl(var(--sl-secondary-accent))" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-text-secondary">No meal data for this period.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-primary-foreground">Progress Photos & AI Analysis</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progressPhotos.length > 0 ? (
              progressPhotos.map((photo) => (
                <div key={photo.id} className="bg-muted p-4 rounded-lg border border-border flex flex-col">
                  <img src={photo.file_url} alt={photo.title} className="w-full h-48 object-cover rounded-md mb-3" />
                  <h4 className="text-lg font-semibold text-primary-accent mb-1">{photo.title}</h4>
                  <p className="text-sm text-text-secondary mb-2">Uploaded: {format(parseISO(photo.uploaded_at), 'PPP')}</p>
                  {photo.body_fat_percentage !== null && (
                    <p className="text-md font-bold text-sl-success mb-1">Body Fat: {photo.body_fat_percentage}%</p>
                  )}
                  {photo.ai_analysis_report && (
                    <div className="mt-2 text-sm text-text-secondary">
                      <p className="font-semibold text-primary-foreground">AI Advice:</p>
                      <p>{photo.ai_analysis_report}</p>
                    </div>
                  )}
                  {!photo.body_fat_percentage && !photo.ai_analysis_report && (
                    <p className="text-sm text-text-secondary">No AI analysis available for this photo.</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-text-secondary col-span-full">No progress photos uploaded yet. <Link to="/upload-photo" className="text-primary-accent hover:underline">Upload one now!</Link></p>
            )}
          </CardContent>
        </Card>

        <Link to="/dashboard">
          <Button
            variant="outline"
            className="w-full border-border text-text-secondary hover:bg-accent hover:text-accent-foreground mt-4"
          >
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProgressReport;