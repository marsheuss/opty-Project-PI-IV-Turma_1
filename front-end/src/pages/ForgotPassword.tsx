import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { ArrowLeft, Mail, Tag } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setIsLoading(true);

    try {
      // Chama nosso backend, que dispara o e-mail via Supabase
      await api.auth.forgotPassword({ email });

      toast({
        title: "Se o e-mail estiver cadastrado...",
        description:
          "Enviamos um link para redefinir sua senha. Confira sua caixa de entrada e o spam.",
      });

      // Opcional: mandar o usuário de volta pro login
      navigate("/login");
    } catch (error: any) {
      console.error(error);

      toast({
        title: "Erro ao enviar e-mail",
        description:
          error?.response?.data?.detail ||
          "Não foi possível processar sua solicitação. Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center justify-center gap-2 mb-8 group no-underline"
        >
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-lg shadow-md group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
            <Tag className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
            Opty
          </span>
        </Link>

        {/* Card Principal */}
        <Card className="glass overflow-hidden">
          <div className="p-6 text-center space-y-2 border-b border-gray-100/50 bg-white/50">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Recuperar Senha
            </h2>
            <p className="text-sm text-gray-500">
              Informe seu e-mail para receber o link de redefinição
            </p>
          </div>

          <div className="p-6 pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* E-mail */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Botão de Envio */}
              <Button
                variant="gradient"
                className="w-full"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>

            {/* Voltar para Login */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors group"
              >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Voltar para o Login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
