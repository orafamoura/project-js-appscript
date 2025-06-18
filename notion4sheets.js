function myFunction() {
  Logger.log('Iniciando execução do script');
  
  // Configuração
  const NOTION_API_KEY = ''; // Seu token da API Notion
  const DATABASE_ID = ''; // ID do banco de dados
  
  // Função para buscar dados do Notion
  function fetchNotionData() {
    Logger.log('Iniciando requisição à API do Notion');
    const url = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      muteHttpExceptions: true
    };

    let allData = []; // Armazena todos os resultados
    let hasMore = true; // Controle para verificar se há mais páginas
    let startCursor = null;

    try {
      while (hasMore) {
        // Adicionar o cursor no corpo da requisição se ele existir
        const payload = startCursor ? { start_cursor: startCursor } : {};
        options.payload = JSON.stringify(payload);
        
        // Realiza a requisição
        const response = UrlFetchApp.fetch(url, options);
        const responseData = JSON.parse(response.getContentText());

        Logger.log('Status da resposta: ' + response.getResponseCode());
        Logger.log('Dados retornados: ' + JSON.stringify(responseData));

        // Adicionar os resultados na lista
        allData = allData.concat(responseData.results.map(page => ({
          DataDaEntrada: page.properties["Data de Entrada"].date?.start || '',
          Nome: page.properties["Nome do Aluno"].title[0]?.text?.content || '',
          Telefone: page.properties.Telefone.phone_number || '',
          Status: page.properties["Status Matrícula"].select?.name || '',
          ValorMensalidade: page.properties["Valor da Mensalidade"].number || '',
          ValorDaMatricula: page.properties["Valor de Matrícula"].number || '',
          DiaDoVencimento: page.properties["Dia do vencimento"].number || '',
          DataDoCancelamento: page.properties["Data de Cancelamento"].date?.start || '',
          QuantidadeMensalidade: page.properties["Quantidade de Mensalidades"].number || '',
          SDR: page.properties.SDR.rich_text[0]?.text?.content || '',
          MotivoDoCancelamento: page.properties["Motivo do Cancelamento"].select?.name || '',
          Closer: page.properties.Closer.rich_text[0]?.text?.content || '',
          Fonte: page.properties.Fonte.rich_text[0]?.text?.content || '',
          QuantParcelasPagas: page.properties["Quant. de parcelas pagas"].select?.name || '',
          QuantEventosPresenciais: page.properties["Quant. de eventos presenciais"].select?.name || '',
          Cpf: page.properties["CPF"].rich_text[0]?.text?.content || '',
          AlunosMLS: page.properties["Aluno MLS"].checkbox || 'FALSE',
          MensalidadeJaneiro: page.properties["Mensalidade Janeiro"].select?.name || '',
          MensalidadeFevereiro: page.properties["Mensalidade Fevereiro"].select?.name || '',
          MesAtual: page.properties["Mês Atual"].select?.name || '',
          MensalidadeMarco: page.properties["Mensalidade Marco"].select?.name || '',
          MensalidadeAbril: page.properties["Mensalidade Abril"].select?.name || '',
          MensalidadeMaio: page.properties["Mensalidade Maio"].select?.name ||'',
        })));

        // Log após a concatenação
        Logger.log('Dados adicionados nesta iteração: ' + JSON.stringify(allData));

        // Atualizar o controle de paginação
        hasMore = responseData.has_more;
        startCursor = responseData.next_cursor || null; // Atualiza o cursor
      }

      return allData;
    } catch (e) {
      Logger.log('Erro na requisição: ' + e.toString());
      return [];
    }
  }

  // Função para escrever os dados no Google Sheets
  function updateSheet() {
    Logger.log('Iniciando atualização da planilha');
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); //script tem que estar linkado com o sheets

    const data = fetchNotionData();

    Logger.log('Dados recuperados da API: ' + JSON.stringify(data));  // Log dos dados recuperados
    
    // Limpar a planilha
    function clearSheetFromRow2() {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      const lastRow = sheet.getLastRow(); // Obtém a última linha com dados
      const lastColumn = 23; // Obtém a última coluna com dados

      if (lastRow > 1) { // Garante que haja algo para limpar a partir da linha 2
        sheet.getRange(2, 1, lastRow - 1, lastColumn).clearContent(); // Limpa o conteúdo
      }
    }
    clearSheetFromRow2();
        
    // Inserir dados
    data.forEach(row => {
      sheet.appendRow([row.DataDaEntrada, row.Nome, row.Telefone, row.Status, row.QuantParcelasPagas, row.ValorMensalidade, row.ValorDaMatricula, row.DiaDoVencimento, row.DataDoCancelamento, row.QuantidadeMensalidade, row.SDR, row.MotivoDoCancelamento, row.Closer, row.Fonte, row.QuantEventosPresenciais, row.AlunosMLS, row.Cpf, row.MesAtual, row.MensalidadeJaneiro, row.MensalidadeFevereiro, row.MensalidadeMarco, row.MensalidadeAbril, row.MensalidadeMaio]);
    });
    Logger.log('Dados atualizados com sucesso!');
  }

  // Chama a função para atualizar a planilha
  updateSheet();
}

