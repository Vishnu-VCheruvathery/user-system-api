
import mongoose from 'mongoose'

const teamSchema = mongoose.Schema({
       team_id: {
             type: Number
       },
       team: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
       }]
})

export const teamModel = mongoose.model('Team', teamSchema)