import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  intelligence: z.coerce.number().min(0, { message: 'Score cannot be negative.' }),
  strength: z.coerce.number().min(0, { message: 'Score cannot be negative.' }),
  endurance: z.coerce.number().min(0, { message: 'Score cannot be negative.' }),
  agility: z.coerce.number().min(0, { message: 'Score cannot be negative.' }),
});

const RetestAttributes = () => {
  const navigate = useNavigate();
  const userProfile = useAppStore((state) => state.userProfile);
  const attributes = useAppStore((state) => state.attributes);
  const setAttribute = useAppStore((state) => state.setAttribute);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      intelligence: attributes.intelligence.score,
      strength: attributes.strength.score,
      endurance: attributes.endurance.score,
      agility: attributes.agility.score,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userProfile?.userId) {
      toast.error("User profile not found. Please complete your awakening.");
      navigate('/awakening');
      return;
    }

    setIsSubmitting(true);
    const loadingToastId = toast.loading("Updating attributes...");

    try {
      // Update each attribute in the store
      setAttribute('intelligence', { ...attributes.intelligence, score: values.intelligence });
      setAttribute('strength', { ...attributes.strength, score: values.strength });
      setAttribute('endurance', { ...attributes.endurance, score: values.endurance });
      setAttribute('agility', { ...attributes.agility, score: values.agility });

      toast.success("Attributes retested and updated successfully!", { id: loadingToastId });
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error updating attributes:", error);
      toast.error(`Failed to update attributes: ${error.message}`, { id: loadingToastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground p-4 md:p-8">
      <div className="text-center max-w-md w-full space-y-6">
        <h1 className="text-4xl font-bold text-primary-foreground mb-6">
          <span className="text-sl-secondary-accent">RETEST</span> ATTRIBUTES
        </h1>
        <p className="text-lg text-text-secondary mb-8">
          Re-evaluate your core attributes to see your growth.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow-lg border border-border">
            <FormField
              control={form.control}
              name="intelligence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-secondary">Intelligence Score</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="bg-input border-border text-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="strength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-secondary">Strength Score</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="bg-input border-border text-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endurance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-secondary">Endurance Score</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="bg-input border-border text-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-text-secondary">Agility Score</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="bg-input border-border text-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-sl-secondary-accent hover:bg-sl-secondary-accent/90 text-background transition-colors duration-300 text-lg py-3 mt-6 relative overflow-hidden group"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  SUBMITTING...
                </>
              ) : (
                <>
                  <span className="relative z-10">SUBMIT RETEST</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
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

export default RetestAttributes;