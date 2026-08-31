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
  AlertCircle 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSuccess: (userId: string, name: string, email?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, lang, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Por favor, ingresa tu nombre de atleta.');
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
          onClose();
        }
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        if (cred.user) {
          onSuccess(
            cred.user.uid, 
            cred.user.displayName || cred.user.email?.split('@')[0] || 'Atleta', 
            cred.user.email || undefined
          );
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Auth error', err);
      let msg = 'Error en la autenticación. Por favor revisa tus credenciales.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Este correo ya está registrado. Inicia sesión en su lugar.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'Correo o contraseña incorrectos.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'El formato del correo electrónico no es válido.';
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
        onClose();
      }
    } catch (err: any) {
      console.error('Google auth error', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('No se pudo completar el inicio con Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-[#121214] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <Dumbbell className="w-7 h-7" />
          </div>
          <h2 className="font-display font-black text-2xl text-white">
            {isSignUp ? 'Crear Perfil de Atleta' : 'Iniciar Sesión'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
            {isSignUp 
              ? 'Empieza tu aventura desde cero. Guarda tus marcas, volumen, rachas y XP en la nube.'
              : 'Accede a tus datos de entrenamiento, progreso y récords guardados.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-2.5 text-xs text-red-400 relative z-10 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-400 mb-1 uppercase">
                Nombre o Apodo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
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
            <label className="block text-[11px] font-mono font-bold text-neutral-400 mb-1 uppercase">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
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
            <label className="block text-[11px] font-mono font-bold text-neutral-400 mb-1 uppercase">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-[#09090b] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 focus:border-cyan-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-neutral-950 font-mono font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse font-mono">Conectando con la nube...</span>
            ) : (
              <>
                <span>{isSignUp ? 'Crear Cuenta y Empezar desde 0' : 'Entrar a mi Cuenta'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-4 items-center z-10">
          <div className="flex-grow border-t border-white/10" />
          <span className="flex-shrink mx-3 text-[10px] font-mono text-neutral-500 uppercase">o con Google</span>
          <div className="flex-grow border-t border-white/10" />
        </div>

        {/* Google Provider Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono font-semibold text-xs flex items-center justify-center gap-3 transition-colors relative z-10"
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

        {/* Toggle Login / SignUp Mode */}
        <div className="mt-5 text-center relative z-10">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿Eres nuevo atleta? Regístrate gratis'}
          </button>
        </div>

        {/* Close Button */}
        <div className="mt-3 text-center relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Continuar como invitado local
          </button>
        </div>
      </div>
    </div>
  );
};
