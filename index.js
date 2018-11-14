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
    //getOrderInformation(ProductsById(1));
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
                reciveMessage(messagingEvent);
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
function evaluateMessage(recipientId,message) {
    var finalMessage='';
    if(isContain(message,'ayuda')){
         finalMessage='¿En qué puedo ayudarte?\nPor ejemplo puedes:\n1. Consultarme detalles de tus compras: Detalle #numero_de_pedido\n2. Ver el estatus de alguno de tus productos: Producto #numero_producto #token\n 3. Productos nuevos: Novedades';
    //if(isContain(message,'Producto')
    sendMessageText(recipientId,finalMessage);}
    else{
        sendMessageText2(recipientId,finalMessage);
    }
}


function sendMessageText(recipientId,message){
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
    request({
        uri:'https://graph.facebook.com/v2.6/me/messages',
        qs:{access_token:APP_TOKEN},
        method:'POST',
        json:messageData
    },function(error,response,data){
        if(error){
           // console.log('Error enviando msg'+JSON.stringify(response));
        }else{
            //console.log('Mensaje exitoso'+ JSON.stringify(response));
        }
    });
}



//Templates
function sendMessageText2(recipientId,message){
    var messageData={
        recipient:{
            id:recipientId
        },
        message:{
            attachment:{
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: [elementTemplate()]
                }
            }
        }
        };
    
    callSendApi(messageData);
}
function elementTemplate(){
    return{
        title: "TEst template",
        subtitle: "hekklo world js",
        item_url: "https://www.pixabay.com",
        image_url: "https://cdn.pixabay.com/photo/2018/10/01/12/18/leaf-3716035_960_720.jpg",
        buttons: [buttonsTemplate()],
    }
}
function buttonsTemplate(){
    return{
        type: "web_url",
        url:"https://www.google.com",
        title: "Ver"
    }
}

//

function isContain(sentence,wordToFind){
    //return ""+sentence.indexOf(wordToFind)>-1;
    return false;
}

function getOrderInformation(sql){
    connection.connect(function(err){
        if(err) throw err;
        connection.query(sql,function(err,result,fields){
            if(err) throw err;
            Object.keys(result).forEach(function(key){
                var row=result[key];

                //setValue(response_query,row.description);
                //resu=row.description;
                //console.log("Resultado                  "+resu);
            });
        })  
    });
}
function ProductsById(id){
    return 'Select * from products where id='+id;
}

function AllProducts(user_id){
    return 'Select * from products where user_id='+user_id;
}
//Strings functions :D
function getSubstringFromString(message,separetor){
    for (var i = 0; i < message.length; i++)
        if(message.charAt(i)==separetor)
           return message.substring(i+1);
}
