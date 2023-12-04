import express from 'express'
import { UserModel } from '../models/Users.js'
import { teamModel } from '../models/Team.js';
const router = express.Router()

router.get('/users', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Default to page 1
      const pageSize = 20;
  
      const users = await UserModel.find({})
                              .sort({ id: 1 }) // Sort by ascending order of the id field
                              .skip((page - 1) * pageSize)
                              .limit(pageSize);
                          
      res.json(users);
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  });

  router.get('/users/filtered-users', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Default to page 1
      const pageSize = 20;
  
      // Extract filter criteria from query parameters
      const { domain, availability, gender } = req.query;
  
      // Build the filter object based on the provided criteria
      const filter = {};
      if (domain) {
        filter.domain = domain;
      }
      if (availability !== undefined) {
        filter.available = availability === 'true'; // Convert the string to a boolean
      }
      if (gender) {
        filter.gender = gender;
      }
  
      // Use the filter object in the query
      const users = await UserModel.find(filter)
        .sort({ id: 1 }) // Sort by ascending order of the id field
        .skip((page - 1) * pageSize)
        .limit(pageSize);
  
      res.json(users);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

router.post('/users', async(req,res) => {
    const {id, first, last,email,gender,avatar,domain,available} = req.body
    console.log(req.body)
    try {
        const user = new UserModel({
           id: id,
           first_name: first,
           last_name: last,
           email: email,
           gender: gender,
           avatar: avatar,
           domain: domain,
           available: available
        })
        await user.save()
        res.status(201).json({message: 'User Created'})
    } catch (error) {
        console.log(error)
        res.json(error)
    }
})

router.delete('/users/:id', async(req,res) => {
  const {id: id} = req.params
  console.log(id)
  try {
    const user = await UserModel.findByIdAndDelete(id)
    
    res.status(201).json({message: 'User Deleted'})
  } catch (error) {
    console.log(error)
  }
})

router.put('/users/:id', async (req, res) => {
  const { id: userId } = req.params;
  const { id, first, last, email, gender, avatar, domain, available } = req.body;
  
  
  try {
    const user = await UserModel.findByIdAndUpdate(userId,{
      id: id,
      first_name: first,
      last_name: last,
      email: email,
      gender: gender,
      avatar: avatar,
      domain: domain,
      available: available
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/users/team', async (req, res) => {
  const {id, userId } = req.body;
  console.log(req.body);
  try {
    // Convert teamId to an integer
    const teamIdInt = parseInt(id, 10);

    // Find the team by ID
    let team = await teamModel.findOne({ team_id: teamIdInt });
    if (!team) {
      // If team not found, create a new one
      team = new teamModel({
        team_id: teamIdInt,
        team: [userId]
      });
    } else {
      // If team found, update it
      team = await teamModel.findByIdAndUpdate(
        team._id,
        { $push: { team: userId } },
        { new: true } // Return the updated document
      );
    }

    await team.save();
    res.status(201).json({ message: 'User Added to Team' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users/team/:id', async(req,res) => {
    const {id} = req.params.id
  try {
       const team = await teamModel.findOne({ team_id: id }).populate({
        path: 'team',
        select: 'first_name last_name domain available avatar' , // Specify the fields you want to select
      })
      
       
       res.json(team)
  } catch (error) {
    console.log(error)
  }
})

router.get('/users/find', async(req,res) => {
  try {
    const searchTerm = req.query.name

    if(!searchTerm){
      return res.status(400).json({ error: 'Search term is required' });
    }

    const regex = new RegExp(searchTerm, 'i');
    const response = await UserModel.find({ first_name: { $regex: regex } });

    res.json(response);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'An error occurred' });
  }
})

export {router as UserRouter}