const mysql=require('mysql');
const connection=mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: '',
    database:'intergrami_web'
});
var express= require('express');
var bodyParser=require('body-parser');
var request=require('request');
//change
const APP_TOKEN='EAACZCFcmLbAkBAGrppRZCU1G3yyIPbzbjtawurJ4HlXLV5fmRoWPxrRiqBbI2ZBmNkiR9ua2ojKjZAClOsRZBLlqP3VZAVqgZAN3oyU7dRZB7mizZBjZBYc65ZBLsSRJJO1dmqZCtShYa63MVnj1Phz0hGsaVeZBNDXpC6B6DXLaCvZApJwPqvSrJyKw1u';

var app=express();

app.use(bodyParser.json());

app.listen(3000,function() {
    console.log("Servidor  en 3000");
    getOrderInformation(getTopProducts());
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

//valida eventos
app.post('/webhook',function(req,res){
    var data=req.body;
    console.log('webhook')
    if(data.object=='page'){
        data.entry.forEach(function(pageEntry){
            pageEntry.messaging.forEach(function(messagingEvent){
                if(messagingEvent.message){
              //  reciveMessage(messagingEvent);
                }
            });
        });
        res.sendStatus(200);
    }//end if
});

//recive mensaje
function reciveMessage(event){
    var senderID=event.sender.id;
    var messageText=event.message.text;
    console.log('Sender: '+senderID);
    console.log('Message: '+messageText);
    evaluateMessage(senderID,messageText);
}
//                  No tocar para arriba >:v


function evaluateMessage(recipientId,message) {
    var finalMessage='';
    if(isContain(message,'ayuda')){
        console.log('Evaluate:    Ayuda---');
         finalMessage='¿En qué puedo ayudarte?\nPor ejemplo puedes:\n1. Consultarme detalles de tus compras: Detalle #numero_de_pedido\n2. Ver el estatus de alguno de tus productos: Producto #numero_producto #token\n 3. Productos nuevos: Novedades';
    sendMessageText(recipientId,finalMessage);}
    else 
    if(isContain(message, 'novedades')||isContain(message,'nuevos')){
        finalMessage='Novedades :D';
        //sendMessageText(recipientId,finalMessage);
        sendMessageText2(recipientId);
    }
    //sendMessageText(recipientId,finalMessage);



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
//Templates
function sendMessageText2(recipientId){
    var messageData={
        recipient:{
            id:recipientId
        },
        message:{
            attachment:{
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [
                        elementTemplate(1,"Hello world",10,"nothing"),
                        elementTemplate(1,"Hello world",10,"nothing"),
                        elementTemplate(1,"Hello world",10,"nothing"),
                        elementTemplate(1,"Hello world",10,"nothing"),
                        elementTemplate(1,"Hello world",10,"nothing")
                    ]
                }
            }
        }
        };
    
    callSendApi(messageData);
}
function elementTemplate(id,product_title,pricing, description){
    return{
        title: product_title,
        subtitle: description,
        item_url: "localhost/intergrami/public/products/"+id,
        image_url: "localhost/intergrami/public/products/"+id,
        buttons: [buttonsTemplate(pricing)],
    }
}
function buttonsTemplate(label_button){
    return{
        type: "web_url",
        url:"https://www.google.com",
        title: label_button
    }
}

//

function isContain(sentence,wordToFind){
    if(sentence!=null) 
    return ""+sentence.indexOf(wordToFind)>-1 ;
    else return false;
}

function getOrderInformation(sql){
    connection.connect(function(err){
        if(err) throw err;
        connection.query(sql,function(err,result,fields){
            if(err) throw err;
            Object.keys(result).forEach(function(key){
                var row=result[key];
                resu=row.description;   
                console.log("Resultado                  "+row.id);
            });
        })  
    });
}

function getTopProducts(){
    return 'Select id,title, pricing, description from products order by id DESC limit 5';
}
//Strings functions :D
function getSubstringFromString(message,separetor){
    for (var i = 0; i < message.length; i++)
        if(message.charAt(i)==separetor)
           return message.substring(i+1);
}
