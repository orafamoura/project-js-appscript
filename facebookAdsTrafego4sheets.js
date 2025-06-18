function getFacebookAdsInsights() {
  const spreadsheet = SpreadsheetApp
    .openById("<ID PLANILHA SHEETS>");
  const sheet = spreadsheet.getSheetByName("nova");
  
  sheet.clear();
  sheet.appendRow([
    "Data Inicial",
    "Data Final",
    "Evento ou Mentoria",
    "Total Gastos",
    "Total Impressões",
    "mês"
  ]);
  
  const accessToken = "<ACCESS_TOKEN>";
  const adAccountId = "<ID_COUNT ex:act_...>";
  const today = new Date();
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const startDate = Utilities.formatDate(yearStart, "GMT-3", "yyyy-MM-dd");
  const endDate   = Utilities.formatDate(today,     "GMT-3", "yyyy-MM-dd");
  
  const timeRangeParam = encodeURIComponent(
    JSON.stringify({ since: startDate, until: endDate })
  );
  
  // Resgata nome da campanha, gastos com a campanha e impressões
  let url = `https://graph.facebook.com/v22.0/${adAccountId}/insights` +
            `?fields=campaign_name,spend,impressions` +
            `&level=campaign` +
            `&time_range=${timeRangeParam}` +
            `&time_increment=monthly` +
            `&access_token=${accessToken}`;
  
  const options = { muteHttpExceptions: true };
  
  do {
    const res = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(res.getContentText());
    if (json.error) throw new Error(json.error.message);
    
    // DataInicial/DataFinal/nomeCampanha/totalGastos/TotalImpressões
    json.data.forEach(entry => {
      const spendRaw = parseFloat(entry.spend) || 0;
      sheet.appendRow([
        entry.date_start,
        entry.date_stop,
        entry.campaign_name || "",
        spendRaw.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        parseInt(entry.impressions, 10) || 0
        ]);
    });
    
    url = json.paging && json.paging.next
      ? json.paging.next
      : null;
    
  } while (url);
  
  // Formula para mostrar o mês que foi cada linha
  sheet.getRange("F2")
       .setFormula('=ARRAYFORMULA(IF(B2:B<>"";MONTH(B2:B);""))');
  
  Logger.log("Importação completa!");
}
