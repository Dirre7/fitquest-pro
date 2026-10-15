import { StrictMode, Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FitQuest Pro Root Error caught:', error, errorInfo);
  }

  handleReload = () => {
    try {
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#09090b',
          color: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '420px',
            width: '100%',
            backgroundColor: '#121214',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              margin: '0 auto 16px auto'
            }}>
              ⚡
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px 0', color: '#fff' }}>
              FitQuest Pro
            </h2>
            <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Se ha producido una inconsistencia temporal de sincronización o caché. Pulsa para recargar y sincronizar con la nube.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                color: '#000',
                fontWeight: 800,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              Reiniciar y Actualizar App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);

// Register PWA Service Worker
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration note:', err);
    });
  });
}

