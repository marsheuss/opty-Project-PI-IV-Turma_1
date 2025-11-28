import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // Importando os novos ícones
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ResetSenha = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para controlar a visibilidade de cada campo
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmacao, setShowConfirmacao] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (senha !== confirmacao) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem.",
      });
      return;
    }

    if (senha.length < 6) {
        toast({
          variant: "destructive",
          title: "Senha muito curta",
          description: "Mínimo de 6 caracteres.",
        });
        return;
      }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Senha atualizada!",
        description: "Faça login com sua nova senha.",
      });
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-white">
      <Navbar />

      <main className="flex-grow flex items-center justify-center p-4 pt-32 pb-10">
        <div className="w-full max-w-md bg-[#1e293b] rounded-lg border border-gray-800 p-8 shadow-xl">
          <div className="space-y-2 text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Redefinir Senha
            </h1>
            <p className="text-sm text-gray-400">
              Crie uma nova senha para sua conta
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            
            {/* Campo Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-gray-200">Nova Senha</Label>
              <div className="relative">
                <Input 
                  id="senha" 
                  // Aqui acontece a mágica: se showSenha for true, vira texto
                  type={showSenha ? "text" : "password"} 
                  placeholder="******" 
                  className="bg-[#0f172a] border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-purple-500 pr-10"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
                <button
                  type="button" // Importante ser type="button" para não enviar o form
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Campo Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmacao" className="text-gray-200">Confirmar Senha</Label>
              <div className="relative">
                <Input 
                  id="confirmacao" 
                  type={showConfirmacao ? "text" : "password"} 
                  placeholder="******" 
                  className="bg-[#0f172a] border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-purple-500 pr-10"
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmacao(!showConfirmacao)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmacao ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button 
              className="w-full bg-[#6366f1] hover:bg-[#5558dd] text-white font-semibold h-11" 
              type="submit" 
              disabled={loading}
            >
              {loading ? "Atualizando..." : "Salvar Nova Senha"}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResetSenha;