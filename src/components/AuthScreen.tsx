import React, { useState } from 'react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  googleProvider,
  updateProfile
} from '../lib/firebase';
import { translations } from '../lib/i18n';
import { Language } from '../types';
import { 
  Dumbbell, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Flame, 
  CheckCircle2, 
  AlertCircle,
  Trophy,
  Zap,
  Activity,
  Heart,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthScreenProps {
  lang: Language;
  onSuccess: (userId: string, name: string, email?: string) => void;
  onContinueGuest: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ lang, onSuccess, onContinueGuest }) => {
  const [isSignUp, setIsSignUp] = useState(true); // Default to register so new users register first!
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Por favor, introduce tu nombre o apodo de atleta.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres.');
          setLoading(false);
          return;
        }

        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (cred.user) {
          await updateProfile(cred.user, { displayName: name.trim() });
          onSuccess(cred.user.uid, name.trim(), cred.user.email || undefined);
        }
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (cred.user) {
          onSuccess(
            cred.user.uid, 
            cred.user.displayName || cred.user.email?.split('@')[0] || 'Atleta', 
            cred.user.email || undefined
          );
        }
      }
    } catch (err: any) {
      console.error('Auth error', err);
      let msg = err.message || 'Error al autenticar.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Este correo ya está registrado. Haz clic en "Iniciar Sesión" arriba.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = isSignUp
          ? 'Error al crear la cuenta. Por favor verifica los datos.'
          : 'Credenciales no encontradas. Si eres nuevo, haz clic en la pestaña "Crear Cuenta (Registro)" de arriba.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'El formato del correo electrónico no es válido.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'La contraseña es demasiado débil. Usa al menos 6 caracteres.';
      } else if (err.code === 'auth/unauthorized-domain') {
        msg = 'Dominio de Vercel no autorizado en Firebase Auth. Añade tu dominio de Vercel en la consola de Firebase (Authentication > Settings > Authorized domains) o entra como Invitado Local.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'El proveedor de autenticación no está habilitado en la consola de Firebase.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        onSuccess(
          res.user.uid, 
          res.user.displayName || res.user.email?.split('@')[0] || 'Atleta', 
          res.user.email || undefined
        );
      }
    } catch (err: any) {
      console.error('Google auth error', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('Para usar Google en Vercel, agrega el dominio en Firebase Console (Authentication > Settings > Authorized Domains). Mientras tanto puedes registrarte con correo/contraseña o explorar como invitado.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'No se pudo completar el inicio de sesión con Google. Inténtalo creando tu cuenta con correo y contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* Background Cyber Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Gamified Value Pitch & Features */}
        <div className="lg:col-span-6 space-y-6 text-left">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>PLATAFORMA FITNESS GAMIFICADA PRO</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
              Sube de nivel tu físico en el <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Cyber Matrix</span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed">
              Crea tu perfil de atleta, registra entrenamientos en tiempo real, acumula XP, sube de rango y sincroniza tus marcas en la nube.
            </p>
          </div>

          {/* Key Value Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Progreso Real desde 0</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">Empiezas en Nivel 1 con estadísticas limpias y guardado en Firestore.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Rachas & Desafíos</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">Compite en ligas semanales y duelos 1v1 en tiempo real.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Telemetría Smartwatch</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">Frecuencia cardíaca en vivo, zonas de esfuerzo y cálculo de tonelaje.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Cloud Sync Seguro</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">Tus récords protegidos y accesibles desde cualquier dispositivo.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card Form */}
        <div className="lg:col-span-6">
          <div className="bg-[#121214]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Top Header inside Card */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-neutral-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                  <Dumbbell className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="font-display font-black text-lg text-white">
                    {isSignUp ? 'Registro de Nuevo Atleta' : 'Iniciar Sesión'}
                  </h2>
                  <p className="text-xs text-neutral-400">
                    {isSignUp ? 'Crea tu cuenta oficial en FitQuest Pro' : 'Accede a tu cuenta y continúa tu racha'}
                  </p>
                </div>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-neutral-900/80 p-1 rounded-2xl border border-white/5 mb-6">
              <button
                type="button"
                id="tab-auth-signup"
                onClick={() => {
                  setIsSignUp(true);
                  setError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  isSignUp
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Crear Cuenta (Registro)
              </button>
              <button
                type="button"
                id="tab-auth-signin"
                onClick={() => {
                  setIsSignUp(false);
                  setError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  !isSignUp
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-[11px] font-mono font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
                    Nombre o Apodo de Atleta *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-auth-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. David Guerrero"
                      className="w-full bg-[#09090b] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="atleta@correo.com"
                    className="w-full bg-[#09090b] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
                  Contraseña * {isSignUp && <span className="text-neutral-500 font-normal">(mínimo 6 caracteres)</span>}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#09090b] border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors p-1"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Submit Main Action Button */}
              <button
                id="btn-auth-submit"
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-mono font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-pulse font-mono">Conectando con la nube...</span>
                ) : (
                  <>
                    <span>{isSignUp ? 'Crear Perfil y Empezar desde Cero' : 'Acceder a mi Cuenta'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-white/10" />
              <span className="flex-shrink mx-3 text-[10px] font-mono text-neutral-500 uppercase">o con Google</span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            {/* Google Authentication Provider */}
            <button
              id="btn-auth-google"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono font-semibold text-xs flex items-center justify-center gap-3 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>

            {/* Guest Option */}
            <div className="mt-5 text-center border-t border-white/5 pt-4">
              <button
                type="button"
                id="btn-auth-guest"
                onClick={onContinueGuest}
                className="text-xs text-neutral-400 hover:text-cyan-400 font-mono transition-colors"
              >
                ¿Quieres probar primero? <span className="underline font-bold">Explorar como Invitado Local</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
