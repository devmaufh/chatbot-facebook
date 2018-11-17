const mysql=require('mysql');
var express= require('express');
var bodyParser= require('body-parser');
var request= require('request');
const APP_TOKEN='EAACZCFcmLbAkBAGrppRZCU1G3yyIPbzbjtawurJ4HlXLV5fmRoWPxrRiqBbI2ZBmNkiR9ua2ojKjZAClOsRZBLlqP3VZAVqgZAN3oyU7dRZB7mizZBjZBYc65ZBLsSRJJO1dmqZCtShYa63MVnj1Phz0hGsaVeZBNDXpC6B6DXLaCvZApJwPqvSrJyKw1u';

const connection=mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: '',
    database:'intergrami_web'
});
connection.connect();
var app=express();
app.use(bodyParser.json());
app.listen(3000, function(){
    console.log('listening on 3000');
    //productsTopQuery();
    
});
app.get('/',function(req,res){
    res.send('Welcomte to intergrami bot')
});
//valida servidor
app.get('/webhook',function(req,res){
    if(req.query['hub.verify_token']=='tok'){
        res.send(req.query['hub.challenge']);
    }else{
        res.send('No tienes permitido el acceso');
    }
});

app.post('/webhook',function(req,res){
    var data=req.body;
    console.log('webhook')
    if(data.object=='page'){
        data.entry.forEach(function(pageEntry){
            pageEntry.messaging.forEach(function(messagingEvent){
                if(messagingEvent.message){
                    reciveMessage(messagingEvent);
                }
            });
        });
        res.sendStatus(200);
    }//end ifx
});

//recive mensaje
function reciveMessage(event){
    var senderID=event.sender.id;
    var messageText=event.message.text;
    console.log('Sender: '+senderID);
    console.log('Message: '+messageText);
    evaluateMessage(senderID,messageText);
}
function evaluateMessage(recipientId,message) {
    var finalMessage='';
    if(isContain(message,'ayuda')){
        console.log('Evaluate:    Ayuda---');
         finalMessage='¿En qué puedo ayudarte?\nPor ejemplo puedes:\n1. Consultarme detalles de tus compras: Detalle #numero_de_pedido\n2. Ver el estatus de alguno de tus productos: Producto #numero_producto #token\n 3. Productos nuevos: Novedades';
    sendMessageText(recipientId,finalMessage);
    }
    else 
    if(isContain(message, 'novedades')||isContain(message,'nuevos')){
        finalMessage='Novedades :D';
        //sendMessageText(recipientId,finalMessage);
        productsTopQuery(recipientId);
        //sendMessageText2(recipientId);
    }
    //sendMessageText(recipientId,finalMessage)
}
function isContain(sentence,wordToFind){
    if(sentence!=null) 
    return ""+sentence.indexOf(wordToFind)>-1 ;
    else return false;
}







function productsTopQuery(recipientId){
    connection.query('Select * from products order by id DESC limit 5', function(err,result){
        readQueryResult(result,recipientId);
    });
}
function readQueryResult(result,recipientId){
    var templates=[];
    Object.keys(result).forEach(function(key) {
        var row= result[key];
        //console.log(row.id+" log");
        templates.push({
            title: row.title,
            image_url: "localhost/intergrami/public/products/images/"+row.id+"."+row.extension,
            subtitle: row.description,
            item_url: "localhost/intergrami/public/products/"+row.id,
            
            buttons: [buttonsTemplate(row.pricing,row.id)],
        });
    });
    //console.log("READ QUERYYYY"+JSON.stringify(templates));

    sendMessageTemplate(recipientId,templates)
}
function sendMessageText(recipientId,message){
    console.log('sendmessageText');
    var messageData={
        recipient:{
            id:recipientId
        },
        message:{
            text:message
        }
            //text:message
        };
    
    callSendApi(messageData);
}
function sendMessageTemplate(recipientId,templates){
    //console.log("SEND MESSAGEEEEE"+JSON.stringify(templates));

    var messageData={
        recipient:{
            id:recipientId
        },
        message:{
            attachment:{
                type: "template",
                payload:{
                    template_type: "generic",
                    elements:templates
                }
            }
        }
    };

    console.log("MENSAJE FINAAAL"+JSON.stringify(messageData));
    callSendApi(messageData);
}
function callSendApi(messageData){
    console.log('call_send_api');
    request({
        uri:'https://graph.facebook.com/v2.6/me/messages',
        qs:{access_token:APP_TOKEN},
        method:'POST',
        json:messageData
    },function(error,response,data){
        if(error){
           console.log('Error enviando msg');
        }else{
            console.log('Mensaje exitoso');
        }
    });
}
function buttonsTemplate(label_button,id){
    return{
        type: "web_url",
        url:"localhost/intergrami/public/products/"+id,
        title: "$"+label_button
    }
}