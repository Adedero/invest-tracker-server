#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs')
const path = require('path')

const modelsDir = path.resolve('src/models')

// Main function to create the model
const createModel = (modelName) => {
  if (!modelName) {
    console.error('Error: Please provide a model name.')
    process.exit(1)
  }

  const parts = modelName.split('-')
  const model = parts
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
  //const model = modelName[0].toUpperCase() + modelName.slice(1) // Capitalize first letter
  const modelLowercase = modelName.toLowerCase() // Convert to lowercase
  const modelPath = path.join(modelsDir, `${modelLowercase}.model.ts`) // Path for the model file

  const modelTemplate = `
// ${modelLowercase}.model.ts
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class ${model} {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  //Add columns

  @Column()
  name!: string
  
  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
`

  // Create the models directory if it doesn't exist
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true })
    console.log(`Created directory: ${modelsDir}`)
  }

  // Create the model file
  if (!fs.existsSync(modelPath)) {
    fs.writeFileSync(modelPath, modelTemplate.trim())
    console.log(`Created file: ${modelPath}`)
  } else {
    console.log(`File already exists: ${modelPath}`)
  }
}

// Get the model name from the command-line arguments
const args = process.argv.slice(2)
const modelName = args[0]

createModel(modelName)
