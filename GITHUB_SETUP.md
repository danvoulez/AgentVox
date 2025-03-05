# Configuração do GitHub para o AgentVox

Para configurar o repositório no GitHub e fazer o push do código, siga estas etapas:

## 1. Criar um novo repositório no GitHub

1. Acesse [GitHub](https://github.com) e faça login na sua conta
2. Clique no botão "+" no canto superior direito e selecione "New repository"
3. Preencha os seguintes campos:
   - Repository name: `AgentVox` (exatamente como escrito)
   - Description: "Advanced AI Assistant Platform with memory and evolution capabilities"
   - Visibilidade: Escolha entre Public ou Private
   - Não inicialize o repositório com README, .gitignore ou licença

4. Clique em "Create repository"

## 2. Conectar o repositório local ao GitHub

Após criar o repositório no GitHub, execute os seguintes comandos no terminal:

```bash
# Certifique-se de estar no diretório do projeto
cd /Users/Amarilho/Documents/2_AgentVox

# Remova a configuração remota atual (se existir)
git remote remove origin

# Adicione o novo repositório remoto
git remote add origin https://github.com/danvoulez/AgentVox.git

# Faça o push do código para o GitHub
git push -u origin master
```

Se você preferir usar SSH em vez de HTTPS, use o seguinte URL:
```
git remote add origin git@github.com:danvoulez/AgentVox.git
```

## 3. Verificar a configuração do CI/CD

Depois que o código estiver no GitHub:

1. Vá para a aba "Actions" no seu repositório GitHub
2. Você deverá ver os workflows de CI/CD configurados e prontos para execução
3. Para que o CD funcione corretamente, adicione os seguintes secrets nas configurações do repositório:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - VERCEL_TOKEN
   - SUPABASE_ACCESS_TOKEN
   - SUPABASE_PROJECT_ID

## 4. Configurar proteção de branches (opcional)

Para garantir a qualidade do código:

1. Vá para Settings > Branches
2. Adicione uma regra de proteção para o branch `master`/`main`
3. Exija revisões de pull request antes de mesclar
4. Exija que os status checks passem antes de mesclar

---

Após seguir essas etapas, seu código estará no GitHub com CI/CD configurado e pronto para desenvolvimento colaborativo.
