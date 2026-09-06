const express = require('express')
const router = express.Router()

//index route
router.get('/',(req,res)=>{
    res.send('hi i am index root')
})
//show route
router.get('/:id',(req,res)=>{
    res.send('hi i am show root')
})
//post
router.post('/',(req,res)=>{
    res.send('hi i am post root')
})
//delete
router.delete('/:id',(req,res)=>{
    res.send('hi i am delete root')
})

module.exports = router