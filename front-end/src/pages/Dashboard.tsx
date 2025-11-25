import { useNavigate } from 'react-router-dom';
import { Smartphone, Shirt, Home, Dumbbell, TrendingDown, Search, Zap, PiggyBank, Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardNav from '@/components/DashboardNav';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { mockDeals, mockSearchSuggestions } from '@/lib/mocks';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const userName = 'João';

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/resultados?q=${encodeURIComponent(query)}`);
    }
  };

  const categories = [
    { id: 'electronics', name: 'Eletrônicos', icon: Smartphone, color: 'bg-blue-500' },
    { id: 'fashion', name: 'Moda', icon: Shirt, color: 'bg-purple-500' },
    { id: 'home', name: 'Casa', icon: Home, color: 'bg-green-500' },
    { id: 'sports', name: 'Esportes', icon: Dumbbell, color: 'bg-orange-500' },
  ];

  const quickCategories = mockSearchSuggestions;

  const todayDeals = mockDeals;

  return (
    <div className='min-h-screen flex flex-col bg-background'>
      <DashboardNav
        onSearch={handleSearch}
        userName={userName}
        showSearch={false}
        onNotificationsClick={() => setShowNotifications(true)}
      />

      {/* Hero Section */}
      <section className='py-12 px-4 sm:px-6 lg:px-8 bg-gradient-hero'>
        <div className='container mx-auto'>
          <div className='max-w-4xl mx-auto text-center'>
            <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in-up'>
              Olá, {userName}!
              <br />
              <span className='gradient-text'>O que você procura hoje?</span>
            </h1>
            <p className='text-lg text-muted-foreground mb-8 animate-fade-in-up'>
              Encontre os melhores preços em milhares de produtos
            </p>

            {/* Main Search */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(searchQuery);
              }}
              className='max-w-2xl mx-auto mb-6 animate-fade-in-up'
            >
              <div className='flex items-center gap-2'>
                <div className='relative flex-1'>
                  <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground' />
                  <Input
                    type='search'
                    placeholder='Busque produtos, marcas ou categorias...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-14 pr-4 h-16 text-lg shadow-lg'
                  />
                </div>
                <Button
                  type='submit'
                  variant='gradient'
                  size='lg'
                  className='h-16 px-8 transition-transform hover:scale-[1.02]'
                >
                  Buscar
                </Button>
              </div>
            </form>

            {/* Quick Categories */}
            <div className='flex flex-wrap justify-center gap-2 animate-fade-in-up'>
              {quickCategories.map((cat) => (
                <Button
                  key={cat}
                  variant='outline'
                  size='sm'
                  onClick={() => handleSearch(cat)}
                  className='rounded-full'
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Favorite Categories */}
      <section className='py-12 px-4 sm:px-6 lg:px-8 bg-background'>
        <div className='container mx-auto'>
          <h2 className='text-2xl sm:text-3xl font-bold text-foreground mb-6'>
            Suas Categorias Favoritas
          </h2>

          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
            {categories.map((category) => (
              <Card
                key={category.id}
                className='glass hover-lift cursor-pointer group'
                onClick={() => navigate(`/resultados?categoria=${category.id}`)}
              >
                <CardContent className='p-6 text-center'>
                  <div
                    className={`w-16 h-16 rounded-xl ${category.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-glow transition-all`}
                  >
                    <category.icon className='h-8 w-8 text-white' />
                  </div>
                  <h3 className='font-semibold text-foreground mb-2'>{category.name}</h3>
                  <Button variant='ghost' size='sm' className='text-primary'>
                    Ver ofertas →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Deals */}
      <section className='py-12 px-4 sm:px-6 lg:px-8 bg-gradient-subtle'>
        <div className='container mx-auto'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2'>
              <Zap className='h-7 w-7 text-accent' />
              Ofertas do Dia
            </h2>
            <Button variant='outline' onClick={() => handleSearch('ofertas')}>
              Ver todas
            </Button>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {todayDeals.map((deal, index) => (
              <Card key={index} className='glass hover-lift cursor-pointer group'>
                <CardContent className='p-0'>
                  {/* Product Image Placeholder */}
                  <div className='h-48 bg-gradient-subtle rounded-t-lg flex items-center justify-center'>
                    <Smartphone className='h-20 w-20 text-primary/40 group-hover:text-primary/60 transition-colors' />
                  </div>

                  {/* Product Info */}
                  <div className='p-4'>
                    <div className='flex items-start justify-between mb-2'>
                      <h3 className='font-semibold text-sm leading-tight flex-1'>{deal.name}</h3>
                      <Badge variant='destructive' className='ml-2'>
                        -{deal.discount}%
                      </Badge>
                    </div>

                    <div className='mb-3'>
                      <div className='text-xs text-muted-foreground line-through'>
                        {deal.oldPrice.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </div>
                      <div className='text-xl font-bold text-accent'>
                        {deal.newPrice.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </div>
                      <div className='text-xs text-muted-foreground mt-1'>em {deal.store}</div>
                    </div>

                    <Button variant='gradient' size='sm' className='w-full' onClick={() => handleSearch(deal.name)}>
                      Ver Ofertas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Notifications Sheet */}
      <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
        <SheetContent side='left' className='w-96 p-0' hideClose>
          <div className='bg-gradient-primary text-white p-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center'>
                <Bell className='h-5 w-5' />
              </div>
              <div>
                <div className='text-sm font-semibold'>Central de Notificações</div>
                <div className='text-xs opacity-80'>Atualizações e alertas do Opty</div>
              </div>
            </div>
            <button className='rounded-md hover:bg-white/10 p-2' aria-label='Fechar' onClick={() => setShowNotifications(false)}>
              <X className='h-5 w-5' />
            </button>
          </div>
          <div className='p-4 space-y-3'>
            <div className='glass p-4 rounded-xl border border-primary/20'>
              <div className='flex items-center justify-between mb-1'>
                <div className='text-sm font-medium'>Promoções em Smartphones</div>
                <span className='text-xs text-muted-foreground'>agora</span>
              </div>
              <p className='text-sm text-muted-foreground'>Novas ofertas disponíveis. Confira as melhores opções.</p>
              <Button variant='gradient' size='sm' className='mt-3 w-full' onClick={() => handleSearch('Smartphones')}>Ver ofertas</Button>
            </div>
            <div className='glass p-4 rounded-xl border border-primary/20'>
              <div className='flex items-center justify-between mb-1'>
                <div className='text-sm font-medium'>Alerta de preço</div>
                <span className='text-xs text-muted-foreground'>há 2h</span>
              </div>
              <p className='text-sm text-muted-foreground'>O preço de iPhone 15 Pro baixou nas lojas parceiras.</p>
              <Button variant='outline' size='sm' className='mt-3 w-full' onClick={() => handleSearch('iPhone 15 Pro')}>Comparar preços</Button>
            </div>
            <div className='glass p-4 rounded-xl border border-primary/20'>
              <div className='flex items-center justify-between mb-1'>
                <div className='text-sm font-medium'>Favoritos atualizados</div>
                <span className='text-xs text-muted-foreground'>ontem</span>
              </div>
              <p className='text-sm text-muted-foreground'>Novidades nas suas lojas favoritas.</p>
              <Button variant='ghost' size='sm' className='mt-3 w-full' onClick={() => navigate('/resultados?q=favoritos')}>Ver atualizações</Button>
            </div>
            <div className='flex gap-2 pt-2'>
              <Button variant='outline' className='flex-1' onClick={() => setShowNotifications(false)}>Fechar</Button>
              <Button variant='gradient' className='flex-1' onClick={() => navigate('/configuracoes')}>Configurar</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* How It Works */}
      <section className='py-12 px-4 sm:px-6 lg:px-8 bg-background'>
        <div className='container mx-auto'>
          <h2 className='text-2xl sm:text-3xl font-bold text-foreground text-center mb-12'>
            Como Funciona
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto'>
            <div className='text-center'>
              <div className='w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow'>
                <Search className='h-8 w-8 text-white' />
              </div>
              <h3 className='font-semibold text-lg mb-2'>1. Busque o produto</h3>
              <p className='text-muted-foreground'>
                Digite o que você procura e nossa IA encontra as melhores opções
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 shadow-lg'>
                <TrendingDown className='h-8 w-8 text-white' />
              </div>
              <h3 className='font-semibold text-lg mb-2'>2. Compare preços</h3>
              <p className='text-muted-foreground'>
                Veja ofertas de centenas de lojas lado a lado em segundos
              </p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow'>
                <PiggyBank className='h-8 w-8 text-white' />
              </div>
              <h3 className='font-semibold text-lg mb-2'>3. Economize dinheiro</h3>
              <p className='text-muted-foreground'>
                Escolha a melhor oferta e economize até 40% nas suas compras
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer loggedIn />
    </div>
  );
};

export default Dashboard;
