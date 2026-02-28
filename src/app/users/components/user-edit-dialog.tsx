import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z, regexes } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useUpdateUser } from "../hooks";
import type { User } from "../types";

const editFormSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Потребителското име трябва да е поне 2 символа." })
    .optional(),
  full_name: z.string().optional(),
  email: z
    .string()
    .regex(regexes.unicodeEmail, { message: "Моля, въведете валиден имейл" })
    .or(z.literal(""))
    .optional(),
  password: z
    .string()
    .min(6, { message: "Паролата трябва да е поне 6 символа." })
    .optional()
    .or(z.literal("")),
  is_active: z.boolean().optional(),
});

type EditFormValues = z.infer<typeof editFormSchema>;

interface UserEditDialogProps {
  user: User | null;
  onClose: () => void;
}

export function UserEditDialog({ user, onClose }: UserEditDialogProps) {
  const { mutate: updateUser, isPending } = useUpdateUser();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
      is_active: true,
    },
  });

  // Populate form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username,
        full_name: user.full_name ?? "",
        email: user.email ?? "",
        password: "",
        is_active: user.is_active,
      });
    }
  }, [user, form]);

  const onSubmit = (data: EditFormValues) => {
    if (!user) return;
    // Only send fields that actually changed
    const changed = Object.fromEntries(
      Object.entries(data).filter(
        ([key, val]) => val !== "" && val !== user[key as keyof User],
      ),
    );
    if (Object.keys(changed).length === 0) {
      onClose();
      return;
    }
    updateUser({ id: user.id, data: changed }, { onSuccess: onClose });
  };

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Редактирай потребител</DialogTitle>
          <DialogDescription>
            Актуализирайте детайлите. Само променените полета ще бъдат
            изпратени.
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
                  <FormLabel>Нова парола</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Оставете празно, за да запазите текущата"
                      {...field}
                    />
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
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="cursor-pointer"
              >
                Отказ
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="cursor-pointer"
              >
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Запази промените
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
