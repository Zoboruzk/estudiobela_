export default function TenantNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-3xl text-foreground">
          Negócio não encontrado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Não encontramos nenhum estabelecimento configurado para este
          endereço. Verifique o link ou entre em contato com o suporte.
        </p>
      </div>
    </div>
  );
}
