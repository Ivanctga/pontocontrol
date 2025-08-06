# Autenticação com Supabase

## Visão Geral

Este projeto utiliza o Supabase para autenticação de usuários e armazenamento de dados de perfil. A integração inclui:

1. **Autenticação de usuários** - Login, registro e recuperação de senha
2. **Perfis de usuário** - Armazenamento de dados complementares do perfil
3. **Armazenamento de imagens** - Upload e gerenciamento de imagens de perfil

## Fluxo de Autenticação

### Login

O processo de login utiliza o método `signInWithPassword` do Supabase Auth:

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'exemplo@email.com',
  password: 'senha123'
});
```

### Registro

O registro de novos usuários utiliza o método `signUp` do Supabase Auth:

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'exemplo@email.com',
  password: 'senha123',
  options: {
    data: {
      name: 'Nome Completo'
    }
  }
});
```

### Recuperação de Senha

A recuperação de senha utiliza o método `resetPasswordForEmail` do Supabase Auth:

```typescript
const { data, error } = await supabase.auth.resetPasswordForEmail('exemplo@email.com', {
  redirectTo: 'https://seusite.com/reset-password'
});
```

## Tabela de Perfis

A tabela `profiles` está vinculada à tabela `auth.users` do Supabase e armazena dados complementares do perfil de cada usuário:

| Campo | Tipo | Descrição |
|-------|------|------------|
| id | uuid | ID do usuário (referência à auth.users) |
| updated_at | timestamp | Data e hora da última atualização |
| name | text | Nome completo do usuário |
| role | text | Função/papel do usuário no sistema |
| profile_image | text | URL da imagem de perfil |
| created_at | timestamp | Data e hora de criação |

## Hooks Personalizados

### useSupabaseAuth

O hook `useSupabaseAuth` encapsula a lógica de autenticação e gerenciamento de perfil:

```typescript
const {
  user,
  profile,
  loading,
  signIn,
  signUp,
  signOut,
  updateProfile
} = useSupabaseAuth();
```

## Integração com o Contexto da Aplicação

A autenticação do Supabase foi integrada ao contexto existente da aplicação (`AppContext`) para manter a compatibilidade com o código existente, permitindo uma migração gradual do armazenamento local para o Supabase.

## Segurança

- As senhas são gerenciadas pelo Supabase Auth e nunca são armazenadas em texto simples
- Políticas de Row Level Security (RLS) garantem que os usuários só possam acessar e modificar seus próprios dados
- Tokens JWT são utilizados para autenticação

## Configuração

As variáveis de ambiente necessárias para a integração com o Supabase são:

```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

## Migração de Dados

Para migrar usuários existentes do armazenamento local para o Supabase:

1. Exporte os usuários do IndexedDB
2. Crie os usuários no Supabase Auth usando a API Admin
3. Insira os dados de perfil na tabela `profiles`

## Recursos Adicionais

- [Documentação do Supabase Auth](https://supabase.com/docs/guides/auth)
- [Gerenciamento de Dados de Usuário](https://supabase.com/docs/guides/auth/managing-user-data)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)