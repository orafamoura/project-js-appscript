var username = "<username da credencial que voce criou no n8n>";
//configurações do projeto > propriedades do script - adicione a chave e o valor para referenciar o password
var password = PropertiesService.getScriptProperties().getProperty("N8N_PASSWORD");
var sendEmail = [""]; //Se quiser adicionar um email no json, se não excluir essa linha e a linha 32 - emailDestino

function onFormSubmit(e) {
  var formData = e.values;
  let dataSeparada = formData[1].split("/")
  const dia  = parseInt(dataSeparada[0], 10);
  const mes  = parseInt(dataSeparada[1], 10);
  const ano  = parseInt(dataSeparada[2], 10);

  Logger.log(mes)
  var dataReformulada = new Date(ano,mes - 1,dia)
  Logger.log("Evento recebido: " + JSON.stringify(e));
  Logger.log("Evento recebido: " + (dataReformulada));

  var formularioNomeado = {
    dataInscricao: formData[0],
    dataEntrada: dataReformulada,
    nomeAluno: formData[2],
    closer: formData[3],
    valorMatricula: formData[4],
    numTelefone: formData[5],
    valorMensalidade: formData[6],
    quantMensalidade: formData[7],
    fonte: formData[8],
    sdr: formData[9],
    momentoAtual: formData[10],
    segmento: formData[11],
    especificacao: formData[12],
    dadosContrato: formData[13],
    emailDestino: sendEmail[0]
  }

  var authHeader = authenticateUser(username, password);

  var options = {
    method: "post",
    headers: {
      "Authorization": authHeader
    },
    contentType: "application/json",
    payload: JSON.stringify(formularioNomeado),
    muteHttpExceptions: true, 
  };
  
  try {
    var response = UrlFetchApp.fetch(
      "https://n8n...<seu url do webhook>",
      options
    );
    Logger.log("Status: " + response.getResponseCode());
    Logger.log(response.getContentText());
  } catch (error) {
    Logger.log("Erro ao enviar: " + error);
  }
}

function authenticateUser(username, password){
  var token = username + ":" + password;
  var hash = Utilities.base64Encode(token); 
  return "Basic " + hash;
}
