"use client"

import { useState } from "react"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AuthTabs() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
          <TabsTrigger value="register">Registrarse</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login" className="mt-0">
          <LoginForm onSwitchToRegister={() => setActiveTab("register")} />
        </TabsContent>
        
        <TabsContent value="register" className="mt-0">
          <RegisterForm onSwitchToLogin={() => setActiveTab("login")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
