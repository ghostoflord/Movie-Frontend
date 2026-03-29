import { AuthScaffold } from '@/components/auth/auth-scaffold';

export default function ForgotPasswordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AuthScaffold>{children}</AuthScaffold>;
}
