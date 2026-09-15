import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setSubmitting(true);
    const { error } = await signUp(email, password, name);
    setSubmitting(false);

    if (error) {
      setError(error);
      return;
    }

    setNotice('Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.');
  }

  return (
    <div className="min-h-screen bg-[#EDE8DD] flex">
      <div className="hidden lg:flex lg:w-5/12 bg-[#2F4A3B] text-[#EDE8DD] flex-col justify-between p-12">
        <span className="text-lg">Brechó</span>
        <div>
          <h1 className="font-serif text-5xl leading-[1.1] mb-4">
            Toda peça
            <br />
            merece um novo dono.
          </h1>
          <p className="text-[#C9C2AE] max-w-sm">
            Crie sua conta pra anunciar o que não usa mais e encontrar achados únicos.
          </p>
        </div>
        <span className="text-sm text-[#9BA893]">Peça a peça, um guarda-roupa mais consciente.</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="font-serif text-3xl text-[#26221C] mb-1">Criar conta</h2>
          <p className="text-[#5C5647] mb-8">
            Já tem conta?{' '}
            <Link to="/login" className="text-[#2F4A3B] underline underline-offset-2">
              Entrar
            </Link>
          </p>

          {notice ? (
            <p className="text-sm text-[#2F4A3B] bg-[#DCE5DA] border border-[#2F4A3B]/30 px-3 py-3">{notice}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm text-[#5C5647] mb-1">
                  Nome
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-[#C9C2AE] bg-transparent px-3 py-2 text-[#26221C] focus:outline-none focus:border-[#2F4A3B]"
                />
              </div>

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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm text-[#5C5647] mb-1">
                  Confirmar senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-[#C9C2AE] bg-transparent px-3 py-2 text-[#26221C] focus:outline-none focus:border-[#2F4A3B]"
                />
              </div>

              {error && <p className="text-sm text-[#B3432B]">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#B98B2A] text-[#26221C] font-medium py-2.5 hover:bg-[#a67b23] transition-colors disabled:opacity-60"
              >
                {submitting ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
