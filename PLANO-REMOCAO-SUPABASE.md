# Plano de Remoção do Supabase

Este documento descreve o plano para remover completamente a integração com o Supabase e substituí-la por um banco de dados interno usando IndexedDB.

## Arquivos e Pastas a Serem Removidos

### Arquivos de Configuração
- `src/config/supabase.ts` - Configuração do cliente Supabase

### Hooks Relacionados ao Supabase
- `src/hooks/useSupabaseAuth.ts` - Hook de autenticação do Supabase
- `src/hooks/useSupabaseDB.ts` - Hook de operações de banco de dados do Supabase

### Tipos Relacionados ao Supabase
- `src/types/supabase.ts` - Definições de tipos para o Supabase

### Pasta do Supabase
- `supabase/` - Pasta contendo scripts de gerenciamento e migrações do Supabase
  - `migrations/` - Scripts SQL de migração
  - `*.sql` - Arquivos SQL diversos
  - `manage_database.bat` e `manage_database.sh` - Scripts de gerenciamento
  - Arquivos README relacionados ao Supabase

### Documentação
- `docs/supabase-auth.md` - Documentação sobre autenticação com Supabase

## Dependências a Serem Removidas
- `@supabase/supabase-js` - Cliente JavaScript do Supabase

## Arquivos Já Modificados

### Componentes
- `src/components/LoginForm.tsx` - Modificado para usar autenticação local

### Contextos
- `src/contexts/AppContext.tsx` - Modificado para usar banco de dados local

### Componentes de Status
- `src/components/DBStatus.tsx` - Modificado para exibir status do banco de dados local

## Arquivos Criados para Substituição

### Configuração do IndexedDB
- `src/config/indexedDB.ts` - Configuração do banco de dados IndexedDB

### Hooks para Banco de Dados Local
- `src/hooks/useIndexedDB.ts` - Hook para operações no IndexedDB
- `src/hooks/useLocalAuth.ts` - Hook para autenticação local

## Próximos Passos

1. Verificar se todos os componentes estão funcionando corretamente com o banco de dados local
2. Remover as variáveis de ambiente relacionadas ao Supabase do arquivo `.env`
3. Remover a dependência `@supabase/supabase-js` do `package.json`
4. Excluir todos os arquivos e pastas listados acima
5. Executar testes para garantir que a aplicação funcione corretamente sem o Supabase

## Observações

- Todos os dados serão armazenados localmente no navegador do usuário
- A autenticação será gerenciada localmente
- As operações de banco de dados serão realizadas através do IndexedDB
- Não será mais necessário um servidor externo para armazenamento de dados