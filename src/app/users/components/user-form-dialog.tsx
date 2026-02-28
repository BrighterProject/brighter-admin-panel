"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { z, regexes } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UserFormValues } from "../types";

const userFormSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Потребителското име трябва да е поне 2 символа." }),
  full_name: z.string().optional().default(""),
  email: z
    .string()
    .regex(regexes.unicodeEmail, { message: "Моля, въведете валиден имейл" }),
  password: z
    .string()
    .min(6, { message: "Паролата трябва да е поне 6 символа." }),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  onAddUser: (user: UserFormValues) => void;
}

export function UserFormDialog({ onAddUser }: UserFormDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(userFormSchema) as Resolver<FormValues>,
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
      password: "",
      is_active: true,
    },
  });

  function onSubmit(data: FormValues) {
    onAddUser({
      username: data.username,
      full_name: data.full_name ?? "",
      email: data.email ?? "",
      password: data.password,
      is_active: data.is_active,
    });
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Добави потребител
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Добави потребител</DialogTitle>
          <DialogDescription>
            Създайте нов потребителски акаунт. Натиснете запази, когато сте
            готови.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Потребителско име</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пълно име</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имейл</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
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
                  <FormLabel>Парола</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel className="cursor-pointer">Активен</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="cursor-pointer">
                Запази потребител
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
