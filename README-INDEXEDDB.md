# Implementação do IndexedDB no Projeto

## Visão Geral

Este documento descreve a implementação do IndexedDB no projeto de controle de ponto, substituindo o armazenamento anterior baseado em localStorage. O IndexedDB é um banco de dados NoSQL orientado a objetos que permite armazenar grandes quantidades de dados estruturados, incluindo arquivos e blobs.

## Vantagens do IndexedDB sobre localStorage

- **Maior capacidade de armazenamento**: Enquanto o localStorage é limitado a cerca de 5-10MB, o IndexedDB pode armazenar muito mais dados (geralmente limitado apenas pelo espaço disponível no disco).
- **Armazenamento estruturado**: Permite armazenar objetos JavaScript completos, não apenas strings.
- **Suporte a transações**: Garante a integridade dos dados durante operações complexas.
- **Operações assíncronas**: Não bloqueia a thread principal durante operações de leitura/escrita.
- **Indexação**: Permite consultas mais eficientes por campos específicos.

## Estrutura Implementada

### 1. Configuração do Banco de Dados

O arquivo `src/config/indexedDB.ts` define a estrutura do banco de dados:

- **Nome do Banco**: TimesheetDB
- **Versão**: 1
- **Stores (Tabelas)**:
  - `users`: Armazena informações dos usuários
  - `timeEntries`: Armazena registros de ponto
  - `schedules`: Armazena agendamentos
  - `settings`: Armazena configurações do aplicativo

### 2. Hooks Personalizados

O arquivo `src/hooks/useIndexedDB.ts` fornece hooks React para interagir com o banco de dados:

- **Hooks básicos** para cada store: `useUsersDB`, `useTimeEntriesDB`, `useSchedulesDB`, `useSettingsDB`
- **Hook principal** `useAppDB`: Fornece uma API completa para todas as operações de banco de dados

### 3. Integração com o Contexto da Aplicação

O `AppContext.tsx` foi modificado para:

- Carregar dados do IndexedDB ao iniciar a aplicação
- Salvar alterações no IndexedDB quando o estado muda
- Migrar dados do localStorage para o IndexedDB (compatibilidade com versões anteriores)

## Como Usar

### Inicialização

O banco de dados é inicializado automaticamente no arquivo `main.tsx` usando:

```typescript
import { initDB } from 'react-indexed-db-hook';
import { indexedDBConfig } from './config/indexedDB';

initDB(indexedDBConfig);
```

### Acessando o Banco de Dados em Componentes

Para acessar o banco de dados em qualquer componente:

```typescript
import { useAppDB } from '../hooks/useIndexedDB';

function MeuComponente() {
  const db = useAppDB();
  
  // Exemplo: Carregar registros de ponto
  useEffect(() => {
    const carregarDados = async () => {
      const entries = await db.getTimeEntries();
      console.log(entries);
    };
    
    carregarDados();
  }, []);
  
  // Exemplo: Adicionar um registro
  const adicionarRegistro = async (novoRegistro) => {
    await db.saveTimeEntry(novoRegistro);
  };
  
  // ...
}
```

## Migração de Dados

A aplicação foi configurada para migrar automaticamente os dados do localStorage para o IndexedDB na primeira execução após a atualização. Isso garante que nenhum dado seja perdido durante a transição.

## Monitoramento

O componente `DBStatus.tsx` foi adicionado ao Dashboard para exibir o status atual do banco de dados, mostrando a quantidade de registros em cada store.

## Considerações de Desempenho

- As operações do IndexedDB são assíncronas, então sempre use `async/await` ou Promises ao interagir com o banco de dados.
- Para operações em lote, considere usar transações para melhor desempenho e integridade dos dados.

## Solução de Problemas

Se encontrar problemas com o IndexedDB:

1. Verifique o console do navegador para erros específicos
2. Tente limpar o banco de dados do navegador (nas ferramentas de desenvolvedor)
3. Verifique se o navegador suporta IndexedDB (todos os navegadores modernos suportam)

## Próximos Passos

- Implementar sincronização com backend (quando disponível)
- Adicionar mecanismo de backup/exportação dos dados
- Melhorar o sistema de consultas para relatórios mais complexos