import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Send, Paperclip, Smile, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ChatMessage from '@/components/ChatMessage';
import { useToast } from '@/hooks/use-toast';
import { useClientChat } from '@/hooks/useClientChat';

const ChatCliente = () => {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    sendMessage: sendChatMessage,
    isConnected,
    sessionId,
    connect
  } = useClientChat();

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        (scrollContainer as HTMLElement).scrollTop = (scrollContainer as HTMLElement).scrollHeight;
      }
    }
    if (bottomRef.current && typeof bottomRef.current.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendChatMessage(message);
    setMessage('');
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const names = Array.from(files).map((f) => f.name).join(', ');
    sendChatMessage(`Anexo: ${names}`);
    e.target.value = '';
  };

  const insertEmoji = (emoji: string) => {
    setMessage((prev) => `${prev}${emoji}`);
  };

  return (
    <div className='min-h-screen flex flex-col bg-gradient-subtle'>
      {/* Header */}
      <header className='bg-background/80 backdrop-blur-xl border-b border-border shadow-sm'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            {/* Logo and Title */}
            <div className='flex items-center gap-4'>
              <Link to='/' className='flex items-center gap-2 group'>
                <div className='bg-gradient-primary p-2 rounded-lg shadow-md group-hover:shadow-glow transition-all duration-300'>
                  <Tag className='h-5 w-5 text-white' />
                </div>
                <span className='text-xl font-bold gradient-text hidden sm:block'>Opty</span>
              </Link>
              <div className='h-6 w-px bg-border hidden sm:block' />
              <h1 className='text-lg font-semibold text-foreground'>Suporte ao Cliente</h1>
            </div>

            {/* Status and Actions */}
            <div className='flex items-center gap-3'>
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full ${
                isConnected ? 'bg-accent/10' : 'bg-destructive/10'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-accent animate-pulse' : 'bg-destructive'
                }`} />
                <span className={`text-sm font-medium ${
                  isConnected ? 'text-accent' : 'text-destructive'
                }`}>
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              <Button variant='ghost' size='icon' className='lg:hidden'>
                <Menu className='h-5 w-5' />
              </Button>
              <Button variant='ghost' size='icon' asChild>
                <Link to='/'>
                  <LogOut className='h-5 w-5' />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Content */}
      <div className='flex-1 container mx-auto px-4 py-6 max-w-5xl'>
        <div className='h-full flex flex-col'>
          {/* Start Chat Screen - shown when not connected */}
          {!isConnected && !sessionId && (
            <div className='flex-1 flex items-center justify-center'>
              <Card className='p-8 glass max-w-md w-full text-center'>
                <div className='mb-6'>
                  <div className='bg-gradient-primary p-4 rounded-full inline-block mb-4'>
                    <Tag className='h-10 w-10 text-white' />
                  </div>
                  <h2 className='text-2xl font-bold mb-2'>Bem-vindo ao Suporte Opty</h2>
                  <p className='text-muted-foreground'>
                    Clique no botão abaixo para iniciar uma conversa com nossa equipe de suporte
                  </p>
                </div>
                <Button
                  variant='gradient'
                  size='lg'
                  className='w-full'
                  onClick={connect}
                >
                  Iniciar Chat
                </Button>
              </Card>
            </div>
          )}

          {/* Chat Interface - shown when connected */}
          {(isConnected || sessionId) && (
            <>
              {/* Ticket Info Card */}
              <Card className='mb-4 p-4 glass'>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <div className='flex items-center gap-4'>
                <div>
                  <div className='text-sm text-muted-foreground'>Sessão</div>
                  <div className='font-semibold text-xs'>
                    {sessionId ? `#${sessionId.substring(0, 8)}...` : 'Aguardando...'}
                  </div>
                </div>
                <div className='h-8 w-px bg-border' />
                <div>
                  <div className='text-sm text-muted-foreground'>Status</div>
                  <div className='font-semibold text-primary'>Em atendimento</div>
                </div>
                <div className='h-8 w-px bg-border hidden sm:block' />
                <div className='hidden sm:block'>
                  <div className='text-sm text-muted-foreground'>Tempo de espera</div>
                  <div className='font-semibold text-accent'>0 min</div>
                </div>
              </div>
              <div className='text-xs text-muted-foreground'>
                Atendente: <span className='font-medium text-foreground'>Supervisor João</span>
              </div>
            </div>
          </Card>

          {/* Messages Area */}
          <Card className='flex-1 glass flex flex-col overflow-hidden'>
            <ScrollArea className='flex-1 p-4 sm:p-6' ref={scrollAreaRef}>
              <div className='space-y-4'>
                {messages.length === 0 ? (
                  <div className='flex items-center justify-center h-full text-muted-foreground'>
                    Conectando ao servidor...
                  </div>
                ) : (
                  messages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      type={msg.type}
                      message={msg.message}
                      time={msg.time}
                      senderName={msg.senderName}
                    />
                  ))
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className='border-t border-border p-4 bg-background/50'>
              <div className='flex items-end gap-2'>
                <div className='flex gap-2'>
                  <input ref={fileInputRef} type='file' multiple className='hidden' onChange={handleFileChange} />
                  <Button type='button' variant='ghost' size='icon' className='flex-shrink-0' onClick={handleAttachClick}>
                    <Paperclip className='h-5 w-5' />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type='button' variant='ghost' size='icon' className='flex-shrink-0'>
                        <Smile className='h-5 w-5' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='start'>
                      <div className='grid grid-cols-6 gap-2 p-1 text-xl'>
                        {['😀','😂','😊','😍','😉','👍','🙏','🎉','🔥','💡','📎','💬'].map((e) => (
                          <DropdownMenuItem key={e} onClick={() => insertEmoji(e)}>{e}</DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className='flex-1 flex gap-2'>
                  <Input
                    placeholder='Digite sua mensagem...'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className='flex-1'
                  />
                  {sessionId && (
                    <Button type='button' variant='outline' asChild>
                      <Link to={`/chat/supervisor/${sessionId}`}>
                        Atendimento
                      </Link>
                    </Button>
                  )}
                  <Button
                    type='button'
                    variant='gradient'
                    size='icon'
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                  >
                    <Send className='h-5 w-5' />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatCliente;
