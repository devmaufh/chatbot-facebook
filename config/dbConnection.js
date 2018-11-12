const mysql=require('mysql');
module.exoirts()=>{
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database :'intergrami_web'         
    });
}