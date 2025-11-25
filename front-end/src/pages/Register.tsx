import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Tag,
  Github,
  User,
  Phone,
  Calendar as CalendarIcon 
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false,
    birthday: '',
  });
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>();
  const [birthdayText, setBirthdayText] = useState('');
  const [birthdayError, setBirthdayError] = useState('');
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [phoneText, setPhoneText] = useState('');


  // Password strength calculator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;

    if (strength <= 1) return { strength: 'Fraca', color: 'text-destructive' };
    if (strength <= 2) return { strength: 'Média', color: 'text-yellow-500' };
    return { strength: 'Forte', color: 'text-accent' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: 'Erro',
        description: 'Você deve aceitar os termos de uso.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Bem-vindo ao Opty.',
      });
    }, 1500);
  };

  return (
    <div className='min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-subtle'>
      <div className='w-full max-w-md animate-fade-in'>
        {/* Logo */}
        <Link to='/' className='flex items-center justify-center gap-2 mb-8 group'>
          <div className='bg-gradient-primary p-2 rounded-lg shadow-md group-hover:shadow-glow transition-all duration-300'>
            <Tag className='h-6 w-6 text-white' />
          </div>
          <span className='text-2xl font-bold gradient-text'>Opty</span>
        </Link>

        <Card className='glass shadow-xl border-2'>
          <CardHeader className='text-center pb-6'>
            <CardTitle className='text-2xl font-bold'>Criar Conta</CardTitle>
            <CardDescription>
              Junte-se a milhares de usuários que economizam com Opty
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Name Field */}
              <div className='space-y-2'>
                <Label htmlFor='name'>Nome completo</Label>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='name'
                    type='text'
                    placeholder='João Silva'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className='pl-10 bg-background'
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className='space-y-2'>
                <Label htmlFor='email'>E-mail</Label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='email'
                    type='email'
                    placeholder='seu@email.com'
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className='pl-10 bg-background'
                    required
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className='space-y-2'>
                <Label htmlFor='phone'>Telefone</Label>
                <div className='relative'>
                  <Phone className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='phone'
                    type='tel'
                    placeholder='(11) 94019-6301'
                    value={phoneText}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                      const dd = digits.slice(0, 2);
                      const nine = digits.length > 10;
                      const first = digits.slice(2, nine ? 7 : 6);
                      const last = digits.slice(nine ? 7 : 6);
                      const formatted = digits
                        ? `(${dd}${digits.length >= 2 ? ')' : ''}${digits.length >= 3 ? ' ' : ''}${first}${digits.length >= (nine ? 7 : 6) && last ? '-' : ''}${last}`
                        : '';
                      setPhoneText(formatted);
                      setFormData({ ...formData, phone: digits });
                    }}
                    className='pl-10 bg-background'
                    required
                  />
                </div>
              </div>

              {/* Birthday Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data de Nascimento</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                      placeholder="DD/MM/AAAA"
                      value={birthdayText}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                        let formatted = digits;
                        if (digits.length >= 3) {
                          formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                        }
                        if (digits.length >= 5) {
                          formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
                        }
                        setBirthdayText(formatted);
                        setBirthdayError('');
                        if (digits.length === 8) {
                          const d = Number(digits.slice(0, 2));
                          const mo = Number(digits.slice(2, 4)) - 1;
                          const y = Number(digits.slice(4));
                          const dt = new Date(y, mo, d);
                          if (dt.getFullYear() === y && dt.getMonth() === mo && dt.getDate() === d) {
                            setDate(dt);
                            setFormData({ ...formData, birthday: format(dt, 'yyyy-MM-dd') });
                          } else {
                            setBirthdayError('Data inválida');
                            setFormData({ ...formData, birthday: '' });
                          }
                        } else {
                          setFormData({ ...formData, birthday: '' });
                        }
                      }}
                      className="pl-10"
                    />
                  </div>
                  
                </div>
                {birthdayError && <div className="text-xs text-destructive">{birthdayError}</div>}
                {!birthdayError && !birthdayText && <div className="text-xs text-muted-foreground">Formato: DD/MM/AAAA</div>}
              </div>

              {/* Password Field */}
              <div className='space-y-2'>
                <Label htmlFor='password'>Senha</Label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className='pl-10 pr-10'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                  </button>
                </div>
                {formData.password && (
                  <div className='flex items-center gap-2'>
                    <div className='flex-1 h-1.5 bg-muted rounded-full overflow-hidden'>
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.strength === 'Fraca'
                            ? 'w-1/3 bg-destructive'
                            : passwordStrength.strength === 'Média'
                            ? 'w-2/3 bg-yellow-500'
                            : 'w-full bg-accent'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.strength}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>Confirmar senha</Label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className='pl-10 pr-10'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className='flex items-start space-x-2'>
                <Checkbox
                  id='terms'
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, acceptTerms: checked as boolean })
                  }
                />
                <label
                  htmlFor='terms'
                  className='text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer'
                >
                  Aceito os{' '}
                  <a href='#' className='text-primary hover:underline font-medium' onClick={(e) => { e.preventDefault(); setOpenTerms(true); }}>
                    Termos de Uso
                  </a>{' '}
                  e{' '}
                  <a href='#' className='text-primary hover:underline font-medium' onClick={(e) => { e.preventDefault(); setOpenPrivacy(true); }}>
                    Política de Privacidade
                  </a>
                </label>
              </div>

              <Dialog open={openTerms} onOpenChange={setOpenTerms}>
                <DialogContent className='max-w-2xl p-0 overflow-hidden'>
                  <div className='bg-gradient-primary text-white p-4'>
                    <div className='text-base font-semibold'>Termos de Uso</div>
                    <div className='text-xs opacity-80'>Leia atentamente os termos antes de prosseguir</div>
                  </div>
                  <div className='p-6 space-y-4 text-sm text-muted-foreground'>
                    <p>Estes termos regem o uso da plataforma Opty. Ao criar sua conta, você concorda com as condições de uso e políticas vigentes.</p>
                    <p>Uso adequado, privacidade e segurança das credenciais são de responsabilidade do usuário.</p>
                    <p>Para a versão completa, consulte a página <a href='/termos' className='text-primary hover:underline'>Termos e Condições</a>.</p>
                    <div className='pt-2'>
                      <Button variant='gradient' className='w-full' onClick={() => setOpenTerms(false)}>Fechar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={openPrivacy} onOpenChange={setOpenPrivacy}>
                <DialogContent className='max-w-2xl p-0 overflow-hidden'>
                  <div className='bg-gradient-primary text-white p-4'>
                    <div className='text-base font-semibold'>Política de Privacidade</div>
                    <div className='text-xs opacity-80'>Veja como tratamos seus dados</div>
                  </div>
                  <div className='p-6 space-y-4 text-sm text-muted-foreground'>
                    <p>Coletamos dados para personalização e melhoria contínua da plataforma. Não vendemos suas informações.</p>
                    <p>Adotamos práticas de segurança e controles de acesso para proteger seus dados.</p>
                    <p>Para a versão completa, acesse <a href='/privacidade' className='text-primary hover:underline'>Política de Privacidade</a>.</p>
                    <div className='pt-2'>
                      <Button variant='gradient' className='w-full' onClick={() => setOpenPrivacy(false)}>Fechar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Submit Button */}
              <Button
                type='submit'
                variant='gradient'
                className='w-full'
                size='lg'
                disabled={isLoading}
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>

              {/* Divider */}
              <div className='relative my-6'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-border' />
                </div>
                <br />
              </div>
            </form>

            {/* Login Link */}
            <div className='mt-6 text-center text-sm'>
              <span className='text-muted-foreground'>Já tem conta? </span>
              <Link to='/login' className='font-medium text-primary hover:underline'>
                Fazer login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
