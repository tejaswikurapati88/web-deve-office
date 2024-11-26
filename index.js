const express= require('express')
const path= require('path')
const {open}= require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt= require('bcrypt')
const jwt= require('jsonwebtoken')
const cors= require('cors')

const app = express()

app.use(express.json())
app.use(cors())

const dbFile= path.join(__dirname, 'users.db')
let db

const initiatServer= async ()=>{
    try{
        db= await open({
            filename: dbFile,
            driver: sqlite3.Database
        })
        app.listen(3000, ()=>{
            console.log('Server is running at http://localhost:3000')
        })
    }catch(e){
        console.log(`Server Error: ${e.message}`)
        process.exit(1)
    }
}
initiatServer()

// users table
app.get('/api/users/', async (req, res)=>{
    const sqlGet= `SELECT * FROM users;`
    const usersTable= await db.all(sqlGet)
    res.send(usersTable)
})

// user registration
app.post('/api/signup/', async (req, res)=>{
    const {id, username, email ,password}= req.body 
    const hashedPassord = await bcrypt.hash(password, 10)
    const sqlgetUser= `SELECT * FROM users where name= '${username}'`
    const userData= await db.get(sqlgetUser)
    if (userData === undefined){
        const createSQL= `INSERT INTO users (id, name, email, password) 
                VALUES (${id}, '${username}', '${email}', '${hashedPassord}');`
        db.run(createSQL)
        res.status(200).json({message: 'User signned up Successfully'})
    }else{
        res.status(400).json({message: 'username already exists, Please signin'})
    }
    
})

// user login
app.post('/api/signin/', async (req, res)=>{
    const {username, password}= req.body 
    console.log(password)
    const sqlgetUser= `SELECT * FROM users where name= '${username}'`
    const userData= await db.get(sqlgetUser)
    if (userData === undefined){
        res.status(400).json({message: 'invaid username, please signup'})
    }else{
        const comparepass= await bcrypt.compare(password , userData.password, (err, resp)=>{
            if (err){console.log(`Comparision error: ${err}`)}
        })
        if (comparepass){
            res.status(200).json({message: 'user signin success'})
        }else{
            res.status(400).json({message: 'invalid password'})
        }
    }
    
})

