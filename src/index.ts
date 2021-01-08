// MeatadataInfo comes from here: https://wiki.multimedia.cx/index.php?title=FFmpeg_Metadata

import { exec } from 'child_process'
import { metadataObj } from './interfaces'
import * as path from 'path'

const ffmpegPath = path.join(__dirname, '../data/ffmpeg.exe')

/**
 * Returning string of a command from the given params
 * @param {string} command Command that should be executed
 * @param {object} attr Object with name and value of the option that should be added
 */
export function getExecString(command: string, attr: {name?:string, value?:string}[]): string {
  let execStr = command

  attr.map((singleatt, index) => {
    // Adding space before if name or value is set
    if(singleatt.name !== "" || singleatt.value !== "") execStr += " "
    if(singleatt.name && singleatt.name !== "") execStr += `-${singleatt.name}`
    if(singleatt.value && singleatt.value !== "") execStr += `${singleatt.name === "" ? "" : " "}${singleatt.value}`    
  })

  return execStr
}

/**
 * File Takes in Path and return object with metadata
 *
 * @param {string} filePath path to the File that you want the metadat from
 * @returns {object} Return an object with metadata in the format {<metadataname>:<metadatavalue>}
 */
export async function getMetaDataFromFile(filePath:string): Promise<metadataObj> {
  const command = getExecString(ffmpegPath, [
    {
      name: "i",
      value: filePath
    },
    {
      name: "f",
      value: "ffmetadata"
    },
    {
      name: "",
      value: "pipe:1"
    }
  ])

  return new Promise((resolve) => {
    exec(command, (_, stdout, __) => {
      const output: metadataObj = {}
      stdout
        //removing Header
        .replace(";FFMETADATA1\n", "")
        //splitting by new Line
        .split("\n")
        .map(str => {
          if (str == '') return true
          const splitstr = str.split("=")
          //replacing - and _ in Name with Highercase letter
          output[splitstr[0]
            .replace(/(-|_)[a-zA-Z]/g, (rep) => {
              return rep.replace('-','').replace('_','').toUpperCase()
            })
          ] = splitstr[1]
      
          return true
        })

      resolve(output)
    })
  })
}

/**
 * Adding Metadata to File
 * @param {string} inFilePath Path to file that should be taken as base
 * @param {string} outFilePath Path to file that should be the output file
 * @param {metadataObj} metaData Object with the Metadata that should be added
 */
export async function setMetaDataToFile(inFilePath: string, outFilePath: string, metaData: metadataObj) {
  function getCommand() {
    let commandArray = [
      {
        name: "i",
        value: inFilePath
      }
    ]
  
    // Adding metadate to commandArray
    Object.keys(metaData).map((value) => {
      commandArray.push({
        name: "metadata",
        value: `${value}=\"${metaData[value]}\"`
      })
      return true
    })
    
    // Adding Coppy statement, output path and the order to override to commandArray
    commandArray = commandArray.concat([
        {
          name: "c",
          value: "copy"
        },
        {
          name: "",
          value: outFilePath
        },
        {
          name: "y",
          value: ""
        }
    ])
  
    return getExecString(ffmpegPath, commandArray)
  }
  // Generationg command
  const command = getCommand()

  console.log('command: ', command)
  return new Promise(resolve => {
    // Removing outfile if exists
    exec(command, (err, stdout, stderr) => {
      if (err) console.error('err: ', err)
      // if (stderr) console.error('stderr: ', stderr)

      resolve(stdout)
    })
  })
}