import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  durationHours: z.coerce.number().min(0.5, { message: 'Sleep duration must be at least 0.5 hours.' }).max(24, { message: 'Sleep duration cannot exceed 24 hours.' }),
  qualityRating: z.coerce.number().min(1).max(5).optional(),
  logDate: z.date({ required_error: 'A date is required.' }),
  notes: z.string().optional(),
});

const LogSleep = () => {
  const navigate = useNavigate();
  const userProfile = useAppStore((state) => state.userProfile);
  const addXP = useAppStore((state) => state.addXP);
  const logDailyQuest = useAppStore((state) => state.logDailyQuest);
  const [isLogging, setIsLogging] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      durationHours: 7,
      qualityRating: 3,
      logDate: new Date(),
      notes: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userProfile?.userId) {
      toast.error("User not authenticated. Please log in.");
      return;
    }

    setIsLogging(true);
    const loadingToastId = toast.loading("Logging sleep...");

    try {
      const { data, error } = await supabase
        .from('sleep_logs')
        .insert({
          user_id: userProfile.userId,
          duration_hours: values.durationHours,
          quality_rating: values.qualityRating,
          log_date: format(values.logDate, 'yyyy-MM-dd'),
          notes: values.notes,
        })
        .select();

      if (error) {
        throw error;
      }

      toast.success("Sleep logged successfully!", { id: loadingToastId });
      
      // Log daily quest and add XP
      const today = format(new Date(), 'yyyy-MM-dd');
      logDailyQuest(today, 'sleep', { completed: true, xp: 30, value: values.durationHours }); // Log sleep duration
      addXP(30); // Add XP directly to global level

      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error logging sleep:", error);
      toast.error(`Failed to log sleep: ${error.message}`, { id: loadingToastId });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground p-4 md:p-8">
      <div className="text-center max-w-md w-full space-y-6">
        <h1 className="text-4xl font-bold text-primary-foreground mb-6">
          <span className="text-sl-warning">LOG</span> SLEEP
        </h1>
        <p className="text-lg text-text-secondary mb-8">
          Record your sleep duration and quality.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow-lg border border-border">
            <FormField
              control={form.control}
              name="durationHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-secondary">Duration (hours)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.5" placeholder="e.g., 7.5" {...field} className="bg-input border-border text-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="qualityRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-secondary">Quality Rating (1-5)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="bg-input border-border text-foreground">
                        <SelectValue placeholder="Select sleep quality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border text-foreground">
                      <SelectItem value="1">1 - Very Poor</SelectItem>
                      <SelectItem value="2">2 - Poor</SelectItem>
                      <SelectItem value="3">3 - Average</SelectItem>
                      <SelectItem value="4">4 - Good</SelectItem>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-text-secondary">Date</FormLabel>
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-secondary">Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any specific details about your sleep..." {...field} className="bg-input border-border text-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isLogging}
              className="w-full bg-sl-warning hover:bg-sl-warning/90 text-background transition-colors duration-300 text-lg py-3 mt-6 relative overflow-hidden group"
            >
              {isLogging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  LOGGING...
                </>
              ) : (
                <>
                  <span className="relative z-10">LOG SLEEP</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </>
              )}
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

export default LogSleep;