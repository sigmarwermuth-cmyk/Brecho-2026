import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error } = await signIn(email, password);
    setSubmitting(false);

    if (error) {
      setError(error === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error);
      return;
    }

    navigate('/');
  }

  return (
    <div className="min-h-screen bg-[#EDE8DD] flex">
      <div className="hidden lg:flex lg:w-5/12 bg-[#2F4A3B] text-[#EDE8DD] flex-col justify-between p-12">
        <span className="text-lg">Brechó</span>
        <div>
          <h1 className="font-serif text-5xl leading-[1.1] mb-4">
            Roupas com
            <br />
            história pra contar.
          </h1>
          <p className="text-[#C9C2AE] max-w-sm">
            Entre na sua conta pra continuar comprando e vendendo peças que merecem uma segunda vida.
          </p>
        </div>
        <span className="text-sm text-[#9BA893]">Peça a peça, um guarda-roupa mais consciente.</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="font-serif text-3xl text-[#26221C] mb-1">Entrar</h2>
          <p className="text-[#5C5647] mb-8">
            Ainda não tem conta?{' '}
            <Link to="/register" className="text-[#2F4A3B] underline underline-offset-2">
              Cadastre-se
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm text-[#5C5647] mb-1">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#C9C2AE] bg-transparent px-3 py-2 text-[#26221C] focus:outline-none focus:border-[#2F4A3B]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-[#5C5647] mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#C9C2AE] bg-transparent px-3 py-2 text-[#26221C] focus:outline-none focus:border-[#2F4A3B]"
              />
            </div>

            {error && <p className="text-sm text-[#B3432B]">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#B98B2A] text-[#26221C] font-medium py-2.5 hover:bg-[#a67b23] transition-colors disabled:opacity-60"
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
