"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { BaseLayout } from "@/components/layouts/base-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const accountFormSchema = z.object({
  firstName: z.string().min(1, "Първото име е задължително"),
  lastName: z.string().min(1, "Фамилията е задължителна"),
  email: z.string().email("Невалидна имейл адреса"),
  username: z.string().min(3, "Потребителското име трябва да бъде минимум 3 символа"),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

export default function AccountSettings() {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  function onSubmit(data: AccountFormValues) {
    console.log("Form submitted:", data)
    // Here you would typically save the data
  }

  return (
    <BaseLayout>
      <div className="space-y-6 px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold">Настройки на акаунта</h1>
          <p className="text-muted-foreground">
            Управлявайте настройките и предпочетанията на вашия акаунт.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Лична информация</CardTitle>
                <CardDescription>
                  Обновете вашата лична информация, която ще бъде показана в профила ви.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Първо име</FormLabel>
                        <FormControl>
                          <Input placeholder="Въведете вашето първо име" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Фамилия</FormLabel>
                        <FormControl>
                          <Input placeholder="Въведете вашата фамилия" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Имейл адреса</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Въведете вашия имейл" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Потребителско име</FormLabel>
                      <FormControl>
                        <Input placeholder="Въведете вашето потребителско име" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Промяна на парола</CardTitle>
                <CardDescription>
                  Обновете вашата парола, за да поддържате акаунта си защитен.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Текуща парола</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Въведете текущата парола" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Нова парола</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Въведете нова парола" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Потвърдете новата парола</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Потвърдете новата парола" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Опасна зона</CardTitle>
                <CardDescription>
                  Необратими и деструктивни действия.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Изтриване на акаунт</h4>
                    <p className="text-sm text-muted-foreground">
                      Трайно изтриване на вашия акаунт и всички свързани данни.
                    </p>
                  </div>
                  <Button variant="destructive" type="button" className="cursor-pointer">
                    Изтриване на акаунт
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Button type="submit" className="cursor-pointer">Запазване на промените</Button>
              <Button variant="outline" type="reset" className="cursor-pointer">Отказ</Button>
            </div>
          </form>
        </Form>
      </div>
    </BaseLayout>
  )
}
