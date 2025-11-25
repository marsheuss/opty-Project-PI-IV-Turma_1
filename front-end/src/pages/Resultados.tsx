import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import DashboardNav from '@/components/DashboardNav';
import { Bell } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { mockStores, mockProducts } from '@/lib/mocks';

const Resultados = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || 'iPhone 15 Pro';

  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 10000,
    stores: [] as string[],
    condition: 'all',
  });

  const [sortBy, setSortBy] = useState('lowest-price');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const stores = mockStores;
  const [showNotifications, setShowNotifications] = useState(false);

  const products = mockProducts;

  const normalize = (s: string) => s.toLowerCase().replace(/\s/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const storeNameToId = (name: string) => {
    const n = normalize(name);
    const match = stores.find((st) => normalize(st.name) === n || st.id === n);
    return match?.id || n;
  };

  const filteredProducts = products
    .map((product) => {
      const filteredOffers = product.offers.filter((offer) => {
        const inRange = offer.price >= filters.priceMin && offer.price <= filters.priceMax;
        const offerStoreId = storeNameToId(offer.store);
        const storeMatch = filters.stores.length === 0 || filters.stores.includes(offerStoreId);
        const cond = normalize(offer.condition);
        const conditionMatch =
          filters.condition === 'all' ||
          (filters.condition === 'new' && cond.includes('novo')) ||
          (filters.condition === 'used' && (cond.includes('usado') || cond.includes('seminovo')));
        return inRange && storeMatch && conditionMatch;
      });
      return { ...product, offers: filteredOffers };
    })
    .filter((p) => p.offers.length > 0)
    .sort((a, b) => {
      switch (sortBy) {
        case 'lowest-price':
          return Math.min(...a.offers.map((o) => o.price)) - Math.min(...b.offers.map((o) => o.price));
        case 'highest-price':
          return Math.max(...b.offers.map((o) => o.price)) - Math.max(...a.offers.map((o) => o.price));
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const toggleStore = (storeId: string) => {
    setFilters((prev) => ({
      ...prev,
      stores: prev.stores.includes(storeId)
        ? prev.stores.filter((id) => id !== storeId)
        : [...prev.stores, storeId],
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceMin: 0,
      priceMax: 10000,
      stores: [],
      condition: 'all',
    });
  };

  const FilterContent = () => (
    <div className='space-y-6'>
      {/* Clear Filters */}
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold text-lg'>Filtros</h3>
        <Button variant='ghost' size='sm' onClick={clearFilters}>
          Limpar
        </Button>
      </div>

      {/* Price Range */}
      <div>
        <Label className='mb-3 block font-semibold'>Faixa de Preço</Label>
        <div className='space-y-4'>
          <div className='flex gap-2'>
            <div className='flex-1'>
              <Label className='text-xs text-muted-foreground mb-1 block'>Mínimo</Label>
              <Input
                type='number'
                value={filters.priceMin}
                onChange={(e) => setFilters({ ...filters, priceMin: Number(e.target.value) })}
                className='h-9'
              />
            </div>
            <div className='flex-1'>
              <Label className='text-xs text-muted-foreground mb-1 block'>Máximo</Label>
              <Input
                type='number'
                value={filters.priceMax}
                onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) })}
                className='h-9'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stores Filter */}
      <div>
        <Label className='mb-3 block font-semibold'>
          Lojas {filters.stores.length > 0 && `(${filters.stores.length})`}
        </Label>
        <div className='space-y-2'>
          {stores.map((store) => (
            <div key={store.id} className='flex items-center space-x-2'>
              <Checkbox
                id={store.id}
                checked={filters.stores.includes(store.id)}
                onCheckedChange={() => toggleStore(store.id)}
              />
              <Label htmlFor={store.id} className='cursor-pointer font-normal'>
                {store.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Condition Filter */}
      <div>
        <Label className='mb-3 block font-semibold'>Condição</Label>
        <RadioGroup value={filters.condition} onValueChange={(val) => setFilters({ ...filters, condition: val })}>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='all' id='all' />
            <Label htmlFor='all' className='cursor-pointer font-normal'>
              Todos
            </Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='new' id='new' />
            <Label htmlFor='new' className='cursor-pointer font-normal'>
              Novo
            </Label>
          </div>
          <div className='flex items-center space-x-2'>
            <RadioGroupItem value='used' id='used' />
            <Label htmlFor='used' className='cursor-pointer font-normal'>
              Seminovo/Usado
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen flex flex-col bg-gradient-soft'>
      <DashboardNav userName='João' showSearch={true} onNotificationsClick={() => setShowNotifications(true)} />

      {/* Breadcrumb */}
      <div className='border-b border-border bg-muted/30'>
        <div className='container mx-auto px-4 py-3'>
          <div className='flex items-center gap-2 text-sm'>
            <Link to='/dashboard' className='text-muted-foreground hover:text-primary'>
              Dashboard
            </Link>
            <ChevronRight className='h-4 w-4 text-muted-foreground' />
            <span className='text-foreground font-medium'>Resultados para '{searchQuery}'</span>
          </div>
        </div>
      </div>

      <div className='flex-1 container mx-auto px-4 py-6'>
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Filters Sidebar - Desktop */}
          <aside className='hidden lg:block w-80 flex-shrink-0'>
            <div className='sticky top-24 glass p-6 rounded-xl'>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <main className='flex-1'>
            {/* Header */}
            <div className='mb-6'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
                <div>
                  <h1 className='text-2xl sm:text-3xl font-bold text-foreground mb-2'>
                    Resultados para: <span className='gradient-text'>{searchQuery}</span>
                  </h1>
                  <p className='text-muted-foreground'>
                    Encontramos {filteredProducts.length} produtos em {stores.length} lojas
                  </p>
                </div>

                {/* Mobile Filters Button */}
                <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                  <SheetTrigger asChild>
                    <Button variant='outline' className='lg:hidden'>
                      <SlidersHorizontal className='h-4 w-4 mr-2' />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side='left' className='w-80'>
                    <SheetHeader>
                      <SheetTitle>Filtros de Busca</SheetTitle>
                    </SheetHeader>
                    <div className='mt-6'>
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Sort */}
              <div className='flex items-center gap-4'>
                <Label className='text-sm font-medium'>Ordenar por:</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className='w-[200px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='lowest-price'>Menor Preço</SelectItem>
                    <SelectItem value='highest-price'>Maior Preço</SelectItem>
                    <SelectItem value='best-rating'>Melhor Avaliação</SelectItem>
                    <SelectItem value='most-sold'>Mais Vendidos</SelectItem>
                    <SelectItem value='alphabetical'>Ordem Alfabética (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            <div className='space-y-4'>
              {filteredProducts.map((product, index) => (
                <ProductCard key={index} name={product.name} offers={product.offers} />
              ))}
            </div>

            {/* Empty State (if needed) */}
            {filteredProducts.length === 0 && (
              <div className='text-center py-12'>
                <div className='text-6xl mb-4'>🔍</div>
                <h3 className='text-xl font-semibold mb-2'>Nenhum resultado encontrado</h3>
                <p className='text-muted-foreground mb-4'>
                  Tente buscar por outro termo ou ajuste os filtros
                </p>
                <Button variant='gradient' onClick={() => window.location.href = '/dashboard'}>
                  Voltar ao Dashboard
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer loggedIn />
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
                <div className='text-sm font-medium'>Novas ofertas</div>
                <span className='text-xs text-muted-foreground'>agora</span>
              </div>
              <p className='text-sm text-muted-foreground'>Veja as melhores ofertas relacionadas à sua busca.</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Resultados;
