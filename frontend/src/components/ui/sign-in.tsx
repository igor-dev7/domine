import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// --- HELPER COMPONENTS (ICONS) ---

const MicrosoftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 23 23">
    <path fill="#f25022" d="M1 1h10v10H1z" />
    <path fill="#7fba00" d="M12 1h10v10H12z" />
    <path fill="#00a4ef" d="M1 12h10v10H1z" />
    <path fill="#ffb900" d="M12 12h10v10H12z" />
  </svg>
);

// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  heroVideoSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onMicrosoftSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-hairline bg-ink/5 backdrop-blur-sm transition-colors focus-within:border-primary/70 focus-within:bg-primary/10">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial; delay: string }) => (
  <div
    className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-canvas-soft/40 backdrop-blur-xl border border-hairline/40 p-5 w-64`}
  >
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium">{testimonial.name}</p>
      <p className="text-mute">{testimonial.handle}</p>
      <p className="mt-1 text-ink/80">{testimonial.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-light text-ink-strong tracking-tighter">Bem-vindo</span>,
  description = 'Acesse sua conta e continue sua jornada conosco',
  heroImageSrc,
  heroVideoSrc,
  testimonials = [],
  onSignIn,
  onMicrosoftSignIn,
  onResetPassword,
  onCreateAccount,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw]">
      {/* Coluna esquerda: formulário */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">
              {title}
            </h1>
            <p className="animate-element animate-delay-200 text-mute -mt-4">{description}</p>

            <form className="space-y-5 mt-4" onSubmit={onSignIn}>
              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-mute">Email</label>
                <GlassInputWrapper>
                  <input
                    name="email"
                    type="email"
                    placeholder="Digite seu email"
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-mute">Senha</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-mute hover:text-ink transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-mute hover:text-ink transition-colors" />
                      )}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="rememberMe" className="custom-checkbox" />
                  <span className="text-ink/90">Manter conectado</span>
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onResetPassword?.();
                  }}
                  className="hover:underline text-primary transition-colors"
                >
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                className="animate-element animate-delay-600 w-full rounded-2xl py-4 font-medium text-on-primary bg-gradient-to-t from-primary-deep via-primary to-primary-soft hover:from-primary hover:via-primary-soft hover:to-primary-soft transition-all duration-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),0_2px_4px_rgba(37,99,235,0.25)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_4px_12px_rgba(37,99,235,0.4)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
              >
                Entrar
              </button>
            </form>

            <div className="animate-element animate-delay-700 relative flex items-center justify-center">
              <span className="w-full border-t border-hairline"></span>
              <span className="px-4 text-sm text-mute bg-canvas absolute">ou continue com</span>
            </div>

            <button
              onClick={onMicrosoftSignIn}
              className="animate-element animate-delay-800 w-full flex items-center justify-center gap-3 border border-hairline rounded-2xl py-4 hover:bg-canvas-soft transition-colors"
            >
              <MicrosoftIcon />
              Continuar com Microsoft
            </button>

            <p className="animate-element animate-delay-900 text-center text-sm text-mute">
              Novo por aqui?{' '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onCreateAccount?.();
                }}
                className="text-primary hover:underline transition-colors"
              >
                Criar conta
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Coluna direita: vídeo/imagem + depoimentos */}
      {(heroVideoSrc || heroImageSrc) && (
        <section className="hidden md:block flex-1 relative p-4">
          {heroVideoSrc ? (
            <video
              key={heroVideoSrc}
              className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl object-cover w-[calc(100%-2rem)] h-[calc(100%-2rem)]"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src={heroVideoSrc} type="video/mp4" />
            </video>
          ) : (
            <div
              className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImageSrc})` }}
            ></div>
          )}
          {testimonials.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
              <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
              {testimonials[1] && (
                <div className="hidden xl:flex">
                  <TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" />
                </div>
              )}
              {testimonials[2] && (
                <div className="hidden 2xl:flex">
                  <TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" />
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
