'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PasswordInput } from '../ui/password-input';
import { useAuth, useFirestore } from '@/firebase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type LoginRole = 'user' | 'artisan';

const normalizeRole = (value: unknown): LoginRole => {
  const cleaned = String(value ?? '').trim().toLowerCase();
  return cleaned === 'artisan' || cleaned === 'artisian' ? 'artisan' : 'user';
};

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<LoginRole>('user');
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = credential.user;
      const userSnap = await getDoc(doc(firestore, 'users', user.uid));
      const storedRoleRaw = userSnap.exists() ? userSnap.data()?.role : undefined;
      const storedRole = storedRoleRaw == null ? null : normalizeRole(storedRoleRaw);
      let normalizedRole: LoginRole = storedRole ?? role;

      if (normalizedRole !== 'artisan') {
        const artisanSnap = await getDoc(doc(firestore, 'artisans', user.uid));
        if (artisanSnap.exists()) {
          normalizedRole = 'artisan';
        }
      }

      console.log('Fetched user role:', normalizedRole);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('loginRole', normalizedRole);
        window.dispatchEvent(new Event('loginRoleChanged'));
      }

      toast({
        title: 'Login Successful',
        description: normalizedRole === 'artisan' ? 'Welcome back, artisan.' : 'Welcome back!',
      });

      router.push(normalizedRole === 'artisan' ? '/artisan-dashboard' : '/');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'There was a problem with your request.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <FormLabel>Login As</FormLabel>
          <Select value={role} onValueChange={(value) => setRole(value as LoginRole)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="artisan">Artisan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
}
