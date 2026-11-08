import Checkbox from '@/Components/Checkbox';
import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';

const inputClass =
    'mt-1 block w-full rounded-xl border-gray-300 shadow-sm px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthSplitLayout>
            <Head title="Log in" />

            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-1 mb-6">
                Sign in to review and vote on RFCs.
            </p>

            {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

            <form onSubmit={submit}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        className={inputClass}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        className={inputClass}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between mt-4">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-6 w-full px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    {processing ? 'Signing in...' : 'Sign in'}
                </button>

                <p className="mt-6 text-center text-sm text-gray-600">
                    New here?{' '}
                    <Link href={route('register')} className="text-indigo-600 hover:text-indigo-800 font-semibold">
                        Create an account
                    </Link>
                </p>
            </form>
        </AuthSplitLayout>
    );
}
