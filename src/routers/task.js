const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

router.post('/tasks', auth, async (req,res)=>{
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner:req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/tasks/:id',auth,async (req,res)=>{
    const updates1 = Object.keys(req.body)
    const allowedUpdates1 = ['description','completed']
    const isValidOperation1 = updates1.every((update)=> allowedUpdates1.includes(update))
    if(!isValidOperation1){
        return res.status(400).send({'error':'Inavlid Update!'})
    }
    try {
        // const task = await Task.findByIdAndUpdate(req.params.id)
        const task = await Task.findOne({ _id:req.params.id, owner:req.user._id})
        updates1.forEach((update)=>task[update]=req.body[update])
        await task.save()
        // const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        if(!task){
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/tasks', auth ,async (req,res)=>{
    const match={}
    const sort={}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const part = req.query.sortBy.split(":")
        sort[part[0]] = part[1] === 'desc' ? -1 : 1
    }
    try {
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/tasks/:id',auth, async (req,res)=>{
    const _id= req.params.id
    try {
        // const task = await Task.findById(_id1)
        const task = await Task.findOne({ _id,owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.status(201).send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/tasks/:id',auth, async (req,res)=>{
    try {
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!task){
            res.status(404).send()
        }
        res.status(201).send('Deleted task'+ task)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router