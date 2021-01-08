import * as assert from "assert"
import { getExecString, getMetaDataFromFile } from '../index'
import * as path from 'path'

describe('getExecString: ', () => {
  it('Basic Functionality', () => {
    const result = getExecString('testcom', [
      {
        name: "t",
        value: "test"
      }
    ])
    const expected = "testcom -t test"

    assert.equal(result, expected)
  })
  it('Basic Functionality - multiple attributes', () => {
    const result = getExecString('testcom', [
      {
        name: "t",
        value: "test"
      },
      {
        name: "d",
        value: "tert"
      },
      {
        name: "x",
        value: "tunt"
      }
    ])
    const expected = "testcom -t test -d tert -x tunt"

    assert.equal(result, expected)
  })
  it('empty attributes name and/or value', () => {
    const result = getExecString('testcom', [
      {
        name: "",
        value: "test"
      },
      {
        name: "d",
        value: ""
      },
      {
        name: "",
        value: ""
      }
    ])
    const expected = "testcom test -d"

    assert.equal(result, expected)
  })
})

describe('getMetaDataFromFile', () => {
  it('Basic Functionlity - Should return Object with Metadata', async () => {
    const pathToFile = path.join(__dirname, 'test.mp3')

    const result = await getMetaDataFromFile(pathToFile)
    const expected = {
      albumArtist: 'AlbumInterpret',
      encoder: 'Lavf58.45.100',
      title: 'TestTitle',
      track: '1'
    }

    assert.deepEqual(expected, result)
  })
  it('File not There - Should return empty Object', async () => {
    const pathToFile = path.join(__dirname, 'NotThere.mp3')

    const result = await getMetaDataFromFile(pathToFile)
    const expected = {}

    assert.deepEqual(expected, result)
  })
})