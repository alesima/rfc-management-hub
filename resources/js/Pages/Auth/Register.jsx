import AuthSplitLayout from '@/Layouts/AuthSplitLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';

const inputClass =
    'mt-1 block w-full rounded-xl border-gray-300 shadow-sm px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthSplitLayout>
            <Head title="Register" />

            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 mt-1 mb-6">
                Get a personal team workspace in seconds.
            </p>

            <form onSubmit={submit}>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        value={data.name}
                        autoComplete="name"
                        autoFocus
                        required
                        onChange={(e) => setData('name', e.target.value)}
                        className={inputClass}
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        required
                        onChange={(e) => setData('email', e.target.value)}
                        className={inputClass}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            autoComplete="new-password"
                            required
                            onChange={(e) => setData('password', e.target.value)}
                            className={inputClass}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                            Confirm
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            required
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className={inputClass}
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-6 w-full px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    {processing ? 'Creating account...' : 'Create account'}
                </button>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already registered?{' '}
                    <Link href={route('login')} className="text-indigo-600 hover:text-indigo-800 font-semibold">
                        Sign in
                    </Link>
                </p>
            </form>
        </AuthSplitLayout>
    );
}
