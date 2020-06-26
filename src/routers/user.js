const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const avatar = require('../middleware/avatar')
const sharp = require('sharp')
const { sendWelcomeEmail, sendGoodByeEmail } = require('../emails/account')

router.post('/users', async (req,res)=>{
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.authToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/logout',auth,async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutall',auth,async(req,res)=>{
    try {
        req.user.tokens.splice(0,req.user.tokens.length)
        await req.user.save()
        res.send()
    } 
    catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/me',auth ,async (req,res)=>{
   res.send(req.user)
})

router.patch('/users/me',auth, async (req,res)=>{
    const updates =Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({'error':'Invalid update!'})
    }
    try {
        // const user = await User.findByIdAndUpdate(req.params.id)
        updates.forEach((update)=> req.user[update] = req.body[update])
        await req.user.save()
        // const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        // if(!user){
        //     res.status(404).send()
        // }
        res.status(201).send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/users/me',auth,async (req,res)=>{
    try {
        await req.user.remove()
        sendGoodByeEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/login',async (req, res) =>{
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.authToken()
        res.status(200).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/me/avatar',auth  ,avatar.single('avatar'),async(req,res)=>{
    // req.user.avatar = req.file.buffer
    const buffer = await sharp(req.file.buffer).resize({ width:250, height:250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error: error.message})
})     

router.delete('/users/me/avatar',auth,async(req,res)=>{
        req.user.avatar = undefined
        await req.user.save()
        res.status(200).send()
})

router.get('/users/:id/avatar',async(req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/jpg')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router