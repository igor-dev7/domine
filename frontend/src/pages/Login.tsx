import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { SignInPage, type Testimonial } from '@/components/ui/sign-in';
import type { ErroResponse, LoginResponse } from '@/types';

const testimonials: Testimonial[] = [
  {
    avatarSrc: 'https://i.pravatar.cc/100?img=12',
    name: 'Marina Silva',
    handle: '@marina.silva',
    text: 'O Domine simplificou totalmente o controle de chamados aqui no setor.',
  },
  {
    avatarSrc: 'https://i.pravatar.cc/100?img=33',
    name: 'Carlos Souza',
    handle: '@carlossz',
    text: 'Em menos de uma semana, todo o time já estava usando.',
  },
  {
    avatarSrc: 'https://i.pravatar.cc/100?img=68',
    name: 'Vinicios Reis',
    handle: '@vinireis',
    text: 'Inventário e helpdesk no mesmo lugar — exatamente o que faltava.',
  },
];

const heroVideoSrc = '/video-login/himichael3685_pindown.io_1778864485.mp4';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const mutation = useMutation({
    mutationFn: async (data: { email: string; senha: string }) => {
      const res = await api.post<LoginResponse>('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      login(data.token, data.usuario);
      navigate('/dashboard', { replace: true });
    },
    onError: (error: AxiosError<ErroResponse>) => {
      const msg = error.response?.data?.mensagens?.[0] ?? 'Erro ao fazer login.';
      toast.error(msg);
    },
  });

  function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = ((formData.get('email') as string) ?? '').trim();
    const senha = (formData.get('password') as string) ?? '';
    if (!email || !senha) {
      toast.error('Preencha email e senha.');
      return;
    }
    mutation.mutate({ email, senha });
  }

  return (
    <SignInPage
      title={
        <span className="flex flex-col items-start gap-4">
          <Logo variant="completo" cor="degrade" height={36} />
          <span className="font-light text-ink-strong tracking-tighter whitespace-nowrap">
            Bem-vindo de volta!
          </span>
        </span>
      }
      description="Acesse sua conta no Domine e gerencie seus ativos"
      heroVideoSrc={heroVideoSrc}
      testimonials={testimonials}
      onSignIn={handleSignIn}
      onMicrosoftSignIn={() => toast.info('SSO Microsoft em breve.')}
      onResetPassword={() => toast.info('Reset de senha em breve.')}
      onCreateAccount={() => toast.info('Cadastro fechado para o ExpoTech 2026.')}
    />
  );
}
