import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, ClockIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/lib/store';
import { callGeminiAPI } from '@/lib/gemini';

const formSchema = z.object({
  mealName: z.string().min(1, { message: 'Meal name is required.' }),
  mealDate: z.date({ required_error: 'A meal date is required.' }),
  mealTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Invalid time format (HH:MM).' }),
  description: z.string().optional(),
  calories: z.coerce.number().min(0).optional(),
  proteinGrams: z.coerce.number().min(0).optional(),
  carbsGrams: z.coerce.number().min(0).optional(),
  fatGrams: z.coerce.number().min(0).optional(),
});

const AddMeal = () => {
  const navigate = useNavigate();
  const userProfile = useAppStore((state) => state.userProfile);
  const addXP = useAppStore((state) => state.addXP);
  const logDailyQuest = useAppStore((state) => state.logDailyQuest);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mealName: '',
      mealDate: new Date(),
      mealTime: format(new Date(), 'HH:mm'),
      description: '',
      calories: undefined,
      proteinGrams: undefined,
      carbsGrams: undefined,
      fatGrams: undefined,
    },
  });

  const handleAnalyzeMeal = async () => {
    const mealDescription = form.getValues('description');
    if (!mealDescription) {
      toast.info("Please provide a meal description to analyze.");
      return;
    }

    setIsAnalyzing(true);
    const loadingToastId = toast.loading("Analyzing meal with Gemini AI...");

    try {
      const prompt = `Analyze the following meal description and provide its estimated nutritional values (calories, protein, carbs, fat in grams). Respond only with a JSON object in the format: {"calories": number, "protein_grams": number, "carbs_grams": number, "fat_grams": number}. If a value cannot be determined, use null. Meal: "${mealDescription}"`;
      const result = await callGeminiAPI(prompt, 200);

      if (result) {
        try {
          const nutrition = JSON.parse(result);
          form.setValue('calories', nutrition.calories || undefined);
          form.setValue('proteinGrams', nutrition.protein_grams || undefined);
          form.setValue('carbsGrams', nutrition.carbs_grams || undefined);
          form.setValue('fatGrams', nutrition.fat_grams || undefined);
          toast.success("Meal analyzed successfully!", { id: loadingToastId });
        } catch (parseError) {
          console.error("Failed to parse AI response:", parseError);
          toast.error("Failed to parse AI response. Please try again or enter manually.", { id: loadingToastId });
        }
      } else {
        toast.error("AI could not analyze the meal. Please enter nutritional info manually.", { id: loadingToastId });
      }
    } catch (error) {
      console.error("Error analyzing meal:", error);
      toast.error("Failed to connect to AI for analysis.", { id: loadingToastId });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userProfile?.userId) {
      toast.error("User not authenticated. Please log in.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('meals')
        .insert({
          user_id: userProfile.userId,
          meal_name: values.mealName,
          meal_date: format(values.mealDate, 'yyyy-MM-dd'),
          meal_time: values.mealTime,
          description: values.description,
          calories: values.calories,
          protein_grams: values.proteinGrams,
          carbs_grams: values.carbsGrams,
          fat_grams: values.fatGrams,
        })
        .select();

      if (error) {
        throw error;
      }

      toast.success("Meal logged successfully!");

      // Log daily quest and add XP
      const today = format(new Date(), 'yyyy-MM-dd');
      logDailyQuest(today, 'calories', { completed: true, xp: 50, value: values.calories }); // Example XP
      logDailyQuest(today, 'protein', { completed: true, xp: 50, value: values.proteinGrams }); // Example XP
      addXP(100); // Add XP directly to global level for logging a meal

      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error logging meal:", error);
      toast.error(`Failed to log meal: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground p-4 md:p-8">
      <div className="text-center max-w-md w-full space-y-6">
        <h1 className="text-4xl font-bold text-primary-foreground mb-6">
          <span className="text-purple-400">ADD</span> MEAL
        </h1>
        <p className="text-lg text-text-secondary mb-8">
          Track your nutritional intake here. Use AI to help analyze your meals!
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow-lg border border-border">
            <FormField
              control={form.control}
              name="mealName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-secondary">Meal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Breakfast, Post-Workout Shake" {...field} className="bg-input border-border text-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mealDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-text-secondary">Meal Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-input border-border text-foreground",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mealTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-secondary">Meal Time (HH:MM)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type="time" {...field} className="bg-input border-border text-foreground pr-10" />
                      <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 text-text-secondary" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-secondary">Meal Description (e.g., 1 cup of rice, 200g chicken breast)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your meal for AI analysis..." {...field} className="bg-input border-border text-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              onClick={handleAnalyzeMeal}
              disabled={isAnalyzing}
              className="w-full bg-secondary hover:bg-secondary-foreground text-secondary-foreground hover:text-background transition-colors duration-300 text-lg py-3 relative overflow-hidden group"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ANALYZING...
                </>
              ) : (
                <>
                  <span className="relative z-10">ANALYZE WITH AI</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </>
              )}
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Calories</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="kcal" {...field} className="bg-input border-border text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="proteinGrams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Protein (g)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="grams" {...field} className="bg-input border-border text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="carbsGrams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Carbs (g)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="grams" {...field} className="bg-input border-border text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fatGrams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-text-secondary">Fat (g)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="grams" {...field} className="bg-input border-border text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-background transition-colors duration-300 text-lg py-3 mt-6 relative overflow-hidden group"
            >
              <span className="relative z-10">LOG MEAL</span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
          </form>
        </Form>

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

export default AddMeal;