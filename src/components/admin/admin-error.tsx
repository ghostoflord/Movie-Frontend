export function AdminErrorBox({ message }: { message: string }) {
    return (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-6 text-center text-sm text-red-200">
            {message}
        </div>
    );
}

